import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { 
  User, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Users, 
  Phone, 
  Mail,
  Save,
  ArrowLeft
} from "lucide-react";

const editProfileSchema = z.object({
  // Personal Information
  name: z.string().min(2, "Name is required"),
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

type EditProfileForm = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { student, isAuthenticated } = useStudentAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: "",
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

  // Get current profile data
  const profileQuery = useQuery({
    queryKey: ['/api/student/profile'],
    enabled: isAuthenticated,
  });

  // Get available classes
  const classesQuery = useQuery({
    queryKey: ['/api/classes'],
  });

  // Populate form with current data
  useEffect(() => {
    if (profileQuery.data) {
      const profile = profileQuery.data;
      form.reset({
        name: profile.name || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "Delhi",
        pincode: profile.pincode || "",
        classId: profile.classId || "",
        stream: profile.stream || "",
        fatherName: profile.fatherName || "",
        motherName: profile.motherName || "",
        parentPhone: profile.parentPhone || "",
        parentEmail: profile.parentEmail || "",
        parentOccupation: profile.parentOccupation || "",
        emergencyContact: profile.emergencyContact || "",
      });
    }
  }, [profileQuery.data, form]);

  // Profile update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EditProfileForm) => {
      const response = await apiRequest('PUT', '/api/student/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated Successfully! ✅",
        description: "Your profile information has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/student/profile'] });
      setLocation("/student-dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditProfileForm) => {
    updateMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/student-dashboard")}
            className="flex items-center gap-2"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-navy">Edit Profile</h1>
            <p className="text-gray-600">Update your personal and academic information</p>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-navy to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="w-6 h-6" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-blue-100">
              Keep your information up to date for the best experience
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <User className="w-5 h-5 text-navy" />
                    <h3 className="text-xl font-semibold text-navy">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your full name" data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-date-of-birth" />
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
                              <SelectTrigger data-testid="select-gender">
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

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="110072" data-testid="input-pincode" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Delhi" data-testid="input-city" />
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
                            <Input {...field} placeholder="Delhi" data-testid="input-state" />
                          </FormControl>
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
                          <Textarea 
                            {...field} 
                            placeholder="Enter your complete address" 
                            className="min-h-[80px]"
                            data-testid="textarea-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Academic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <GraduationCap className="w-5 h-5 text-navy" />
                    <h3 className="text-xl font-semibold text-navy">Academic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="classId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-class">
                                <SelectValue placeholder="Select your class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {classesQuery.data?.map((cls: any) => (
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
                      name="stream"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-stream">
                                <SelectValue placeholder="Select your stream" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="commerce">Commerce</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Parent/Guardian Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Users className="w-5 h-5 text-navy" />
                    <h3 className="text-xl font-semibold text-navy">Parent/Guardian Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fatherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father's Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter father's name" data-testid="input-father-name" />
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
                            <Input {...field} placeholder="Enter mother's name" data-testid="input-mother-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent's Phone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="9876543210" data-testid="input-parent-phone" />
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
                            <Input {...field} placeholder="parent@example.com" data-testid="input-parent-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentOccupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent's Occupation</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter occupation" data-testid="input-parent-occupation" />
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
                            <Input {...field} placeholder="9876543210" data-testid="input-emergency-contact" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/student-dashboard")}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-navy hover:bg-blue-700 flex items-center gap-2 min-w-[120px]"
                    data-testid="button-save-profile"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}