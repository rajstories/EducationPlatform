import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, FileText, HelpCircle, Play, Calendar } from "lucide-react";
import PaymentModal from "@/components/PaymentModal";
import type { Class, Subject, Chapter } from "@shared/schema";

const ClassDetail = () => {
  const [, params] = useRoute("/class/:id");
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: classData, isLoading: classLoading } = useQuery<Class>({
    queryKey: ['/api/classes', params?.id]
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['/api/classes', params?.id, 'subjects'],
    enabled: !!params?.id
  });

  const { data: chapters } = useQuery<Chapter[]>({
    queryKey: ['/api/subjects', selectedSubject?.id, 'chapters'],
    enabled: !!selectedSubject?.id
  });

  const handleEnroll = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsPaymentModalOpen(true);
  };

  const getSubjectIcon = (iconClass: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'fas fa-atom': '⚛️',
      'fas fa-flask': '🧪', 
      'fas fa-calculator': '🔢',
      'fas fa-dna': '🧬',
      'fas fa-chart-line': '📈',
      'fas fa-file-invoice-dollar': '💰',
      'fas fa-briefcase': '💼'
    };
    return iconMap[iconClass] || '📚';
  };

  if (classLoading || subjectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Class not found</h1>
          <Link href="/">
            <Button className="bg-navy hover:bg-blue-800 text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasMultipleStreams = classData && Array.isArray(classData.streams) && classData.streams.length > 1 && !classData.streams.includes("both");
  const filteredSubjects = selectedStream 
    ? subjects?.filter(s => s.stream === selectedStream || s.stream === "both")
    : subjects?.filter(s => s.stream === "both") || subjects;

  return (
    <div className="min-h-screen bg-softgray animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-8 animate-slide-up">
          <Link href="/" className="inline-flex items-center text-navy hover:text-blue-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Link>
          <h1 className="text-3xl font-bold text-navy mb-2" data-testid={`text-${classData?.name?.toLowerCase().replace(" ", "-") || 'class'}`}>
            {classData?.name || 'Loading...'}
          </h1>
          <p className="text-gray-600">Explore subjects and chapters for your class.</p>
        </div>

        {/* Stream Selection for Classes 11 & 12 */}
        {hasMultipleStreams && !selectedStream && (
          <div className="mb-8 animate-slide-up">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-600 mb-4">Choose Your Stream:</h2>
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  className="px-8 py-2"
                  onClick={() => setSelectedStream("science")}
                  data-testid="button-science-stream"
                >
                  Science
                </Button>
                <Button 
                  variant="outline"
                  className="px-8 py-2"
                  onClick={() => setSelectedStream("commerce")}
                  data-testid="button-commerce-stream"
                >
                  Commerce
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subject Accordion */}
        {(!hasMultipleStreams || selectedStream) && (
          <div className="animate-slide-up">
            {selectedStream && (
              <div className="text-center mb-6">
                <p className="text-gray-600">Showing subjects for {selectedStream} stream.</p>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedStream(null)}
                  className="text-navy hover:text-blue-800 mt-2"
                  data-testid="button-change-stream"
                >
                  ← Go Back
                </Button>
              </div>
            )}

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {filteredSubjects?.map((subject, index) => (
                  <AccordionItem 
                    key={subject.id} 
                    value={subject.id}
                    className="bg-white border border-gray-200 rounded-lg px-6 py-2 shadow-sm animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <AccordionTrigger 
                      className="text-lg font-semibold text-gray-800 hover:no-underline py-6"
                      data-testid={`accordion-${subject.name.toLowerCase()}`}
                    >
                      {subject.name}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-navy mb-2">Course Details</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• {subject.chapterCount} comprehensive chapters</li>
                              <li>• Expert-curated study materials</li>
                              <li>• Previous year questions</li>
                              <li>• Practice exercises</li>
                            </ul>
                          </div>
                          <div className="text-center md:text-right">
                            <div className="mb-4">
                              <span className="text-2xl font-bold text-blue-600">
                                ₹{subject.price}
                              </span>
                              <span className="text-gray-500 text-sm">/subject</span>
                            </div>
                            {subject.isAvailable ? (
                              <Button
                                className="bg-navy hover:bg-blue-800 text-white px-8"
                                onClick={() => handleEnroll(subject)}
                                data-testid={`button-enroll-${subject.name.toLowerCase()}`}
                              >
                                Enroll Now
                              </Button>
                            ) : (
                              <Button
                                disabled
                                className="bg-gray-300 text-gray-500 cursor-not-allowed px-8"
                                data-testid={`button-coming-soon-${subject.name.toLowerCase()}`}
                              >
                                Coming Soon
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        {/* Resources Section */}
        <section className="mt-16 animate-slide-up">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-navy mb-6 text-center">
                What You Get With Each Subject
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-skyblue w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-navy" />
                  </div>
                  <h4 className="font-semibold text-navy mb-2">Comprehensive Notes</h4>
                  <p className="text-sm text-gray-600">
                    Detailed chapter-wise notes prepared by expert faculty
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-sagegreen w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="h-8 w-8 text-navy" />
                  </div>
                  <h4 className="font-semibold text-navy mb-2">Previous Year Questions</h4>
                  <p className="text-sm text-gray-600">
                    Curated collection of important questions from past exams
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-navy" />
                  </div>
                  <h4 className="font-semibold text-navy mb-2">Concept Videos</h4>
                  <p className="text-sm text-gray-600">
                    Video explanations for complex topics and problem solving
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        subject={selectedSubject}
      />
    </div>
  );
};

export default ClassDetail;
