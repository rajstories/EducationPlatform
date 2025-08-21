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
                <div className="relative z-10 flex flex-col items-center text-center h-full py-2 md:py-3">
                  {/* Student Image at Top */}
                  <div className="mb-2 md:mb-3">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-200 to-orange-400 rounded-full flex items-end justify-center overflow-hidden shadow-lg mx-auto">
                      {/* Placeholder for student image */}
                      <div className="w-full h-full bg-gradient-to-t from-orange-600 to-transparent flex items-end justify-center pb-1 md:pb-2">
                        <div className="text-lg md:text-xl font-bold text-white">{slide.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Content Below */}
                  <div className="space-y-2 flex-1">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Award className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                        <span className="text-yellow-300 font-semibold text-xs">POOJA ACADEMY</span>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold">{slide.title}</h2>
                      <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full inline-block font-bold text-sm">
                        {slide.percentile}
                      </div>
                      <p className="text-xs opacity-90">{slide.exam}</p>
                    </div>

                    {/* Subject Scores - More Compact */}
                    <div className="space-y-1 max-w-xs mx-auto">
                      {slide.subjects?.map((subject, i) => (
                        <div key={i} className="bg-white/25 backdrop-blur-sm rounded-full px-2 py-1">
                          <span className="font-bold text-xs">{subject.score} in {subject.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-1 pt-1">
                      <Phone className="w-3 h-3" />
                      <span className="font-semibold text-xs">8800345115</span>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === "mentor" && (
                <div className="relative z-10 flex flex-col items-center text-center h-full py-2 md:py-3">
                  {/* Ram Sir Image at Top */}
                  <div className="mb-2 md:mb-3">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center overflow-hidden shadow-lg mx-auto">
                      {/* Placeholder for Ram Sir image */}
                      <div className="text-xl md:text-2xl font-bold text-blue-800">RS</div>
                    </div>
                  </div>

                  {/* Content Below */}
                  <div className="space-y-2 flex-1">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                        <span className="text-yellow-300 font-semibold text-xs">POOJA ACADEMY</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold">{slide.name}</h2>
                      <p className="text-sm md:text-base font-semibold">{slide.title}</p>
                      <p className="text-xs opacity-90">{slide.subtitle}</p>
                    </div>

                    <div className="space-y-1 max-w-xs mx-auto">
                      <div className="bg-white/25 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="font-bold text-xs">{slide.experience}</span>
                      </div>
                      <div className="bg-white/25 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="font-bold text-xs">{slide.students}</span>
                      </div>
                      <div className="bg-white/25 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="font-bold text-xs">{slide.achievement}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1 pt-1">
                      <Phone className="w-3 h-3" />
                      <span className="font-semibold text-xs">+91 7011505239</span>
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