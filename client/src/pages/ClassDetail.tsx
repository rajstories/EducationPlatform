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

  const hasMultipleStreams = classData.streams.length > 1 && !classData.streams.includes("both");
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
          <h1 className="text-3xl font-bold text-navy mb-2" data-testid={`text-${classData.name.toLowerCase().replace(" ", "-")}`}>
            {classData.name}
          </h1>
          <p className="text-gray-600">{classData.description} with comprehensive study materials</p>
        </div>

        {/* Stream Selection for Classes 11 & 12 */}
        {hasMultipleStreams && !selectedStream && (
          <div className="mb-8 animate-slide-up">
            <h2 className="text-xl font-semibold text-navy mb-4">Choose Your Stream</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedStream("science")}
                data-testid="card-science-stream"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-navy mb-2">Science Stream</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Physics, Chemistry, Mathematics, Biology
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Physics</Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Chemistry</Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">Mathematics</Badge>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Biology</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedStream("commerce")}
                data-testid="card-commerce-stream"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-navy mb-2">Commerce Stream</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Economics, Accounts, Business Studies, Mathematics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Economics</Badge>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-800">Accounts</Badge>
                    <Badge variant="secondary" className="bg-teal-100 text-teal-800">Business Studies</Badge>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">Mathematics</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Subject Cards */}
        {(!hasMultipleStreams || selectedStream) && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-navy">Available Subjects</h2>
              {selectedStream && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedStream(null)}
                  data-testid="button-change-stream"
                >
                  Change Stream
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects?.map((subject, index) => (
                <Card 
                  key={subject.id} 
                  className="shadow-lg animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-4">
                        {getSubjectIcon(subject.icon)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-navy" data-testid={`text-subject-${subject.name.toLowerCase()}`}>
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {subject.chapterCount} Chapters
                        </p>
                      </div>
                    </div>

                    {/* Sample Chapters Preview */}
                    {subject.isAvailable && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-navy mb-2">Sample Chapters:</h4>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                            Chapter 1: Introduction to {subject.name}
                          </div>
                          <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                            Chapter 2: Basic Concepts
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                            data-testid={`button-view-all-chapters-${subject.name.toLowerCase()}`}
                          >
                            + View all {subject.chapterCount} chapters
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {subject.isAvailable ? (
                        <>
                          <div className="text-center">
                            <span className="text-2xl font-bold text-blue-600">
                              ₹{subject.price}
                            </span>
                            <span className="text-gray-500 text-sm">/subject</span>
                          </div>
                          <Button
                            className="w-full bg-navy hover:bg-blue-800 text-white"
                            onClick={() => handleEnroll(subject)}
                            data-testid={`button-enroll-${subject.name.toLowerCase()}`}
                          >
                            Enroll in {subject.name}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-center mb-4">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Coming Soon
                            </Badge>
                          </div>
                          <Button
                            disabled
                            className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                            data-testid={`button-coming-soon-${subject.name.toLowerCase()}`}
                          >
                            Enroll in {subject.name}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
