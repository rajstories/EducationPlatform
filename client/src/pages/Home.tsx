import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calculator, Atom, Target, Users, Lightbulb, HelpCircle, Star } from "lucide-react";
import type { Class } from "@shared/schema";

const Home = () => {
  const { data: classes, isLoading } = useQuery<Class[]>({
    queryKey: ['/api/classes']
  });

  const features = [
    {
      icon: Target,
      title: "Result-Oriented",
      description: "Proven track record with 95% success rate in board examinations.",
      color: "bg-skyblue"
    },
    {
      icon: Users,
      title: "Expert Faculty",
      description: "Experienced teachers with years of academic excellence and subject expertise.",
      color: "bg-sagegreen"
    },
    {
      icon: Lightbulb,
      title: "Concept Clarity",
      description: "Focus on fundamental understanding rather than rote learning methods.",
      color: "bg-yellow-100"
    },
    {
      icon: HelpCircle,
      title: "Doubt Resolution",
      description: "24/7 doubt clearing sessions and personalized attention to every student.",
      color: "bg-purple-100"
    }
  ];

  const testimonials = [
    {
      name: "Arjun Patel",
      class: "Class 12 Science (2023)",
      message: "The faculty at Pooja Academy helped me understand complex physics concepts with ease. Their doubt resolution sessions were incredibly helpful for my JEE preparation.",
      avatar: "A",
      color: "from-blue-400 to-blue-600"
    },
    {
      name: "Priya Sharma", 
      class: "Class 12 Commerce (2023)",
      message: "The structured approach to accounts and economics made these subjects so much easier. I scored 95% in board exams thanks to their excellent teaching methodology.",
      avatar: "P",
      color: "from-pink-400 to-pink-600"
    },
    {
      name: "Rohit Kumar",
      class: "Parent",
      message: "My daughter's confidence in mathematics improved significantly after joining Pooja Academy. The teachers provide personalized attention and regular progress updates.",
      avatar: "R", 
      color: "from-green-400 to-green-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-skyblue to-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6 leading-tight">
                Welcome to <span className="text-blue-600">Pooja Academy</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Nurturing academic excellence for Classes 9-12 in Science and Commerce streams. 
                Join thousands of successful students who achieved their dreams with our expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-navy hover:bg-blue-800 text-white"
                  data-testid="button-explore-courses"
                >
                  Explore Courses
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-navy text-navy hover:bg-navy hover:text-white"
                  data-testid="button-download-brochure"
                >
                  Download Brochure
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Students studying in classroom"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-sagegreen p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-navy" data-testid="text-students-count">10,000+</div>
                <div className="text-sm text-gray-600">Students Enrolled</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-softgray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-navy mb-4">Choose Your Class</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access comprehensive study materials, notes, and previous year questions tailored for your class.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes?.map((classData, index) => {
              const icons = [BookOpen, Calculator, Atom, Target];
              const IconComponent = icons[index] || BookOpen;
              const colors = ["bg-skyblue", "bg-sagegreen", "bg-yellow-100", "bg-purple-100"];
              const hoverColors = ["group-hover:bg-blue-200", "group-hover:bg-green-200", "group-hover:bg-yellow-200", "group-hover:bg-purple-200"];
              
              return (
                <Card 
                  key={classData.id} 
                  className="shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`${colors[index]} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${hoverColors[index]}`}>
                      <IconComponent className="text-navy text-2xl h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-navy mb-2">{classData.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{classData.description}</p>
                    <p className="text-2xl font-bold text-blue-600 mb-4">₹{classData.price.toLocaleString()}/year</p>
                    <Link href={`/class/${classData.id}`}>
                      <Button 
                        className="w-full bg-navy hover:bg-blue-800 text-white"
                        data-testid={`button-view-${classData.name.toLowerCase().replace(" ", "-")}`}
                      >
                        {classData.streams.includes("science") && classData.streams.includes("commerce") 
                          ? "Choose Stream" 
                          : "View Subjects"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-navy mb-4">Why Choose Pooja Academy?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are committed to providing quality education with proven results and personalized attention.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={feature.title} 
                  className="text-center group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`${feature.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="text-navy text-2xl h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-16 bg-softgray">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl font-bold text-navy mb-6">About Pooja Academy</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Since our establishment, Pooja Academy has been dedicated to providing quality education 
                for students in Classes 9-12. We believe in nurturing not just academic excellence, 
                but also character development and critical thinking skills.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy" data-testid="text-experience-years">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy" data-testid="text-success-rate">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy" data-testid="text-faculty-count">50+</div>
                  <div className="text-sm text-gray-600">Expert Faculty</div>
                </div>
              </div>
              <Link href="/about">
                <Button className="bg-navy hover:bg-blue-800 text-white" data-testid="button-learn-more">
                  Learn More About Us
                </Button>
              </Link>
            </div>
            <div className="animate-slide-up">
              <img
                src="https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Modern classroom environment"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-navy mb-4">What Our Students Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from our successful students and their parents about their experience at Pooja Academy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.name} 
                className="shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy" data-testid={`text-testimonial-${testimonial.name.toLowerCase().replace(" ", "-")}`}>
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">{testimonial.class}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 italic leading-relaxed">
                    "{testimonial.message}"
                  </p>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy text-white">
        <div className="container mx-auto px-4 text-center animate-slide-up">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Academic Journey?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have achieved their dreams with Pooja Academy. 
            Start your journey to academic excellence today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button 
                size="lg"
                className="bg-skyblue text-navy hover:bg-blue-200"
                data-testid="button-get-started"
              >
                Get Started Today
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-navy"
                data-testid="button-contact-us"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
