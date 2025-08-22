import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  FileText, 
  Trophy, 
  Download,
  Calendar,
  User
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Content } from "@shared/schema";

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState("notes");

  // Content queries for students
  const notesQuery = useQuery({
    queryKey: ['/api/content?type=notes'],
  });

  const testsQuery = useQuery({
    queryKey: ['/api/content?type=test'],
  });

  const pyqsQuery = useQuery({
    queryKey: ['/api/content?type=pyq'],
  });

  const resultsQuery = useQuery({
    queryKey: ['/api/content?type=result'],
  });

  const announcementsQuery = useQuery({
    queryKey: ['/api/content?type=announcement'],
  });

  const ContentCard = ({ item }: { item: Content }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {item.description && (
              <CardDescription className="mt-1">{item.description}</CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="ml-2">
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(item.publishDate || item.createdAt || '').toLocaleDateString()}
          </div>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ContentList = ({ 
    title, 
    items, 
    isLoading, 
    icon: Icon 
  }: { 
    title: string; 
    items: Content[] | undefined; 
    isLoading: boolean;
    icon: any;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold">{title}</h2>
        <Badge variant="outline" className="ml-auto">
          {items?.length || 0} items
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-muted-foreground">No {title.toLowerCase()} available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for updates!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Student Portal</h1>
          <p className="text-muted-foreground">
            Access your study materials, test papers, and results
          </p>
        </div>

        {/* Announcements */}
        {announcementsQuery.data && announcementsQuery.data.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📢 Latest Announcements
            </h2>
            <div className="grid gap-4">
              {announcementsQuery.data.slice(0, 3).map((announcement) => (
                <Card key={announcement.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    {announcement.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {announcement.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(announcement.publishDate || announcement.createdAt || '').toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notes">Study Notes</TabsTrigger>
            <TabsTrigger value="tests">Test Papers</TabsTrigger>
            <TabsTrigger value="pyqs">PYQ Papers</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="notes">
              <ContentList
                title="Study Notes"
                items={notesQuery.data}
                isLoading={notesQuery.isLoading}
                icon={BookOpen}
              />
            </TabsContent>

            <TabsContent value="tests">
              <ContentList
                title="Test Papers"
                items={testsQuery.data}
                isLoading={testsQuery.isLoading}
                icon={FileText}
              />
            </TabsContent>

            <TabsContent value="pyqs">
              <ContentList
                title="Previous Year Questions"
                items={pyqsQuery.data}
                isLoading={pyqsQuery.isLoading}
                icon={Trophy}
              />
            </TabsContent>

            <TabsContent value="results">
              <ContentList
                title="Results & Achievements"
                items={resultsQuery.data}
                isLoading={resultsQuery.isLoading}
                icon={User}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}