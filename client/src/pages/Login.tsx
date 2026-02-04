import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Lock, User, GraduationCap, Mail, Phone, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Schema definitions
const phoneLoginSchema = z.object({
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const emailCheckSchema = z.object({
  email: z.string().min(1, "Please enter an email"),
});

const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const emailRegisterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const otpVerifySchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type PhoneLoginForm = z.infer<typeof phoneLoginSchema>;
type EmailCheckForm = z.infer<typeof emailCheckSchema>;
type EmailLoginForm = z.infer<typeof emailLoginSchema>;
type EmailRegisterForm = z.infer<typeof emailRegisterSchema>;
type OtpVerifyForm = z.infer<typeof otpVerifySchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Navigation states
  const [loginMode, setLoginMode] = useState<"phone" | "email">("email");
  const [emailFlow, setEmailFlow] = useState<"check" | "login" | "register">("check");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Data states
  const [pendingIdentifier, setPendingIdentifier] = useState("");
  const [pendingType, setPendingType] = useState<"email" | "phone">("email");
  const [userExists, setUserExists] = useState(false);

  // Form configurations
  const phoneForm = useForm<PhoneLoginForm>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { phone: "", name: "" },
  });

  const emailCheckForm = useForm<EmailCheckForm>({
    resolver: zodResolver(emailCheckSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const emailLoginForm = useForm<EmailLoginForm>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const emailRegisterForm = useForm<EmailRegisterForm>({
    resolver: zodResolver(emailRegisterSchema),
    defaultValues: { email: "", name: "", password: "", confirmPassword: "" },
  });

  const otpForm = useForm<OtpVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { otp: "" },
  });

  // Check if email exists mutation
  const checkEmailMutation = useMutation({
    mutationFn: async (data: EmailCheckForm) => {
      const response = await apiRequest('POST', '/api/student/check-email', data);
      return response.json();
    },
    onSuccess: (data) => {
      const email = emailCheckForm.getValues().email;
      if (data.exists) {
        setUserExists(true);
        setEmailFlow("login");
        emailLoginForm.setValue("email", email);
        // Show admin message if it's admin email
        if (data.isAdmin) {
          toast({
            title: "Admin Access",
            description: "Please enter your admin password",
          });
        }
      } else {
        setUserExists(false);
        setEmailFlow("register");
        emailRegisterForm.setValue("email", email);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Email login mutation
  const emailLoginMutation = useMutation({
    mutationFn: async (data: EmailLoginForm) => {
      const response = await apiRequest('POST', '/api/student/email-login', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isAdmin) {
        toast({
          title: "Admin Access Granted",
          description: "Welcome to Admin Dashboard",
        });
        setLocation("/admin");
      } else {
        toast({
          title: "Welcome Back!",
          description: "Successfully logged in",
        });
        if (data.profileCompleted) {
          setLocation("/student");
        } else {
          setLocation("/student/profile");
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  // Email register mutation
  const emailRegisterMutation = useMutation({
    mutationFn: async (data: EmailRegisterForm) => {
      const { confirmPassword, ...registerData } = data;
      const response = await apiRequest('POST', '/api/student/email-register', registerData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Account Created!",
        description: "Welcome to Pooja Academy",
      });
      if (data.profileCompleted) {
        setLocation("/student");
      } else {
        setLocation("/student/profile");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Phone OTP request mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (data: { identifier: string; name: string; type: "email" | "phone" }) => {
      const response = await apiRequest('POST', '/api/student/request-otp', data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      setPendingIdentifier(variables.identifier);
      setPendingType(variables.type);
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

  // OTP verification mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { identifier: string; otp: string; type: "email" | "phone" }) => {
      const response = await apiRequest('POST', '/api/student/verify-otp', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome!",
        description: "Successfully logged in",
      });
      if (data.profileCompleted) {
        setLocation("/student");
      } else {
        setLocation("/student/profile");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handlePhoneLogin = (data: PhoneLoginForm) => {
    requestOtpMutation.mutate({
      identifier: data.phone,
      name: data.name,
      type: "phone"
    });
  };

  const handleEmailCheck = (data: EmailCheckForm) => {
    checkEmailMutation.mutate(data);
  };

  const handleEmailLogin = (data: EmailLoginForm) => {
    emailLoginMutation.mutate(data);
  };

  const handleEmailRegister = (data: EmailRegisterForm) => {
    emailRegisterMutation.mutate(data);
  };

  const handleOtpVerify = (data: OtpVerifyForm) => {
    verifyOtpMutation.mutate({
      identifier: pendingIdentifier,
      otp: data.otp,
      type: pendingType
    });
  };

  const resetToMain = () => {
    setLoginMode("email");
    setEmailFlow("check");
    setShowOtpInput(false);
    setUserExists(false);
    setPendingIdentifier("");
    // Reset all forms
    phoneForm.reset();
    emailCheckForm.reset();
    emailLoginForm.reset();
    emailRegisterForm.reset();
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
          <CardTitle className="text-2xl font-bold">Welcome to Pooja Academy</CardTitle>
          <CardDescription>
            {showOtpInput 
              ? "Enter the verification code sent to you"
              : loginMode === "phone" 
                ? "Sign in with your phone number"
                : emailFlow === "check"
                  ? "Sign in with your email"
                  : emailFlow === "login"
                    ? "Welcome back! Enter your password"
                    : "Create your new account"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Back button for sub-flows */}
          {(showOtpInput || (loginMode === "email" && emailFlow !== "check")) && (
            <Button
              variant="ghost"
              onClick={() => {
                if (showOtpInput) {
                  setShowOtpInput(false);
                } else if (loginMode === "email" && emailFlow !== "check") {
                  setEmailFlow("check");
                }
              }}
              className="p-0 h-auto text-sm text-gray-600 hover:text-blue-600"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}

          {showOtpInput ? (
            /* OTP Verification Form */
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
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={verifyOtpMutation.isPending}
                  data-testid="button-verify-otp"
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Sign In"}
                </Button>
              </form>
            </Form>
          ) : loginMode === "phone" ? (
            /* Phone Login Form */
            <div className="space-y-4">
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(handlePhoneLogin)} className="space-y-4">
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
                              placeholder="+91 9876543210"
                              className="pl-10"
                              data-testid="input-phone"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                              data-testid="input-name"
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
                    data-testid="button-send-otp"
                  >
                    {requestOtpMutation.isPending ? "Sending..." : "Send OTP"}
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setLoginMode("email");
                  setEmailFlow("check");
                  emailCheckForm.reset();
                  emailLoginForm.reset();
                  emailRegisterForm.reset();
                }}
                className="w-full"
                data-testid="button-switch-email"
              >
                <Mail className="w-4 h-4 mr-2" />
                Continue with Email
              </Button>
            </div>
          ) : emailFlow === "check" ? (
            /* Email Check Form */
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="email-input"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid="input-email"
                      autoFocus
                      style={{ pointerEvents: 'auto', userSelect: 'text' }}
                    />
                  </div>
                </div>

                <Button 
                  type="button"
                  onClick={() => {
                    const emailInput = document.getElementById('email-input') as HTMLInputElement;
                    const email = emailInput?.value || '';
                    if (email.trim()) {
                      handleEmailCheck({ email: email.trim() });
                    } else {
                      toast({
                        title: "Please enter an email",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="w-full" 
                  disabled={checkEmailMutation.isPending}
                  data-testid="button-continue-email"
                >
                  {checkEmailMutation.isPending ? "Checking..." : "Continue"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setLoginMode("email");
                  phoneForm.reset();
                }}
                className="w-full"
                data-testid="button-switch-phone"
              >
                <Phone className="w-4 h-4 mr-2" />
                Continue with Phone
              </Button>
            </div>
          ) : emailFlow === "login" ? (
            /* Email Login Form (Returning User) */
            <Form {...emailLoginForm}>
              <form onSubmit={emailLoginForm.handleSubmit(handleEmailLogin)} className="space-y-4">
                <FormField
                  control={emailLoginForm.control}
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
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={emailLoginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={emailLoginMutation.isPending}
                  data-testid="button-login"
                >
                  {emailLoginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          ) : (
            /* Email Register Form (New User) */
            <Form {...emailRegisterForm}>
              <form onSubmit={emailRegisterForm.handleSubmit(handleEmailRegister)} className="space-y-4">
                <FormField
                  control={emailRegisterForm.control}
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
                            disabled
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={emailRegisterForm.control}
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
                
                <FormField
                  control={emailRegisterForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Create Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="pl-10 pr-10"
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={emailRegisterForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10"
                            data-testid="input-confirm-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={emailRegisterMutation.isPending}
                  data-testid="button-register"
                >
                  {emailRegisterMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          )}

          {/* Help text */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}