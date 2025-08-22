import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, User, GraduationCap, Mail, Phone, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const studentEmailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const studentPhoneSchema = z.object({
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const otpVerifySchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;
type StudentEmailForm = z.infer<typeof studentEmailSchema>;
type StudentPhoneForm = z.infer<typeof studentPhoneSchema>;
type OtpVerifyForm = z.infer<typeof otpVerifySchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginMode, setLoginMode] = useState<"admin" | "student">("student");
  const [studentMode, setStudentMode] = useState<"email" | "phone">("email");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [pendingIdentifier, setPendingIdentifier] = useState("");

  const adminForm = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const studentEmailForm = useForm<StudentEmailForm>({
    resolver: zodResolver(studentEmailSchema),
    defaultValues: { email: "", name: "" },
  });

  const studentPhoneForm = useForm<StudentPhoneForm>({
    resolver: zodResolver(studentPhoneSchema),
    defaultValues: { phone: "", name: "" },
  });

  const otpForm = useForm<OtpVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { otp: "" },
  });

  // Admin login mutation
  const adminLoginMutation = useMutation({
    mutationFn: async (data: AdminLoginForm) => {
      const response = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: data.email, password: data.password }),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Welcome Back!",
        description: "Successfully logged into admin panel",
      });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  // Student request OTP mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (data: { identifier: string; name: string; type: "email" | "phone" }) => {
      const response = await apiRequest('/api/student/request-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      setPendingIdentifier(variables.identifier);
      setShowOtpInput(true);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to your ${variables.type}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Student verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { identifier: string; otp: string; type: "email" | "phone" }) => {
      const response = await apiRequest('/api/student/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome to Student Portal",
      });
      setLocation("/portal");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    },
  });

  const handleAdminLogin = (data: AdminLoginForm) => {
    adminLoginMutation.mutate(data);
  };

  const handleStudentEmailSubmit = (data: StudentEmailForm) => {
    requestOtpMutation.mutate({
      identifier: data.email,
      name: data.name,
      type: "email"
    });
  };

  const handleStudentPhoneSubmit = (data: StudentPhoneForm) => {
    requestOtpMutation.mutate({
      identifier: data.phone,
      name: data.name,
      type: "phone"
    });
  };

  const handleOtpVerify = (data: OtpVerifyForm) => {
    verifyOtpMutation.mutate({
      identifier: pendingIdentifier,
      otp: data.otp,
      type: studentMode
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Pooja Academy Login</CardTitle>
          <CardDescription>
            Access your account to continue learning
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={loginMode} onValueChange={(value) => setLoginMode(value as "admin" | "student")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4">
              {!showOtpInput ? (
                <div>
                  <div className="flex space-x-2 mb-4">
                    <Button
                      variant={studentMode === "email" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStudentMode("email")}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      variant={studentMode === "phone" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStudentMode("phone")}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </Button>
                  </div>

                  {studentMode === "email" ? (
                    <Form {...studentEmailForm}>
                      <form onSubmit={studentEmailForm.handleSubmit(handleStudentEmailSubmit)} className="space-y-4">
                        <FormField
                          control={studentEmailForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="Enter your full name"
                                    className="pl-10"
                                    data-testid="input-student-name"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={studentEmailForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="Enter your email"
                                    className="pl-10"
                                    data-testid="input-student-email"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={requestOtpMutation.isPending}
                          data-testid="button-send-email-otp"
                        >
                          {requestOtpMutation.isPending ? "Sending OTP..." : "Send OTP to Email"}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Form {...studentPhoneForm}>
                      <form onSubmit={studentPhoneForm.handleSubmit(handleStudentPhoneSubmit)} className="space-y-4">
                        <FormField
                          control={studentPhoneForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="Enter your full name"
                                    className="pl-10"
                                    data-testid="input-student-name-phone"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={studentPhoneForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="Enter your phone number"
                                    className="pl-10"
                                    data-testid="input-student-phone"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={requestOtpMutation.isPending}
                          data-testid="button-send-phone-otp"
                        >
                          {requestOtpMutation.isPending ? "Sending OTP..." : "Send OTP to Phone"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </div>
              ) : (
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleOtpVerify)} className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Verify OTP</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to your {studentMode}
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        {pendingIdentifier}
                      </p>
                    </div>

                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter 6-digit OTP"
                              className="text-center text-lg tracking-wider"
                              maxLength={6}
                              data-testid="input-otp"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={verifyOtpMutation.isPending}
                        data-testid="button-verify-otp"
                      >
                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Login"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setShowOtpInput(false);
                          setPendingIdentifier("");
                          otpForm.reset();
                        }}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <Form {...adminForm}>
                <form onSubmit={adminForm.handleSubmit(handleAdminLogin)} className="space-y-4">
                  <FormField
                    control={adminForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              {...field}
                              placeholder="Enter admin email"
                              className="pl-10"
                              data-testid="input-admin-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={adminForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter password"
                              className="pl-10"
                              data-testid="input-admin-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={adminLoginMutation.isPending}
                    data-testid="button-admin-login"
                  >
                    {adminLoginMutation.isPending ? "Signing in..." : "Sign In as Admin"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium mb-2">Admin Credentials:</p>
                <p className="text-xs text-blue-600">
                  Email: <code className="bg-white px-1 rounded text-xs">rajshrivastav283815@gmail.com</code><br />
                  Password: <code className="bg-white px-1 rounded text-xs">Rambhaiya@9958</code>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}