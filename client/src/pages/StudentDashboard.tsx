import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  User,
  GraduationCap,
  Calendar,
  TrendingUp,
  DollarSign,
  Bell,
  BookOpen,
  Clock,
  Award,
  Phone,
  Mail,
  MapPin,
  Download,
  FileText,
  BarChart3,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogOut
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ProgressTracker } from "@/components/ProgressTracker";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch student profile
  const studentQuery = useQuery({
    queryKey: ['/api/student/profile'],
  });

  // Fetch attendance data
  const attendanceQuery = useQuery({
    queryKey: ['/api/student/attendance'],
  });

  // Fetch results data
  const resultsQuery = useQuery({
    queryKey: ['/api/student/results'],
  });

  // Fetch video content
  const videosQuery = useQuery({
    queryKey: ['/api/content', { type: 'video' }],
  });

  const handleLogout = () => {
    // Clear student session and redirect to login
    fetch('/api/student/logout', { method: 'POST' })
      .then(() => {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        setLocation("/login");
      })
      .catch(() => {
        setLocation("/login");
      });
  };

  const student = studentQuery.data as any || {};
  const attendance = (attendanceQuery.data as any[]) || [];
  const results = (resultsQuery.data as any[]) || [];

  // Calculate attendance statistics
  const presentDays = Array.isArray(attendance) ? attendance.filter((record: any) => record.status === 'present').length : 0;
  const totalDays = Array.isArray(attendance) ? attendance.length : 0;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Calculate overall performance from results
  const totalMarks = Array.isArray(results) ? results.reduce((sum: number, result: any) => sum + (result.obtainedMarks || 0), 0) : 0;
  const totalMaxMarks = Array.isArray(results) ? results.reduce((sum: number, result: any) => sum + (result.maxMarks || 0), 0) : 0;
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;

  const isLoading = studentQuery.isLoading || attendanceQuery.isLoading || resultsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white">
                  {student.name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {student.name || 'Student'}!</h1>
                <p className="text-gray-600">Here's your academic overview</p>
                <Badge variant="secondary" className="text-xs">
                  {student.studentId} • Class {student.classId}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-3xl font-bold text-green-600">{attendancePercentage}%</p>
                  <p className="text-xs text-gray-500">{presentDays}/{totalDays} days</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <Progress value={attendancePercentage} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Performance</p>
                  <p className="text-3xl font-bold text-blue-600">{overallPercentage}%</p>
                  <p className="text-xs text-gray-500">Current GPA: {student.currentGPA || '0.0'}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <Progress value={overallPercentage} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Grade</p>
                  <p className="text-3xl font-bold text-purple-600">{student.overallGrade || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Based on all tests</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fee Status</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {student.feeStatus === 'paid' ? 'Paid' : 'Pending'}
                  </p>
                  <p className="text-xs text-gray-500">Session 2024-25</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="videos">Video Lectures</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(attendance) && attendance.slice(0, 5).map((record: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {record.status === 'present' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium">{record.date}</span>
                        </div>
                        <Badge 
                          variant={record.status === 'present' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(results) && results.slice(0, 5).map((result: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{result.testName}</span>
                          <Badge variant="outline" className="text-xs">
                            {result.obtainedMarks}/{result.maxMarks}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">{result.testDate}</span>
                          <span className="text-sm font-bold text-blue-600">
                            {Math.round((result.obtainedMarks / result.maxMarks) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>
                  Your complete attendance record with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{presentDays}</p>
                      <p className="text-sm text-gray-600">Present Days</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{totalDays - presentDays}</p>
                      <p className="text-sm text-gray-600">Absent Days</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{attendancePercentage}%</p>
                      <p className="text-sm text-gray-600">Attendance Percentage</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {Array.isArray(attendance) && attendance.map((record: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {record.status === 'present' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{record.date}</p>
                            {record.remarks && (
                              <p className="text-sm text-gray-600">{record.remarks}</p>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={record.status === 'present' ? 'default' : 'destructive'}
                        >
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Academic Results</CardTitle>
                <CardDescription>
                  Your test scores, grades, and academic performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(results) && results.map((result: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{result.testName}</h3>
                          <p className="text-sm text-gray-600">{result.testType} • {result.testDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {result.obtainedMarks}/{result.maxMarks}
                          </p>
                          <p className="text-sm text-gray-600">
                            {Math.round((result.obtainedMarks / result.maxMarks) * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          Grade: {result.grade || 'N/A'}
                        </Badge>
                        {result.remarks && (
                          <p className="text-sm text-gray-600 italic">{result.remarks}</p>
                        )}
                      </div>
                      <Progress 
                        value={Math.round((result.obtainedMarks / result.maxMarks) * 100)} 
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Lectures Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Video Lectures
                  </CardTitle>
                  <CardDescription>
                    Watch video lectures and track your learning progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {videosQuery.isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading videos...</p>
                    </div>
                  ) : Array.isArray(videosQuery.data) && videosQuery.data.length > 0 ? (
                    <div className="grid gap-6">
                      {videosQuery.data.map((video: any) => (
                        <VideoPlayer
                          key={video.id}
                          contentId={video.id}
                          videoUrl={`/objects/${video.videoId}`}
                          title={video.title}
                          description={video.description}
                          className="w-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Video Lectures Available</h3>
                      <p className="text-gray-600">
                        Video lectures will appear here when your instructor uploads them.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress & Achievements Tab */}
          <TabsContent value="progress" className="space-y-6">
            <ProgressTracker studentId={student?.id} showLeaderboard={true} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-lg font-semibold">{student.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Student ID</label>
                    <p className="text-lg font-semibold">{student.studentId || 'Not generated'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-lg font-semibold">
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-lg font-semibold">{student.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-lg font-semibold">
                      {student.address && student.city && student.state ? 
                        `${student.address}, ${student.city}, ${student.state} - ${student.pincode}` : 
                        'Not provided'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Parent/Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Father's Name</label>
                    <p className="text-lg font-semibold">{student.fatherName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mother's Name</label>
                    <p className="text-lg font-semibold">{student.motherName || 'Not provided'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Parent Phone</label>
                      <p className="text-lg font-semibold">{student.parentPhone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Parent Email</label>
                      <p className="text-lg font-semibold">{student.parentEmail || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                    <p className="text-lg font-semibold">{student.emergencyContact || 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}