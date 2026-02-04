import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calculator, Atom, Target, Users, Lightbulb, HelpCircle, Star } from "lucide-react";
import type { Class } from "@shared/schema";
import ResultsCarousel from "@/components/ResultsCarousel";
import aboutGroupImage from "@assets/image_1755771336388.png";



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
    <div className="animate-fade-in pt-20">
      {/* Hero Results Slider */}
      <section className="relative py-8 md:py-16 bg-white overflow-hidden">
        {/* Results Carousel */}
        <div className="relative z-10">
          <ResultsCarousel />
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-12 sm:py-16 bg-softgray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3 sm:mb-4">Explore Our Classes</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Choose your class to access comprehensive study materials and achieve your academic goals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {classes?.map((classData, index) => {
              const iconColors = ["text-blue-500", "text-green-500", "text-purple-500", "text-red-500"];
              const descriptions = [
                "Foundation for future success.",
                "Prepare for your board exams.",
                "Choose your stream and excel.",
                "Achieve your academic goals."
              ];

              return (
                <Card
                  key={classData.id}
                  className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <BookOpen className={`${iconColors[index]} h-12 w-12 mx-auto`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{classData.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {descriptions[index]}
                    </p>
                    <Link href={`/class/${classData.id}`}>
                      <Button
                        variant="ghost"
                        className="text-gray-700 hover:text-navy font-medium text-sm p-0 h-auto"
                        data-testid={`button-view-${classData.name.toLowerCase().replace(" ", "-")}`}
                      >
                        View Details →
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
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3 sm:mb-4">Why Choose Pooja Academy?</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              We are committed to providing quality education with proven results and personalized attention.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="text-center group animate-slide-up px-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`${feature.color} w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="text-navy text-xl sm:text-2xl h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-navy mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-12 sm:py-16 bg-softgray">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4 sm:mb-6">About Pooja Academy</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Located in Kirari, Delhi, Pooja Academy has been dedicated to providing quality education
                for students in Classes 9-12. Led by Ram Sir with 10+ years of experience, we believe in
                nurturing academic excellence and helping students achieve success in competitive exams.
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-navy" data-testid="text-experience-years">10+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-navy" data-testid="text-success-rate">1000+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Students Taught</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-navy" data-testid="text-faculty-count">1</div>
                  <div className="text-xs sm:text-sm text-gray-600">Lead Faculty</div>
                </div>
              </div>
              <Link href="/about">
                <Button className="bg-navy hover:bg-blue-800 text-white text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3" data-testid="button-learn-more">
                  Learn More About Us
                </Button>
              </Link>
            </div>
            <div className="animate-slide-up">
              <img
                src={aboutGroupImage}
                alt="Students and Teachers at Pooja Academy"
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
            <a
              href="https://wa.me/918800345115?text=Hello!%20I'm%20interested%20in%20learning%20more%20about%20Pooja%20Academy.%20Could%20you%20please%20provide%20me%20with%20information%20about%20your%20courses%20and%20admission%20process?"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-skyblue text-navy hover:bg-blue-200"
                data-testid="button-get-started"
              >
                Get Started Today
              </Button>
            </a>
            <a
              href="https://wa.me/918800345115?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20Pooja%20Academy's%20courses%20and%20facilities.%20Please%20share%20the%20details."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-white text-navy hover:bg-gray-100 border-2 border-white font-semibold shadow-lg"
                data-testid="button-contact-us"
              >
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
