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

  // Fetch grades data
  const gradesQuery = useQuery({
    queryKey: ['/api/student/grades'],
  });

  // Fetch fee data
  const feesQuery = useQuery({
    queryKey: ['/api/student/fees'],
  });

  // Fetch notifications
  const notificationsQuery = useQuery({
    queryKey: ['/api/student/notifications'],
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

  const student = studentQuery.data;
  const attendance = attendanceQuery.data || { totalDays: 0, presentDays: 0, percentage: 0 };
  const grades = gradesQuery.data || [];
  const fees = feesQuery.data || [];
  const notifications = notificationsQuery.data || [];

  if (studentQuery.isLoading) {
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-600 text-white text-lg font-bold">
                  {student?.name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-navy">Welcome, {student?.name || 'Student'}!</h1>
                <p className="text-sm text-gray-600">
                  {student?.studentId} • {student?.classId ? `Class ${student.classId}` : 'Class Not Set'} • {student?.stream || 'Stream Not Set'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold text-navy">{attendance.percentage}%</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <Progress value={attendance.percentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current GPA</p>
                  <p className="text-2xl font-bold text-navy">{student?.currentGPA || '0.0'}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fee Status</p>
                  <Badge variant={fees.some((f: any) => f.status === 'overdue') ? 'destructive' : 'secondary'}>
                    {student?.feeStatus || 'Pending'}
                  </Badge>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-navy">{notifications.filter((n: any) => !n.isRead).length}</p>
                </div>
                <Bell className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Grades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Recent Grades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {grades.slice(0, 5).map((grade: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{grade.testName}</p>
                          <p className="text-sm text-gray-600">{grade.subjectName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{grade.obtainedMarks}/{grade.maxMarks}</p>
                          <Badge variant={grade.percentage >= 90 ? 'default' : grade.percentage >= 70 ? 'secondary' : 'destructive'}>
                            {grade.grade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.priority === 'high' ? 'bg-red-500' : notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Full Name</p>
                      <p className="text-sm">{student?.name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Student ID</p>
                      <p className="text-sm">{student?.studentId || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                      <p className="text-sm">{student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gender</p>
                      <p className="text-sm">{student?.gender || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                    <p className="text-sm">{student?.address || 'Not set'}</p>
                    <p className="text-sm">{student?.city}, {student?.state} - {student?.pincode}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Parent/Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Father's Name</p>
                      <p className="text-sm">{student?.fatherName || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Mother's Name</p>
                      <p className="text-sm">{student?.motherName || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm">{student?.parentPhone || 'Not set'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-sm">{student?.parentEmail || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Emergency Contact</p>
                    <p className="text-sm">{student?.emergencyContact || 'Not set'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Attendance Record
                </CardTitle>
                <CardDescription>
                  Your attendance record for the current session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{attendance.presentDays}</p>
                      <p className="text-sm text-gray-600">Present Days</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-600">{attendance.totalDays - attendance.presentDays}</p>
                      <p className="text-sm text-gray-600">Absent Days</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{attendance.percentage}%</p>
                      <p className="text-sm text-gray-600">Overall Attendance</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Attendance Progress</h4>
                    <Progress value={attendance.percentage} className="mb-2" />
                    <p className="text-sm text-gray-600">
                      {attendance.presentDays} out of {attendance.totalDays} days attended
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Academic Performance
                </CardTitle>
                <CardDescription>
                  Your grades and test scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grades.map((grade: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{grade.testName}</h4>
                        <p className="text-sm text-gray-600">{grade.subjectName} • {grade.testType}</p>
                        <p className="text-xs text-gray-500">{new Date(grade.testDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{grade.obtainedMarks}/{grade.maxMarks}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={grade.percentage >= 90 ? 'default' : grade.percentage >= 70 ? 'secondary' : 'destructive'}>
                            {grade.grade}
                          </Badge>
                          <span className="text-sm text-gray-600">{grade.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Fee Management
                </CardTitle>
                <CardDescription>
                  Your fee payments and pending dues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fees.map((fee: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{fee.feeType}</h4>
                        <p className="text-sm text-gray-600">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                        {fee.paidDate && (
                          <p className="text-xs text-green-600">Paid: {new Date(fee.paidDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{fee.amount}</p>
                        <Badge variant={
                          fee.status === 'paid' ? 'secondary' : 
                          fee.status === 'overdue' ? 'destructive' : 'default'
                        }>
                          {fee.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Important updates and announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        notification.priority === 'high' ? 'bg-red-500' : 
                        notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}