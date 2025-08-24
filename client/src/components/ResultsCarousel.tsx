import { useCallback, useEffect } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Star, Award, Trophy, Phone } from "lucide-react";
import raniPhoto from "@assets/Digital Marketing Social Media and Instagram Post_1755784714677.png";
import raniFacePhoto from "@assets/image_1755785587177.png";
import ramSirPhoto from "@assets/image_1755784859503.png";
import champsPhoto from "@assets/image_1756022456101.png";
import kunalPhoto from "@assets/image_1756022382197.png";
import shaileshPhoto from "@assets/image_1756022503711.png";
import ajayPhoto from "@assets/image_1756023883616.png";
import sunilSirPhoto from "@assets/image_1756025020045.png";
import diwakarSirPhoto from "@assets/image_1756025135928.png";
import biologyTeacherPhoto from "@assets/image_1756022662880.png";
import drSanjeevPhoto from "@assets/image_1756024215456.png";
import champsFullPhoto from "@assets/image_1756023373291.png";

const ResultsCarousel = () => {
  const options: EmblaOptionsType = { loop: true };
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ delay: 4000, stopOnInteraction: false })
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const slides = [
    // Student Result Slide - RANI
    {
      type: "student",
      name: "RANI",
      title: "JEE Main CLEARED",
      subtitle: "Student",
      percentile: "99.3% Percentile",
      exam: "2025 Board Exam",
      subjects: [
        { name: "Physics", score: "96" },
        { name: "Chemistry", score: "93" },
        { name: "Maths", score: "97" }
      ],
      bgGradient: "from-orange-500 to-red-500",
      textColor: "text-white"
    },
    // Ram Sir Slide
    {
      type: "mentor",
      name: "RAM SIR",
      title: "Lead Faculty",
      subtitle: "Physics & Chemistry Expert",
      experience: "10+ Years Experience",
      students: "1000+ Students Taught",
      achievement: "95% Success Rate",
      bgGradient: "from-blue-600 to-indigo-700",
      textColor: "text-white"
    },
    // Champions/Toppers Group Slide
    {
      type: "champs_full_image",
      bgGradient: "from-green-500 to-emerald-600",
      textColor: "text-white"
    },
    // Kunal Achievement Slide
    {
      type: "kunal",
      name: "Kunal",
      mainScore: "94",
      mainSubject: "SCIENCE",
      secondaryScore: "88",
      secondarySubject: "Math",
      tagline: "POOJA ACADEMY",
      phone: "8800345115",
      bgGradient: "from-blue-600 to-blue-800",
      textColor: "text-white"
    },
    // Shailesh Pandey Achievement Slide
    {
      type: "student",
      name: "SHAILESH PANDEY",
      title: "12th TOPPER",
      subtitle: "Student",
      percentile: "Class XII Board",
      exam: "2025 Board Exam",
      subjects: [
        { name: "Physics", score: "97" },
        { name: "Chemistry", score: "100" },
        { name: "Maths", score: "95" }
      ],
      bgGradient: "from-gray-600 to-gray-800",
      textColor: "text-white",
      isShailesh: true
    },
    // Ajay Kumar Air Force Achievement Slide (Full Image)
    {
      type: "airforce_full_image",
      bgGradient: "from-red-600 to-red-800",
      textColor: "text-white"
    },
    // Sunil Sir Slide
    {
      type: "mentor",
      name: "SUNIL SIR",
      title: "Commerce Faculty",
      subtitle: "Accountancy Expert",
      experience: "10+ Years Experience",
      students: "Classes 11 & 12 Commerce",
      achievement: "95% Success Rate",
      bgGradient: "from-purple-600 to-violet-700",
      textColor: "text-white",
      isSunilTeacher: true
    },
    // Diwakar Sir Slide
    {
      type: "mentor",
      name: "DIWAKAR SIR",
      title: "Math & Science Faculty",
      subtitle: "Math & Science Expert",
      experience: "5+ Years Experience",
      students: "Classes 6-10 Math & Science",
      achievement: "Foundation Building Expert",
      bgGradient: "from-orange-600 to-red-700",
      textColor: "text-white",
      isDiwakarTeacher: true
    },
    // Biology Teacher Slide
    {
      type: "mentor",
      name: "ANMOL SIR",
      title: "NEET Faculty",
      subtitle: "Botany & Biology Expert",
      experience: "5+ Years Experience",
      students: "Classes 11 & 12 NEET",
      achievement: "Pursuing MBBS - Dr. Ambedkar College",
      bgGradient: "from-green-600 to-emerald-700",
      textColor: "text-white",
      isBiologyTeacher: true
    },
    // Dr. Sanjeev Gupta Teacher Slide
    {
      type: "mentor",
      name: "DR. SANJEEV GUPTA",
      title: "NEET Faculty",
      subtitle: "Zoology Expert & MBBS Doctor",
      experience: "8+ Years Experience",
      students: "Classes 11 & 12 NEET",
      achievement: "MBBS Doctor & Zoology Specialist",
      bgGradient: "from-blue-600 to-cyan-700",
      textColor: "text-white",
      isSanjeevTeacher: true
    },
    // Academy Achievement Slide (moved to end)
    {
      type: "academy",
      title: "2025 TOPPERS",
      subtitle: "POOJA ACADEMY",
      tagline: "TAUGHT BY RAM SIR!",
      stats: [
        { label: "Students Cleared", value: "1000+" },
        { label: "Success Rate", value: "95%" },
        { label: "Years Experience", value: "10+" }
      ],
      bgGradient: "from-purple-600 to-violet-700",
      textColor: "text-white"
    }
  ];

  return (
    <div className="embla relative w-full max-w-6xl mx-auto px-4" ref={emblaRef}>
      <div className="embla__container flex">
        {slides.map((slide, index) => (
          <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
            <div className={`bg-gradient-to-br ${slide.bgGradient} rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl relative overflow-hidden h-[400px] md:h-[500px] w-full`}>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-6xl">🏆</div>
                <div className="absolute bottom-4 left-4 text-4xl">⭐</div>
                <div className="absolute top-1/2 left-1/4 text-3xl">📚</div>
              </div>

              {slide.type === "student" && (
                <div className="relative z-10 h-full grid grid-cols-7 gap-2 py-2">
                  {/* Left Side - Huge Photo (takes 4/7 of width) */}
                  <div className="col-span-4 flex items-center justify-center p-2">
                    <div className="w-full h-full max-h-[300px] aspect-square">
                      {slide.isShailesh ? (
                        <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white border-4 border-yellow-400">
                          <img 
                            src={shaileshPhoto}
                            alt="Shailesh Pandey - 12th Topper"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-full overflow-hidden shadow-2xl bg-white border-6 border-yellow-400 p-1">
                          <img 
                            src={raniFacePhoto}
                            alt="Rani - JEE Main Success Story"
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Achievement Details (takes 3/7 of width) */}
                  <div className="col-span-3 flex flex-col justify-center space-y-3 pr-2">
                    {/* Pooja Academy Label */}
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-300" />
                      <span className="text-yellow-300 font-bold text-xs md:text-sm">POOJA ACADEMY</span>
                    </div>

                    {/* Achievement Badge */}
                    <div>
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-3 rounded-xl inline-block shadow-xl">
                        {slide.isShailesh ? (
                          <>
                            <div className="text-xl md:text-3xl font-black">{slide.title}</div>
                            <div className="text-sm md:text-base font-bold">{slide.percentile}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl md:text-4xl font-black">99.3%</div>
                            <div className="text-sm md:text-base font-bold">JEE MAIN</div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Student Name */}
                    <div className="text-white font-bold text-xl md:text-2xl">
                      {slide.name}
                    </div>

                    {/* Board Exam Text for Rani */}
                    {!slide.isShailesh && (
                      <div className="text-white font-bold text-lg md:text-xl mb-2">
                        2025 Board Exam
                      </div>
                    )}

                    {/* Subject Scores */}
                    <div className="space-y-1">
                      {slide.isShailesh ? (
                        // Show all 3 subjects for Shailesh
                        slide.subjects?.map((subject, i) => (
                          <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                            <span className="font-bold text-xs md:text-sm text-white">{subject.score} in {subject.name}</span>
                          </div>
                        ))
                      ) : (
                        // Show subjects for Rani with orange styling
                        slide.subjects?.map((subject, i) => (
                          <div key={i} className="bg-orange-500 rounded-full px-4 py-2">
                            <span className="font-bold text-sm md:text-base text-white">{subject.score} in {subject.name}</span>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                </div>
              )}

              {slide.type === "mentor" && (
                <div className="relative z-10 h-full grid grid-cols-7 gap-2 py-2">
                  {/* Left Side - Large Photo (takes 4/7 of width) */}
                  <div className="col-span-4 flex items-center justify-center p-2">
                    <div className="w-full h-full max-h-[300px] aspect-square">
                      <div className="w-full h-full rounded-full overflow-hidden shadow-2xl bg-white border-6 border-blue-400 p-1">
                        <img 
                          src={slide.isSanjeevTeacher ? drSanjeevPhoto : (slide.isDiwakarTeacher ? diwakarSirPhoto : (slide.isSunilTeacher ? sunilSirPhoto : (slide.isBiologyTeacher ? biologyTeacherPhoto : ramSirPhoto)))}
                          alt={slide.isSanjeevTeacher ? "Dr. Sanjeev Gupta - Zoology Expert" : (slide.isDiwakarTeacher ? "Diwakar Sir - Math & Science Expert" : (slide.isSunilTeacher ? "Sunil Sir - Accountancy Expert" : (slide.isBiologyTeacher ? "Anmol - Botany Expert" : "Ram Sir - Lead Faculty")))}
                          className="w-full h-full object-cover object-[center_top] scale-80 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Faculty Details (takes 3/7 of width) */}
                  <div className="col-span-3 flex flex-col justify-center space-y-3 pr-2">
                    {/* Pooja Academy Label */}
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-300" />
                      <span className="text-yellow-300 font-bold text-xs md:text-sm">POOJA ACADEMY</span>
                    </div>

                    {/* Name and Title */}
                    <div className="space-y-1">
                      <h2 className="text-xl md:text-2xl font-bold text-white">{slide.name}</h2>
                      <p className="text-sm md:text-base font-semibold text-white">{slide.title}</p>
                      <p className="text-xs text-white/90">{slide.subtitle}</p>
                    </div>

                    {/* Experience Details */}
                    <div className="space-y-1">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="font-bold text-xs md:text-sm text-white">{slide.experience}</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="font-bold text-xs md:text-sm text-white">{slide.students}</span>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-2 pt-1">
                      <Phone className="w-3 h-3 text-white" />
                      <span className="font-semibold text-xs md:text-sm text-white">
                        +91 {slide.isDiwakarTeacher ? "8800345115" : 
                             slide.isSunilTeacher ? "9211336486" : 
                             slide.isBiologyTeacher ? "9899038370" : 
                             slide.isSanjeevTeacher ? "9990065566" : 
                             "7011505239"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === "academy" && (
                <div className="relative z-10 text-center h-full flex flex-col justify-center py-4 md:py-6">
                  <div className="space-y-3 md:space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">{slide.title}</h2>
                    <p className="text-lg md:text-2xl font-semibold">OF</p>
                    <h3 className="text-2xl md:text-4xl font-bold">{slide.subtitle}</h3>
                    <div className="bg-yellow-400 text-gray-900 px-4 py-2 md:px-8 md:py-4 rounded-full inline-block font-bold text-sm md:text-xl">
                      {slide.tagline}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-lg md:max-w-2xl mx-auto my-4 md:my-6">
                    {slide.stats?.map((stat, i) => (
                      <div key={i} className="bg-white/25 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-6 text-center">
                        <div className="text-xl md:text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="text-xs md:text-base opacity-90">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Link href="/contact">
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 md:px-10 md:py-5 rounded-full text-base md:text-xl">
                        Enroll Now
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {slide.type === "champs_full_image" && (
                <div className="relative z-10 h-full w-full">
                  <img 
                    src={champsFullPhoto}
                    alt="Pooja Academy Champions - JEE and NEET Toppers"
                    className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                  />
                </div>
              )}

              {slide.type === "kunal" && (
                <div className="relative z-10 text-center h-full flex flex-col justify-center py-4 md:py-6">
                  {/* PA Logo */}
                  <div className="absolute top-4 left-4 text-white text-2xl md:text-3xl font-bold">
                    PA
                  </div>

                  {/* Main Content */}
                  <div className="space-y-4 md:space-y-6">
                    {/* Scored Text */}
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-2xl font-bold text-white">SCORED</h3>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-6xl md:text-8xl font-black text-yellow-400">{slide.mainScore}</div>
                        <div className="absolute top-8 right-8 bg-yellow-400 text-blue-900 rounded-full w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center">
                          <span className="text-lg md:text-xl font-bold">{slide.secondaryScore}</span>
                          <span className="text-xs md:text-sm font-bold">in</span>
                          <span className="text-xs md:text-sm font-bold">{slide.secondarySubject}</span>
                        </div>
                      </div>
                      <h2 className="text-xl md:text-3xl font-bold text-white">IN {slide.mainSubject}</h2>
                    </div>

                    {/* Student Name */}
                    <div className="my-6 md:my-8">
                      <h1 className="text-4xl md:text-6xl font-bold text-white italic" style={{ fontFamily: 'cursive' }}>
                        {slide.name}
                      </h1>
                    </div>

                    {/* Academy Info */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-white" />
                        <span className="text-sm md:text-base text-white font-medium">{slide.phone}</span>
                      </div>
                      <div className="bg-yellow-400 text-blue-900 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base">
                        {slide.tagline}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === "airforce_full_image" && (
                <div className="relative z-10 h-full w-full">
                  <img 
                    src={ajayPhoto}
                    alt="Ajay Kumar - Air Force Achievement"
                    className="w-full h-full object-fill rounded-xl md:rounded-2xl"
                  />
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300 z-20"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300 z-20"
        onClick={scrollNext}
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4 md:mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-300"
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsCarousel;