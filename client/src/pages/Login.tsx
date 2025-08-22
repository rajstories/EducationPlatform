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
import { Lock, User, GraduationCap, Mail, Phone } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  password: z.string().optional(),
});

const phoneLoginSchema = z.object({
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const otpVerifySchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type EmailLoginForm = z.infer<typeof emailLoginSchema>;
type PhoneLoginForm = z.infer<typeof phoneLoginSchema>;
type OtpVerifyForm = z.infer<typeof otpVerifySchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginMode, setLoginMode] = useState<"email" | "phone">("email");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [pendingIdentifier, setPendingIdentifier] = useState("");
  const [pendingType, setPendingType] = useState<"email" | "phone">("email");
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const emailForm = useForm<EmailLoginForm>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: "", name: "", password: "" },
  });

  const phoneForm = useForm<PhoneLoginForm>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { phone: "", name: "" },
  });

  const otpForm = useForm<OtpVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { otp: "" },
  });

  // Check if admin credentials and login directly
  const adminLoginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/admin/login', { username: data.email, password: data.password });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome!",
        description: "Successfully logged in",
      });
      setLocation("/admin");
    },
    onError: () => {
      // If admin login fails, send OTP instead
      const emailData = emailForm.getValues();
      if (emailData.email && emailData.name) {
        requestOtpMutation.mutate({
          identifier: emailData.email,
          name: emailData.name,
          type: "email"
        });
      }
    },
  });

  // Request OTP mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (data: { identifier: string; name: string; type: "email" | "phone" }) => {
      const response = await apiRequest('POST', '/api/student/request-otp', data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      setPendingIdentifier(variables.identifier);
      setPendingType(variables.type);
      setShowOtpInput(true);
      setShowPasswordInput(false);
      setIsCheckingAdmin(false);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to your ${variables.type}`,
      });
    },
    onError: (error: Error) => {
      setIsCheckingAdmin(false);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { identifier: string; otp: string; type: "email" | "phone" }) => {
      const response = await apiRequest('POST', '/api/student/verify-otp', data);
      return response.json();
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

  const handleEmailSubmit = (data: EmailLoginForm) => {
    // First check if it might be admin credentials
    if (data.email === "rajshrivastav283815@gmail.com" && data.password) {
      setIsCheckingAdmin(true);
      adminLoginMutation.mutate({
        email: data.email,
        password: data.password
      });
    } else {
      // Regular student login with OTP
      if (data.name) {
        requestOtpMutation.mutate({
          identifier: data.email,
          name: data.name,
          type: "email"
        });
      }
    }
  };

  const handlePhoneSubmit = (data: PhoneLoginForm) => {
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
      type: pendingType
    });
  };

  const handleEmailChange = (email: string) => {
    // Show password field if admin email is detected
    if (email === "rajshrivastav283815@gmail.com") {
      setShowPasswordInput(true);
      emailForm.setValue("name", "Admin", { shouldValidate: false });
    } else {
      setShowPasswordInput(false);
      emailForm.setValue("name", "", { shouldValidate: false });
    }
  };

  const goBack = () => {
    setShowOtpInput(false);
    setShowPasswordInput(false);
    setPendingIdentifier("");
    otpForm.reset();
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
          {!showOtpInput ? (
            <Tabs value={loginMode} onValueChange={(value) => setLoginMode(value as "email" | "phone")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
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
                                data-testid="input-email"
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleEmailChange(e.target.value);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!showPasswordInput && (
                      <FormField
                        control={emailForm.control}
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
                                  data-testid="input-name"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {showPasswordInput && (
                      <FormField
                        control={emailForm.control}
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
                                  placeholder="Enter your password"
                                  className="pl-10"
                                  data-testid="input-password"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={requestOtpMutation.isPending || adminLoginMutation.isPending || isCheckingAdmin}
                      data-testid="button-send-otp-email"
                    >
                      {isCheckingAdmin ? "Signing In..." : showPasswordInput ? "Sign In" : "Send OTP to Email"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
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
                      control={phoneForm.control}
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
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={requestOtpMutation.isPending}
                      data-testid="button-send-otp-phone"
                    >
                      Send OTP to Phone
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
                <p className="text-gray-600 text-sm">
                  We've sent a 6-digit code to {pendingIdentifier}
                </p>
              </div>

              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(handleOtpVerify)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter 6-digit code"
                            className="text-center text-lg tracking-widest"
                            maxLength={6}
                            data-testid="input-otp"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={verifyOtpMutation.isPending}
                      data-testid="button-verify-otp"
                    >
                      {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Login"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={goBack}
                      data-testid="button-go-back"
                    >
                      Go Back
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}