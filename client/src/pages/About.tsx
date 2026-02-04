import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Users, Lightbulb, HelpCircle } from "lucide-react";
import aboutGroupImage from "@assets/image_1755771336388.png";

const About = () => {
  const features = [
    {
      icon: Target,
      title: "Result-Oriented",
      description: "Proven track record with 95% success rate in board examinations.",
      color: "bg-gradient-to-br from-blue-100 to-blue-200"
    },
    {
      icon: Users,
      title: "Expert Faculty",
      description: "Experienced teachers with years of academic excellence and subject expertise.",
      color: "bg-gradient-to-br from-green-100 to-green-200"
    },
    {
      icon: Lightbulb,
      title: "Concept Clarity",
      description: "Focus on fundamental understanding rather than rote learning methods.",
      color: "bg-gradient-to-br from-yellow-100 to-yellow-200"
    },
    {
      icon: HelpCircle,
      title: "Doubt Resolution",
      description: "24/7 doubt clearing sessions and personalized attention to every student.",
      color: "bg-gradient-to-br from-purple-100 to-purple-200"
    }
  ];

  const faculty = [
    {
      name: "Ram Sir",
      subjects: "Physics & Chemistry",
      experience: "10+ years experience in JEE & NEET coaching",
      avatar: "RS",
      color: "from-blue-400 to-blue-600",
      description: "Lead Faculty with proven track record of 1000+ students"
    }
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-skyblue to-white py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center animate-slide-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-4 sm:mb-6 leading-tight">
              About Pooja Academy
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
              Located in the heart of Kirari, Delhi, near Haridas Vatika, Pooja Academy is
              dedicated to nurturing academic excellence from Class 9 to 12, along with
              preparation for competitive exams like JEE and NEET.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16">
            <div className="animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4 sm:mb-6">Our Story</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Welcome to Pooja Academy – Kirari's most trusted institute for Science and Commerce coaching!
                At the core of Pooja Academy is our lead faculty, Ram Sir – a passionate educator with 10+
                years of experience in teaching Physics and Chemistry.
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                With a proven track record of teaching over 1000+ students, Ram Sir has played a key role
                in shaping the futures of learners across Delhi. Many students have scored 90+ marks in
                CBSE boards and secured top ranks in JEE/NEET under Ram Sir's mentorship.
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Our structured curriculum is well-organized, chapter-wise, and designed to be easy to
                navigate — whether you are a school student or aiming for national-level exams. We offer
                comprehensive resources including detailed notes, previous year questions (PYQs), and more.
              </p>
            </div>
            <div className="animate-slide-up">
              <img
                src={aboutGroupImage}
                alt="Students and Teachers at Pooja Academy"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-16 animate-slide-up">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-1 sm:mb-2" data-testid="text-years-experience">10+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-1 sm:mb-2" data-testid="text-success-rate">1000+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Students Taught</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-1 sm:mb-2" data-testid="text-subjects-offered">8+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Subjects Offered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-1 sm:mb-2" data-testid="text-success-rate">95%</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4 sm:mb-6">Why Choose Pooja Academy?</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed">
              We are committed to providing quality education with proven results and personalized attention.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="text-center group animate-slide-up bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-6 sm:p-8"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-0">
                    <div className={`${feature.color} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <IconComponent className="text-navy h-7 w-7 sm:h-9 sm:w-9" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-navy mb-3 sm:mb-4">{feature.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3 sm:mb-4">Meet Our Expert Faculty</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Our dedicated team of experienced educators is committed to your academic success.
            </p>
          </div>

          <div className="flex justify-center">
            {faculty.map((member, index) => (
              <Card
                key={member.name}
                className="text-center shadow-lg hover:shadow-xl transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${member.color} rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold`}>
                    {member.avatar}
                  </div>
                  <h4 className="font-semibold text-navy mb-1" data-testid={`text-faculty-${member.name.toLowerCase().replace(/\s+/g, "-").replace(".", "")}`}>
                    {member.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{member.subjects}</p>
                  <p className="text-xs text-gray-500 mb-2">{member.experience}</p>
                  <p className="text-xs text-blue-600 font-semibold">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16 bg-navy text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <div className="animate-slide-up">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Our Mission</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                To provide world-class education that empowers students to achieve their
                academic goals while developing critical thinking, problem-solving skills,
                and moral values that will serve them throughout their lives.
              </p>
            </div>
            <div className="animate-slide-up">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Our Vision</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                To be the leading educational institution that transforms lives by making
                quality education accessible, affordable, and effective for students from
                all backgrounds, fostering a culture of excellence and innovation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-softgray">
        <div className="container mx-auto px-4">
          <div className="text-center animate-slide-up">
            <h2 className="text-3xl font-bold text-navy mb-4">Visit Our Campus</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience our state-of-the-art facilities and meet our faculty in person.
              We welcome you to visit us and see what makes Pooja Academy special.
            </p>

            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-3">📍</span>
                  <div>
                    <h4 className="font-semibold text-navy">Address</h4>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Kirari,+Delhi+Near+Haridas+Vatika&travelmode=driving"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:bg-blue-50 p-3 rounded-lg transition-colors duration-200"
                      data-testid="link-about-google-maps"
                    >
                      <p className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                        📍 Kirari, Delhi - Near Haridas Vatika
                      </p>
                      <p className="text-xs text-blue-500 mt-1">
                        🗺️ Click to open in Google Maps & get directions
                      </p>
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-3">🕒</span>
                  <div>
                    <h4 className="font-semibold text-navy">Office Hours</h4>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Sunday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <a
                    href="https://wa.me/918800345115?text=Hello!%20I%20visited%20your%20About%20page%20and%20am%20impressed%20with%20Pooja%20Academy.%20I%20would%20like%20to%20know%20more%20about%20admissions%20and%20course%20details."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
                      data-testid="button-about-whatsapp"
                    >
                      <span className="mr-2">💬</span>
                      Contact Us on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
