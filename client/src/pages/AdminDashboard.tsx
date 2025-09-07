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
  Settings,
  Search,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";
import { EnhancedUploader } from "@/components/EnhancedUploader";
import { VideoUploader } from "@/components/VideoUploader";
import { AttendanceManagement } from "@/components/AttendanceManagement";
import { ChapterManagement } from "@/components/ChapterManagement";
import { ResultsManagement } from "@/components/ResultsManagement";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Content, ContentFile } from "@shared/schema";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Content queries
  const notesQuery = useQuery({
    queryKey: ['/api/admin/content?type=notes'],
  });

  const testsQuery = useQuery({
    queryKey: ['/api/admin/content?type=test'],
  });

  const pyqsQuery = useQuery({
    queryKey: ['/api/admin/content?type=pyq'],
  });

  const resultsQuery = useQuery({
    queryKey: ['/api/admin/content?type=result'],
  });

  const announcementsQuery = useQuery({
    queryKey: ['/api/admin/content?type=announcement'],
  });

  const videosQuery = useQuery({
    queryKey: ['/api/admin/content?type=video'],
  });

  // Student data queries
  const studentsQuery = useQuery({
    queryKey: ['/api/admin/students'],
  });

  const classesQuery = useQuery({
    queryKey: ['/api/classes'],
  });

  const subjectsQuery = useQuery({
    queryKey: ['/api/subjects'],
  });

  // Filter students based on class and search term
  const filteredStudents = studentsQuery.data?.filter((student: any) => {
    const matchesClass = selectedClass === "all" || student.classId === selectedClass;
    const matchesSearch = searchTerm === "" || 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  }) || [];

  // File upload handlers
  const getUploadParameters = async () => {
    const response = await apiRequest('POST', '/api/admin/upload');
    const data = await response.json();
    return { method: 'PUT' as const, url: data.uploadURL };
  };

  const handleFileUploadComplete = async (data: {
    title: string;
    description?: string;
    classId: string;
    subjectId: string;
    chapterId?: string;
    uploadedFiles: { url: string; name: string; size: number; type: string }[];
  }, type: string) => {
    try {
      // Create content entry with class/subject/chapter info
      const contentData = {
        title: data.title,
        description: data.description || `Uploaded ${data.uploadedFiles.length} file${data.uploadedFiles.length !== 1 ? 's' : ''}`,
        type,
        classId: data.classId,
        subjectId: data.subjectId,
        chapterId: data.chapterId || null,
        isPublished: true,
      };

      const contentResponse = await apiRequest('POST', '/api/admin/content', contentData);
      const content = await contentResponse.json();

      // Create file entries
      for (const file of data.uploadedFiles) {
        await apiRequest('POST', '/api/admin/content-files', {
          contentId: content.id,
          fileName: file.name,
          originalFileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          filePath: file.url,
        });
      }

      toast({
        title: "Upload Successful",
        description: `${data.title} uploaded successfully with ${data.uploadedFiles.length} file${data.uploadedFiles.length !== 1 ? 's' : ''}`,
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
    type: "notes" | "test" | "pyq" | "result" | "announcement";
    uploadTitle: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <EnhancedUploader
          maxNumberOfFiles={10}
          maxFileSize={50 * 1024 * 1024} // 50MB
          acceptedFileTypes={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png', '.jpeg']}
          contentType={type}
          onGetUploadParameters={getUploadParameters}
          onComplete={(data) => handleFileUploadComplete(data, type)}
          buttonClassName="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload {title}
        </EnhancedUploader>
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

  // Student Profile Card Component
  const StudentProfileCard = ({ student }: { student: any }) => {
    const getInitials = (name: string) => {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';
    };

    const getStatusColor = (isActive: boolean) => {
      return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getGradeColor = (grade: string) => {
      if (grade?.includes('A')) return 'text-green-600';
      if (grade?.includes('B')) return 'text-blue-600';
      if (grade?.includes('C')) return 'text-yellow-600';
      return 'text-gray-600';
    };

    return (
      <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {getInitials(student.name || 'Student')}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{student.name || 'Unknown'}</h3>
                <p className="text-sm text-blue-600 font-medium">{student.studentId}</p>
                <Badge className={`mt-1 ${getStatusColor(student.isActive)}`} variant="secondary">
                  {student.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Academic Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Academic Details</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Class:</span>
                <p className="font-medium">{student.classId?.replace('class-', 'Class ') || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Stream:</span>
                <p className="font-medium capitalize">{student.stream || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Roll No:</span>
                <p className="font-medium">{student.rollNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Session:</span>
                <p className="font-medium">{student.currentSession || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-500">GPA</p>
              <p className={`font-bold ${getGradeColor(student.currentGPA)}`}>
                {student.currentGPA || '0.0'}
              </p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500">Attendance</p>
              <p className="font-bold text-blue-600">
                {student.totalAttendance ? Math.round((student.presentDays / student.totalAttendance) * 100) : 0}%
              </p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500">Grade</p>
              <p className={`font-bold ${getGradeColor(student.overallGrade)}`}>
                {student.overallGrade || 'N/A'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            {student.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 truncate">{student.email}</span>
              </div>
            )}
            {student.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{student.phone}</span>
              </div>
            )}
            {student.city && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{student.city}, {student.state || 'Delhi'}</span>
              </div>
            )}
          </div>

          {/* Fee Status */}
          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Fee Status</span>
            </div>
            <Badge variant={student.feeStatus === 'paid' ? 'default' : 'destructive'}>
              {student.feeStatus === 'paid' ? 'Paid' : `₹${student.totalFeeDue || 0} Due`}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-${student.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-${student.id}`}>
              <Settings className="w-4 h-4 mr-1" />
              Manage
            </Button>
          </div>

          {/* Last Activity */}
          {student.lastLogin && (
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Last active: {new Date(student.lastLogin).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
          <TabsList className="flex flex-wrap w-full h-auto p-1 gap-1">
            <TabsTrigger value="overview" className="flex-shrink-0">Overview</TabsTrigger>
            <TabsTrigger value="students" className="flex-shrink-0">Students</TabsTrigger>
            <TabsTrigger value="attendance" className="flex-shrink-0">Attendance</TabsTrigger>
            <TabsTrigger value="chapters" className="flex-shrink-0">Chapters</TabsTrigger>
            <TabsTrigger value="videos" className="flex-shrink-0">Videos</TabsTrigger>
            <TabsTrigger value="notes" className="flex-shrink-0">Notes</TabsTrigger>
            <TabsTrigger value="tests" className="flex-shrink-0">Tests</TabsTrigger>
            <TabsTrigger value="pyqs" className="flex-shrink-0">PYQs</TabsTrigger>
            <TabsTrigger value="results" className="flex-shrink-0">Results</TabsTrigger>
            <TabsTrigger value="announcements" className="flex-shrink-0">News</TabsTrigger>
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
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studentsQuery.data?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered students
                  </p>
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

          <TabsContent value="students" className="space-y-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, student ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-student-search"
                  />
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-class-filter">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classesQuery.data?.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {/* Students Grid */}
            {studentsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading student records...</p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedClass !== "all" 
                    ? "Try adjusting your search or filter criteria." 
                    : "Students will appear here once they complete their profile registration."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student: any) => (
                  <StudentProfileCard key={student.id} student={student} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Attendance Management Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <AttendanceManagement 
              students={filteredStudents || []}
              classes={classesQuery.data || []}
            />
          </TabsContent>

          {/* Chapter Management Tab */}
          <TabsContent value="chapters" className="space-y-6">
            <ChapterManagement 
              classes={classesQuery.data || []}
              subjects={subjectsQuery.data || []}
            />
          </TabsContent>

          {/* Video Lectures Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Video Lectures</h2>
                <p className="text-muted-foreground">Upload and manage video lectures for students</p>
              </div>
              <VideoUploader 
                onUploadComplete={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/admin/content?type=video'] });
                  toast({
                    title: "Success",
                    description: "Video lecture uploaded successfully!",
                  });
                }}
              />
            </div>
            <ContentList
              title="Video Lectures"
              items={videosQuery.data}
              isLoading={videosQuery.isLoading}
            />
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

          <TabsContent value="results" className="space-y-6">
            <ResultsManagement 
              classes={classesQuery.data || []}
              subjects={subjectsQuery.data || []}
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