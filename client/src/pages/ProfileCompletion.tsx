import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  User, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Users, 
  Phone, 
  Mail,
  Save,
  ArrowRight
} from "lucide-react";

const profileSchema = z.object({
  // Personal Information
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(10, "Please provide complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().default("Delhi"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Please enter valid 6-digit pincode"),
  
  // Academic Information  
  classId: z.string().min(1, "Please select your class"),
  stream: z.string().min(1, "Please select your stream"),
  
  // Parent/Guardian Information
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  parentPhone: z.string().regex(/^[+]?[0-9]{10,15}$/, "Please enter valid phone number"),
  parentEmail: z.string().email("Please enter valid email").optional().or(z.literal("")),
  parentOccupation: z.string().min(2, "Parent's occupation is required"),
  emergencyContact: z.string().regex(/^[+]?[0-9]{10,15}$/, "Please enter valid emergency contact"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileCompletion() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      dateOfBirth: "",
      gender: "",
      address: "",
      city: "",
      state: "Delhi",
      pincode: "",
      classId: "",
      stream: "",
      fatherName: "",
      motherName: "",
      parentPhone: "",
      parentEmail: "",
      parentOccupation: "",
      emergencyContact: "",
    },
  });

  // Get available classes
  const classesQuery = useQuery({
    queryKey: ['/api/classes'],
  });

  // Profile completion mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await apiRequest('POST', '/api/student/complete-profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Completed! 🎉",
        description: "Welcome to Pooja Academy! Your profile has been set up successfully.",
      });
      setLocation("/student-dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Profile Update Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    profileMutation.mutate(data);
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate personal info fields
      const personalFields = ["dateOfBirth", "gender", "address", "city", "pincode"] as const;
      const hasErrors = personalFields.some(field => {
        const error = form.formState.errors[field];
        if (error) {
          form.trigger(field);
          return true;
        }
        return false;
      });
      if (!hasErrors) setStep(2);
    } else if (step === 2) {
      // Validate academic fields
      form.trigger(["classId", "stream"]).then(isValid => {
        if (isValid) setStep(3);
      });
    }
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <GraduationCap className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-navy mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Let's set up your student profile to get started with Pooja Academy</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <User className="w-4 h-4" />
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <><User className="w-5 h-5" /> Personal Information</>}
              {step === 2 && <><GraduationCap className="w-5 h-5" /> Academic Information</>}
              {step === 3 && <><Users className="w-5 h-5" /> Parent/Guardian Information</>}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "Your academic details"}
              {step === 3 && "Emergency contact information"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complete Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="House/Flat No., Street, Locality..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Your city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123456" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Academic Information */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(classesQuery.data || []).map((classItem: any) => (
                                  <SelectItem key={classItem.id} value={classItem.id}>
                                    {classItem.name}
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
                        name="stream"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stream</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your stream" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="science">Science (PCM/PCB)</SelectItem>
                                <SelectItem value="commerce">Commerce</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Parent/Guardian Information */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Father's full name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Mother's full name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parentPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent's Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+91 9876543210" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="parentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent's Email (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="parent@example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parentOccupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent's Occupation</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Teacher, Engineer, Business" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+91 9876543210" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <div>
                    {step > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    {step < 3 ? (
                      <Button type="button" onClick={nextStep}>
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={profileMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {profileMutation.isPending ? (
                          "Completing Profile..."
                        ) : (
                          <>
                            Complete Profile <Save className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}