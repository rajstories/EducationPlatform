import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trophy, Medal, Award, Users, TrendingUp, Sparkles, Crown, Star, Send, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const resultSchema = z.object({
  classId: z.string().min(1, "Please select a class"),
  examName: z.string().min(3, "Exam name must be at least 3 characters"),
  examDate: z.string().min(1, "Please select exam date"),
  subject: z.string().min(1, "Please select a subject"),
  totalMarks: z.string().regex(/^\d+$/, "Must be a valid number"),
});

type ResultForm = z.infer<typeof resultSchema>;

interface StudentResult {
  id: string;
  studentId: string;
  name: string;
  rollNumber: string;
  marks: number;
  grade: string;
  rank: number;
  profilePhoto?: string;
  percentage: number;
}

interface ResultsManagementProps {
  classes: any[];
  subjects: any[];
}

export function ResultsManagement({ classes, subjects }: ResultsManagementProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ResultForm>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      classId: "",
      examName: "",
      examDate: "",
      subject: "",
      totalMarks: "100",
    },
  });

  // Fetch students for selected class
  const studentsQuery = useQuery({
    queryKey: [`/api/admin/students/${selectedClass}`],
    enabled: !!selectedClass,
  });

  // Publish results mutation
  const publishResultsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/results/publish', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Results Published!",
        description: "Results have been published and students have been notified.",
      });
      
      // Send real-time notification
      sendRealTimeNotification();
      
      // Reset form
      setStudentResults([]);
      setSelectedClass("");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/results'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Publishing Failed",
        description: error.message || "Failed to publish results",
        variant: "destructive",
      });
    },
  });

  // Send real-time notification to students
  const sendRealTimeNotification = async () => {
    try {
      await apiRequest('POST', '/api/admin/notifications/broadcast', {
        type: 'result_published',
        title: `${form.getValues('examName')} Results Published!`,
        message: `Results for ${form.getValues('subject')} are now available. Check your performance!`,
        classId: selectedClass,
        priority: 'high',
        data: {
          examName: form.getValues('examName'),
          subject: form.getValues('subject'),
          classId: selectedClass,
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  // Calculate ranks and grades
  const calculateRanksAndGrades = (results: any[]) => {
    const sortedResults = [...results].sort((a, b) => b.marks - a.marks);
    
    return sortedResults.map((result, index) => {
      const percentage = (result.marks / parseInt(form.getValues('totalMarks'))) * 100;
      let grade = 'F';
      
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';
      
      return {
        ...result,
        rank: index + 1,
        grade,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
  };

  // Handle marks input for a student
  const handleMarksChange = (studentId: string, marks: string) => {
    const numMarks = parseInt(marks) || 0;
    const maxMarks = parseInt(form.getValues('totalMarks'));
    
    if (numMarks > maxMarks) {
      toast({
        title: "Invalid Marks",
        description: `Marks cannot exceed ${maxMarks}`,
        variant: "destructive",
      });
      return;
    }

    setStudentResults(prev => {
      const existing = prev.find(r => r.studentId === studentId);
      const student = studentsQuery.data?.find((s: any) => s.id === studentId);
      
      if (existing) {
        const updated = prev.map(r => 
          r.studentId === studentId ? { ...r, marks: numMarks } : r
        );
        return calculateRanksAndGrades(updated);
      } else {
        const newResult = {
          id: `result-${studentId}`,
          studentId,
          name: student?.name || 'Unknown',
          rollNumber: student?.rollNumber || 'N/A',
          marks: numMarks,
          profilePhoto: student?.profilePhoto,
          grade: '',
          rank: 0,
          percentage: 0,
        };
        return calculateRanksAndGrades([...prev, newResult]);
      }
    });
  };

  // Podium display for top 3
  const PodiumDisplay = ({ results }: { results: StudentResult[] }) => {
    const top3 = results.slice(0, 3);
    const positions = [
      { rank: 2, height: "h-32", color: "bg-gray-400", icon: Medal },
      { rank: 1, height: "h-40", color: "bg-yellow-500", icon: Crown },
      { rank: 3, height: "h-28", color: "bg-orange-600", icon: Award },
    ];

    return (
      <div className="flex justify-center items-end gap-4 py-8">
        {positions.map((pos) => {
          const student = top3.find(s => s.rank === pos.rank);
          if (!student) return null;
          
          const Icon = pos.icon;
          
          return (
            <div key={pos.rank} className="flex flex-col items-center">
              <div className="relative mb-2">
                {student.profilePhoto ? (
                  <img 
                    src={student.profilePhoto} 
                    alt={student.name}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {student.name.charAt(0)}
                  </div>
                )}
                <div className="absolute -top-2 -right-2">
                  <Icon className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
                </div>
              </div>
              
              <div className="text-center mb-2">
                <h3 className="font-bold text-lg">{student.name}</h3>
                <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                <p className="text-2xl font-bold text-blue-600">{student.marks}</p>
                <Badge className="mt-1" variant={pos.rank === 1 ? "default" : "secondary"}>
                  {student.percentage}% - Grade {student.grade}
                </Badge>
              </div>
              
              <div className={`${pos.color} ${pos.height} w-32 rounded-t-lg flex items-center justify-center shadow-lg relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <span className="text-white text-4xl font-bold z-10">{pos.rank}</span>
                <Sparkles className="absolute top-2 right-2 w-6 h-6 text-white/50 animate-pulse" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Leaderboard for remaining students
  const Leaderboard = ({ results }: { results: StudentResult[] }) => {
    const remaining = results.slice(3);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Class Leaderboard
          </CardTitle>
          <CardDescription>Students ranked 4th and below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {remaining.map((student) => (
              <div 
                key={student.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {student.rank}
                  </div>
                  {student.profilePhoto ? (
                    <img 
                      src={student.profilePhoto} 
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {student.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">{student.marks}</p>
                    <p className="text-sm text-gray-500">{student.percentage}%</p>
                  </div>
                  <Badge variant={
                    student.grade === 'A+' ? 'default' :
                    student.grade === 'A' ? 'secondary' :
                    'outline'
                  }>
                    Grade {student.grade}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handlePublishResults = () => {
    const examData = form.getValues();
    
    publishResultsMutation.mutate({
      ...examData,
      results: studentResults,
      publishedAt: new Date().toISOString(),
    });
    
    setShowPublishDialog(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Results Management
          </CardTitle>
          <CardDescription>Create and publish exam results with visual leaderboards</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Class</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedClass(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes?.map((cls: any) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects && subjects.length > 0 ? (
                            subjects.map((subject: any) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="physics">Physics</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="examName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mid-Term Exam 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="examDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Marks</FormLabel>
                      <FormControl>
                        <Input placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Student Marks</CardTitle>
            <CardDescription>Add marks for each student in the selected class</CardDescription>
          </CardHeader>
          <CardContent>
            {studentsQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading students...</p>
              </div>
            ) : studentsQuery.error ? (
              <div className="text-center py-8 text-red-600">
                <p>Error loading students: {(studentsQuery.error as Error).message}</p>
              </div>
            ) : studentsQuery.data && studentsQuery.data.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {studentsQuery.data.map((student: any) => (
                  <div key={student.id} className="flex items-center gap-2 p-2 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
                    </div>
                    <Input
                      type="number"
                      placeholder="Marks"
                      className="w-24"
                      min="0"
                      max={form.getValues('totalMarks')}
                      onChange={(e) => handleMarksChange(student.id, e.target.value)}
                      value={studentResults.find(r => r.studentId === student.id)?.marks || ''}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No students found in selected class</p>
            )}
          </CardContent>
        </Card>
      )}

      {studentResults.length > 0 && (
        <>
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PodiumDisplay results={studentResults} />
            </CardContent>
          </Card>

          {studentResults.length > 3 && (
            <Leaderboard results={studentResults} />
          )}

          <div className="flex justify-end">
            <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Send className="w-4 h-4" />
                  Publish Results
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Result Publication</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to publish these results? Students will be notified immediately.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Result Summary</h4>
                    <div className="text-sm space-y-1">
                      <p>Exam: {form.getValues('examName')}</p>
                      <p>Subject: {subjects?.find(s => s.id === form.getValues('subject'))?.name}</p>
                      <p>Total Students: {studentResults.length}</p>
                      <p>Top Scorer: {studentResults[0]?.name} ({studentResults[0]?.marks} marks)</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePublishResults} disabled={publishResultsMutation.isPending}>
                      {publishResultsMutation.isPending ? "Publishing..." : "Confirm & Publish"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </div>
  );
}