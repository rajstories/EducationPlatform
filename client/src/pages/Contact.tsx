import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactFormSchema = insertContactSchema.extend({
  selectedClass: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      selectedClass: "",
      message: "",
    },
  });

  const submitContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitContactMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-skyblue to-white py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center animate-slide-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-4 sm:mb-6 leading-tight">
              Get In Touch
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 max-w-2xl mx-auto px-4">
              Have questions about our courses? Want to schedule a visit? We're here to help!
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Form */}
            <div className="animate-slide-up">
              <Card>
                <CardHeader>
                  <CardTitle className="text-navy">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your full name" 
                                  {...field}
                                  data-testid="input-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your phone number" 
                                  {...field}
                                  data-testid="input-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="your.email@example.com" 
                                {...field}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="selectedClass"
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
                                <SelectItem value="class-9">Class 9</SelectItem>
                                <SelectItem value="class-10">Class 10</SelectItem>
                                <SelectItem value="class-11">Class 11</SelectItem>
                                <SelectItem value="class-12">Class 12</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Tell us about your requirements..."
                                className="resize-none"
                                {...field}
                                data-testid="textarea-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-3">
                        <Button
                          type="submit"
                          className="w-full bg-navy hover:bg-blue-800 text-white"
                          disabled={submitContactMutation.isPending}
                          data-testid="button-submit-contact"
                        >
                          {submitContactMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                        
                        <div className="text-center text-sm text-gray-500">or</div>
                        
                        <a
                          href="https://wa.me/918800345115?text=Hello!%20I%20have%20filled%20the%20contact%20form%20on%20your%20website.%20Please%20get%20back%20to%20me%20with%20details%20about%20Pooja%20Academy."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button 
                            type="button" 
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                            data-testid="button-whatsapp-contact"
                          >
                            <span className="mr-2">💬</span>
                            Contact via WhatsApp
                          </Button>
                        </a>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-navy mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-skyblue w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-1">Address</h4>
                      <a 
                        href="https://www.google.com/maps/dir/?api=1&destination=Kirari,+Delhi+Near+Haridas+Vatika&travelmode=driving"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200"
                        data-testid="link-google-maps"
                      >
                        <p className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200" data-testid="text-address">
                          📍 Kirari, Delhi - Near Haridas Vatika
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          🗺️ Click to open in Google Maps & get directions
                        </p>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-sagegreen w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Phone className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-1">Phone</h4>
                      <p className="text-gray-600 text-sm" data-testid="text-phone-1">+91 7011505239</p>
                      <p className="text-gray-600 text-sm font-semibold text-blue-600" data-testid="text-phone-2">(Ram Sir)</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-1">Email</h4>
                      <p className="text-gray-600 text-sm" data-testid="text-email-1">info@poojaacademy.com</p>
                      <p className="text-gray-600 text-sm" data-testid="text-email-2">admissions@poojaacademy.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Clock className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-1">Office Hours</h4>
                      <p className="text-gray-600 text-sm" data-testid="text-hours-1">Mon - Sat: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600 text-sm" data-testid="text-hours-2">Sunday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/918800345115?text=Hi!%20I%20want%20to%20know%20about%20Pooja%20Academy.%20Please%20share%20information%20about%20courses,%20fees,%20and%20admission%20process."
                className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-whatsapp"
              >
                <span className="mr-2 text-xl">💬</span>
                Chat on WhatsApp
              </a>

              {/* Google Maps Placeholder */}
              <Card>
                <CardContent className="p-0">
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="font-semibold" data-testid="text-map-title">Google Maps Location</p>
                      <p className="text-sm" data-testid="text-map-location">Kirari, Delhi - Near Haridas Vatika</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-softgray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-navy mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quick answers to common questions about Pooja Academy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="animate-slide-up">
              <CardContent className="p-6">
                <h4 className="font-semibold text-navy mb-2">What are your class timings?</h4>
                <p className="text-gray-600 text-sm">
                  We offer flexible timings to accommodate students' school schedules. 
                  Morning batches start from 6:00 AM and evening batches go until 8:00 PM.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardContent className="p-6">
                <h4 className="font-semibold text-navy mb-2">Do you provide study materials?</h4>
                <p className="text-gray-600 text-sm">
                  Yes, we provide comprehensive study materials including notes, 
                  practice questions, and previous year papers for all subjects.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardContent className="p-6">
                <h4 className="font-semibold text-navy mb-2">What is your fee structure?</h4>
                <p className="text-gray-600 text-sm">
                  Our fees vary by class and subjects. We offer competitive pricing 
                  with flexible payment options. Contact us for detailed fee structure.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardContent className="p-6">
                <h4 className="font-semibold text-navy mb-2">Do you offer online classes?</h4>
                <p className="text-gray-600 text-sm">
                  Yes, we provide both online and offline classes. Our online platform 
                  offers live interactive sessions with recorded lectures for revision.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
