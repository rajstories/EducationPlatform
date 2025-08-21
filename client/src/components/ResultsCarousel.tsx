import { useCallback, useEffect } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Star, Award, Trophy, Phone } from "lucide-react";

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
    // Academy Achievement Slide
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
    <div className="embla relative" ref={emblaRef}>
      <div className="embla__container flex">
        {slides.map((slide, index) => (
          <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
            <div className={`bg-gradient-to-br ${slide.bgGradient} rounded-2xl p-4 md:p-8 mx-2 md:mx-4 shadow-xl relative overflow-hidden min-h-[400px] md:min-h-[500px]`}>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-6xl">🏆</div>
                <div className="absolute bottom-4 left-4 text-4xl">⭐</div>
                <div className="absolute top-1/2 left-1/4 text-3xl">📚</div>
              </div>

              {slide.type === "student" && (
                <div className="relative z-10 grid md:grid-cols-2 gap-4 md:gap-6 items-center h-full">
                  {/* Left Side - Content */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
                        <span className="text-yellow-300 font-semibold text-sm md:text-base">POOJA ACADEMY</span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold mb-1">{slide.title}</h2>
                      <div className="bg-yellow-400 text-gray-900 px-3 py-1 md:px-4 md:py-2 rounded-full inline-block font-bold text-sm md:text-base">
                        {slide.percentile}
                      </div>
                      <p className="text-sm md:text-lg opacity-90">{slide.exam}</p>
                    </div>

                    {/* Subject Scores */}
                    <div className="space-y-2">
                      {slide.subjects?.map((subject, i) => (
                        <div key={i} className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 md:px-4 md:py-2">
                          <span className="font-semibold text-sm md:text-base">{subject.score} in {subject.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Phone className="w-4 h-4" />
                      <span className="font-semibold text-sm md:text-base">8800345115</span>
                    </div>
                  </div>

                  {/* Right Side - Student Image */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-orange-200 to-orange-400 rounded-full flex items-end justify-center overflow-hidden shadow-xl">
                        {/* Placeholder for student image */}
                        <div className="w-full h-full bg-gradient-to-t from-orange-600 to-transparent flex items-end justify-center pb-2 md:pb-4">
                          <div className="text-2xl md:text-4xl font-bold text-white">{slide.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === "mentor" && (
                <div className="relative z-10 grid md:grid-cols-2 gap-4 md:gap-6 items-center h-full">
                  {/* Left Side - Content */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
                        <span className="text-yellow-300 font-semibold text-sm md:text-base">POOJA ACADEMY</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-bold mb-1">{slide.name}</h2>
                      <p className="text-lg md:text-xl font-semibold">{slide.title}</p>
                      <p className="text-sm md:text-base opacity-90">{slide.subtitle}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 md:px-4 md:py-2">
                        <span className="font-semibold text-sm md:text-base">{slide.experience}</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 md:px-4 md:py-2">
                        <span className="font-semibold text-sm md:text-base">{slide.students}</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 md:px-4 md:py-2">
                        <span className="font-semibold text-sm md:text-base">{slide.achievement}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Phone className="w-4 h-4" />
                      <span className="font-semibold text-sm md:text-base">+91 7011505239</span>
                    </div>
                  </div>

                  {/* Right Side - Ram Sir Image */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center overflow-hidden shadow-xl">
                        {/* Placeholder for Ram Sir image */}
                        <div className="text-3xl md:text-5xl font-bold text-blue-800">RS</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === "academy" && (
                <div className="relative z-10 text-center space-y-4 md:space-y-6 h-full flex flex-col justify-center">
                  <div className="space-y-2 md:space-y-3">
                    <h2 className="text-3xl md:text-5xl font-bold">{slide.title}</h2>
                    <p className="text-lg md:text-2xl font-semibold">OF</p>
                    <h3 className="text-2xl md:text-3xl font-bold">{slide.subtitle}</h3>
                    <div className="bg-yellow-400 text-gray-900 px-4 py-2 md:px-6 md:py-3 rounded-full inline-block font-bold text-sm md:text-lg">
                      {slide.tagline}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-sm md:max-w-lg mx-auto">
                    {slide.stats?.map((stat, i) => (
                      <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 text-center">
                        <div className="text-lg md:text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-xs md:text-sm opacity-90">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-3 md:pt-4">
                    <Link href="/contact">
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 md:px-8 md:py-4 rounded-full text-sm md:text-base">
                        Enroll Now
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 md:p-3 transition-all duration-300 z-20"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </button>
      <button
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 md:p-3 transition-all duration-300 z-20"
        onClick={scrollNext}
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4 md:mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/40 hover:bg-white/60 transition-all duration-300"
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsCarousel;