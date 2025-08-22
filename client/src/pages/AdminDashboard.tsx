import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  FileText, 
  Trophy, 
  Megaphone, 
  Users, 
  Upload,
  Plus,
  Download,
  Eye,
  Trash2,
  Settings
} from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Content, ContentFile } from "@shared/schema";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Content queries
  const notesQuery = useQuery({
    queryKey: ['/api/admin/content', 'notes'],
    queryFn: () => apiRequest('/api/admin/content?type=notes'),
  });

  const testsQuery = useQuery({
    queryKey: ['/api/admin/content', 'test'],
    queryFn: () => apiRequest('/api/admin/content?type=test'),
  });

  const pyqsQuery = useQuery({
    queryKey: ['/api/admin/content', 'pyq'],
    queryFn: () => apiRequest('/api/admin/content?type=pyq'),
  });

  const resultsQuery = useQuery({
    queryKey: ['/api/admin/content', 'result'],
    queryFn: () => apiRequest('/api/admin/content?type=result'),
  });

  const announcementsQuery = useQuery({
    queryKey: ['/api/admin/content', 'announcement'],
    queryFn: () => apiRequest('/api/admin/content?type=announcement'),
  });

  // File upload handlers
  const getUploadParameters = async () => {
    const response = await apiRequest('/api/admin/upload', { method: 'POST' });
    return { method: 'PUT' as const, url: response.uploadURL };
  };

  const handleFileUploadComplete = async (
    type: string,
    title: string,
    uploadedFiles: { url: string; name: string; size: number; type: string }[]
  ) => {
    try {
      // Create content entry
      const contentData = {
        title,
        description: `Uploaded ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}`,
        type,
        isPublished: true,
      };

      const content = await apiRequest('/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(contentData),
      });

      // Create file entries
      for (const file of uploadedFiles) {
        await apiRequest('/api/admin/content-files', {
          method: 'POST',
          body: JSON.stringify({
            contentId: content.id,
            fileName: file.name,
            originalFileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            filePath: file.url,
          }),
        });
      }

      toast({
        title: "Upload Successful",
        description: `${title} uploaded successfully with ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}`,
      });

      // Refresh content lists
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const QuickUploadCard = ({ 
    title, 
    description, 
    icon: Icon, 
    type, 
    uploadTitle 
  }: { 
    title: string;
    description: string;
    icon: any;
    type: string;
    uploadTitle: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <ObjectUploader
          onGetUploadParameters={getUploadParameters}
          onComplete={(files) => handleFileUploadComplete(type, uploadTitle, files)}
          maxNumberOfFiles={10}
          acceptedFileTypes={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png', '.jpeg']}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload {title}
        </ObjectUploader>
      </CardContent>
    </Card>
  );

  const ContentList = ({ 
    title, 
    items, 
    isLoading 
  }: { 
    title: string; 
    items: Content[] | undefined; 
    isLoading: boolean 
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Manage your {title.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items && items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={item.isPublished ? "default" : "secondary"}>
                      {item.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No {title.toLowerCase()} found. Upload some content to get started.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pooja Academy Admin</h1>
            <p className="text-muted-foreground">Manage your institute content</p>
          </div>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="pyqs">PYQs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="announcements">News</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notesQuery.data?.length || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Test Papers</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{testsQuery.data?.length || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">PYQ Papers</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pyqsQuery.data?.length || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Results</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resultsQuery.data?.length || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Upload Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <QuickUploadCard
                title="Study Notes"
                description="Upload chapter notes and study materials"
                icon={BookOpen}
                type="notes"
                uploadTitle="Study Notes"
              />
              <QuickUploadCard
                title="Test Papers"
                description="Upload mock tests and practice papers"
                icon={FileText}
                type="test"
                uploadTitle="Test Paper"
              />
              <QuickUploadCard
                title="PYQ Papers"
                description="Upload previous year questions"
                icon={Trophy}
                type="pyq"
                uploadTitle="PYQ Paper"
              />
              <QuickUploadCard
                title="Results"
                description="Upload student results and achievements"
                icon={Users}
                type="result"
                uploadTitle="Student Result"
              />
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <ContentList
              title="Study Notes"
              items={notesQuery.data}
              isLoading={notesQuery.isLoading}
            />
          </TabsContent>

          <TabsContent value="tests">
            <ContentList
              title="Test Papers"
              items={testsQuery.data}
              isLoading={testsQuery.isLoading}
            />
          </TabsContent>

          <TabsContent value="pyqs">
            <ContentList
              title="PYQ Papers"
              items={pyqsQuery.data}
              isLoading={pyqsQuery.isLoading}
            />
          </TabsContent>

          <TabsContent value="results">
            <ContentList
              title="Results"
              items={resultsQuery.data}
              isLoading={resultsQuery.isLoading}
            />
          </TabsContent>

          <TabsContent value="announcements">
            <ContentList
              title="Announcements"
              items={announcementsQuery.data}
              isLoading={announcementsQuery.isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}