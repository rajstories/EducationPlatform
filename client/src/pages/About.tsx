import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Lightbulb, HelpCircle } from "lucide-react";

const About = () => {
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

  const faculty = [
    {
      name: "Dr. Rajesh Sharma",
      subjects: "Physics & Mathematics",
      experience: "15+ years experience in JEE coaching",
      avatar: "RS",
      color: "from-blue-400 to-blue-600"
    },
    {
      name: "Prof. Priya Mehta",
      subjects: "Chemistry & Biology",
      experience: "12+ years experience in NEET preparation", 
      avatar: "PM",
      color: "from-green-400 to-green-600"
    },
    {
      name: "Mr. Amit Kumar",
      subjects: "Commerce & Economics",
      experience: "10+ years experience in Commerce stream",
      avatar: "AK",
      color: "from-purple-400 to-purple-600"
    },
    {
      name: "Ms. Sunita Gupta",
      subjects: "English & Hindi",
      experience: "8+ years experience in language teaching",
      avatar: "SG",
      color: "from-pink-400 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-skyblue to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">
              About Pooja Academy
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Since our establishment, we have been dedicated to providing quality education 
              for students in Classes 9-12, nurturing not just academic excellence but also 
              character development and critical thinking skills.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="animate-slide-up">
              <h2 className="text-3xl font-bold text-navy mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Founded with a vision to transform education, Pooja Academy has grown into 
                one of the most trusted names in academic coaching. Our journey began with 
                a simple belief: every student has the potential to excel when provided with 
                the right guidance and environment.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our experienced faculty and result-oriented teaching methodology have helped 
                thousands of students achieve their academic goals and secure admissions in 
                top universities and colleges across the country.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe in creating a supportive learning ecosystem where students can 
                explore their potential, ask questions freely, and develop the confidence 
                needed to succeed in their academic pursuits.
              </p>
            </div>
            <div className="animate-slide-up">
              <img
                src="https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Modern classroom environment"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 animate-slide-up">
            <div className="text-center">
              <div className="text-4xl font-bold text-navy mb-2" data-testid="text-years-experience">15+</div>
              <div className="text-gray-600">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-navy mb-2" data-testid="text-success-rate">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-navy mb-2" data-testid="text-students-taught">10,000+</div>
              <div className="text-gray-600">Students Taught</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-navy mb-2" data-testid="text-faculty-members">50+</div>
              <div className="text-gray-600">Expert Faculty</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-softgray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-navy mb-4">Why Choose Pooja Academy?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our commitment to excellence and student success sets us apart from other institutions.
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

      {/* Faculty Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-navy mb-4">Meet Our Expert Faculty</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our dedicated team of experienced educators is committed to your academic success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <p className="text-xs text-gray-500">{member.experience}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-navy text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="animate-slide-up">
              <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                To provide world-class education that empowers students to achieve their 
                academic goals while developing critical thinking, problem-solving skills, 
                and moral values that will serve them throughout their lives.
              </p>
            </div>
            <div className="animate-slide-up">
              <h3 className="text-2xl font-bold mb-6">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
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
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-3">📍</span>
                  <div>
                    <h4 className="font-semibold text-navy">Address</h4>
                    <p className="text-gray-600">123 Education Street, Connaught Place, New Delhi - 110001</p>
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
