import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle, XCircle, Clock, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AttendanceManagementProps {
  students: any[];
  classes: any[];
}

export function AttendanceManagement({ students, classes }: AttendanceManagementProps) {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get today's active students
  const activeStudentsQuery = useQuery({
    queryKey: ['/api/admin/students/active', selectedDate],
    enabled: !!selectedDate,
  });

  // Get attendance for selected class and date
  const attendanceQuery = useQuery({
    queryKey: ['/api/admin/attendance/class', selectedClass, 'date', selectedDate],
    enabled: selectedClass !== "all" && !!selectedDate,
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (data: { studentId: string; status: string; remarks?: string }) => {
      return await apiRequest('/api/admin/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          studentId: data.studentId,
          date: selectedDate,
          status: data.status,
          remarks: data.remarks
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/attendance/class'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      toast({
        title: "Attendance Marked",
        description: "Student attendance has been successfully recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter students by selected class
  const classStudents = selectedClass === "all" 
    ? students 
    : students.filter(student => student.classId === selectedClass);

  // Get attendance records for current selection
  const attendanceRecords = attendanceQuery.data || [];
  const activeStudents = activeStudentsQuery.data || [];

  // Check if student has attendance marked for selected date
  const getStudentAttendance = (studentId: string) => {
    return attendanceRecords.find((record: any) => record.studentId === studentId);
  };

  // Check if student is active today
  const isStudentActive = (studentId: string) => {
    return activeStudents.includes(studentId);
  };

  const handleMarkAttendance = (studentId: string, status: string, remarks?: string) => {
    markAttendanceMutation.mutate({
      studentId,
      status,
      remarks
    });
  };

  const calculateAttendanceStats = () => {
    const totalStudents = classStudents.length;
    const presentCount = attendanceRecords.filter((record: any) => record.status === 'present').length;
    const absentCount = attendanceRecords.filter((record: any) => record.status === 'absent').length;
    const percentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return { totalStudents, presentCount, absentCount, percentage };
  };

  const stats = calculateAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Mark and track student attendance</p>
        </div>
        
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
              data-testid="input-attendance-date"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-40" data-testid="select-attendance-class">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {selectedClass !== "all" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.presentCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absentCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attendance %</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.percentage}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Student Attendance - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
          <CardDescription>
            Mark attendance for students in {selectedClass === "all" ? "all classes" : `Class ${selectedClass}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found for the selected class.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classStudents.map((student: any) => {
                const attendance = getStudentAttendance(student.id);
                const isActive = isStudentActive(student.id);
                
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{student.name}</span>
                          {isActive && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Online Today
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.studentId} • Class {student.classId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {attendance ? (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={attendance.status === 'present' ? 'default' : 'destructive'}
                            data-testid={`status-${student.id}`}
                          >
                            {attendance.status === 'present' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {attendance.remarks && `(${attendance.remarks})`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleMarkAttendance(student.id, 'present')}
                            disabled={markAttendanceMutation.isPending}
                            data-testid={`button-present-${student.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleMarkAttendance(student.id, 'absent')}
                            disabled={markAttendanceMutation.isPending}
                            data-testid={`button-absent-${student.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Absent
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedClass !== "all" && classStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
            <CardDescription>
              Quick actions for marking attendance for all students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => {
                  classStudents.forEach(student => {
                    if (!getStudentAttendance(student.id)) {
                      handleMarkAttendance(student.id, 'present');
                    }
                  });
                }}
                disabled={markAttendanceMutation.isPending}
                data-testid="button-mark-all-present"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Present
              </Button>
              
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => {
                  classStudents.forEach(student => {
                    if (!getStudentAttendance(student.id)) {
                      handleMarkAttendance(student.id, 'absent');
                    }
                  });
                }}
                disabled={markAttendanceMutation.isPending}
                data-testid="button-mark-all-absent"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark All Absent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}