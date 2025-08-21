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
            <div className={`bg-gradient-to-br ${slide.bgGradient} rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[500px] md:min-h-[600px] w-full`}>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-6xl">🏆</div>
                <div className="absolute bottom-4 left-4 text-4xl">⭐</div>
                <div className="absolute top-1/2 left-1/4 text-3xl">📚</div>
              </div>

              {slide.type === "student" && (
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 items-center h-full py-8">
                  {/* Left Side - Content */}
                  <div className="md:col-span-3 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-6 h-6 text-yellow-300" />
                        <span className="text-yellow-300 font-semibold text-lg">POOJA ACADEMY</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
                      <div className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full inline-block font-bold text-xl">
                        {slide.percentile}
                      </div>
                      <p className="text-xl opacity-90">{slide.exam}</p>
                    </div>

                    {/* Subject Scores */}
                    <div className="space-y-3">
                      {slide.subjects?.map((subject, i) => (
                        <div key={i} className="bg-white/25 backdrop-blur-sm rounded-full px-6 py-3">
                          <span className="font-bold text-lg">{subject.score} in {subject.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Phone className="w-5 h-5" />
                      <span className="font-semibold text-lg">8800345115</span>
                    </div>
                  </div>

                  {/* Right Side - Student Image */}
                  <div className="md:col-span-2 flex justify-center md:justify-end">
                    <div className="relative">
                      <div className="w-56 h-56 md:w-64 md:h-64 bg-gradient-to-br from-orange-200 to-orange-400 rounded-full flex items-end justify-center overflow-hidden shadow-2xl">
                        {/* Placeholder for student image */}
                        <div className="w-full h-full bg-gradient-to-t from-orange-600 to-transparent flex items-end justify-center pb-4">
                          <div className="text-4xl md:text-5xl font-bold text-white">{slide.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === "mentor" && (
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 items-center h-full py-8">
                  {/* Left Side - Content */}
                  <div className="md:col-span-3 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-6 h-6 text-yellow-300" />
                        <span className="text-yellow-300 font-semibold text-lg">POOJA ACADEMY</span>
                      </div>
                      <h2 className="text-5xl md:text-6xl font-bold">{slide.name}</h2>
                      <p className="text-2xl font-semibold">{slide.title}</p>
                      <p className="text-xl opacity-90">{slide.subtitle}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white/25 backdrop-blur-sm rounded-full px-6 py-3">
                        <span className="font-bold text-lg">{slide.experience}</span>
                      </div>
                      <div className="bg-white/25 backdrop-blur-sm rounded-full px-6 py-3">
                        <span className="font-bold text-lg">{slide.students}</span>
                      </div>
                      <div className="bg-white/25 backdrop-blur-sm rounded-full px-6 py-3">
                        <span className="font-bold text-lg">{slide.achievement}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Phone className="w-5 h-5" />
                      <span className="font-semibold text-lg">+91 7011505239</span>
                    </div>
                  </div>

                  {/* Right Side - Ram Sir Image */}
                  <div className="md:col-span-2 flex justify-center md:justify-end">
                    <div className="relative">
                      <div className="w-56 h-56 md:w-64 md:h-64 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center overflow-hidden shadow-2xl">
                        {/* Placeholder for Ram Sir image */}
                        <div className="text-5xl md:text-6xl font-bold text-blue-800">RS</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === "academy" && (
                <div className="relative z-10 text-center h-full flex flex-col justify-center py-8">
                  <div className="space-y-6">
                    <h2 className="text-5xl md:text-6xl font-bold">{slide.title}</h2>
                    <p className="text-2xl md:text-3xl font-semibold">OF</p>
                    <h3 className="text-4xl md:text-5xl font-bold">{slide.subtitle}</h3>
                    <div className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full inline-block font-bold text-xl">
                      {slide.tagline}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto my-8">
                    {slide.stats?.map((stat, i) => (
                      <div key={i} className="bg-white/25 backdrop-blur-sm rounded-xl p-6 text-center">
                        <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                        <div className="text-base opacity-90">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Link href="/contact">
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-10 py-5 rounded-full text-xl">
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
      <div className="flex justify-center gap-3 mt-8">
        {slides.map((_, index) => (
          <button
            key={index}
            className="w-4 h-4 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-300"
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsCarousel;