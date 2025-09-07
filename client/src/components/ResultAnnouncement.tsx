import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Medal, Award, Crown, Star, Sparkles, PartyPopper, TrendingUp, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface StudentResult {
  id: string;
  studentId: string;
  name: string;
  rollNumber: string;
  marks: number;
  grade: string;
  rank: number;
  profilePhoto?: string;
  percentage: number;
}

interface ResultData {
  examName: string;
  subject: string;
  classId: string;
  examDate: string;
  totalMarks: string;
  results: StudentResult[];
  publishedAt: string;
}

interface ResultAnnouncementProps {
  notification?: {
    type: string;
    title: string;
    message: string;
    data?: ResultData;
  };
}

export function ResultAnnouncement({ notification }: ResultAnnouncementProps) {
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ResultData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch latest results
  const resultsQuery = useQuery({
    queryKey: ['/api/admin/results/latest'],
    enabled: true, // Always fetch to show published results
  });

  useEffect(() => {
    if (notification?.type === 'result_published' && notification.data) {
      setSelectedResult(notification.data);
      setShowResults(true);
      setShowCelebration(true);
      
      // Hide celebration after 3 seconds
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [notification]);

  // Show results from query if no notification data
  useEffect(() => {
    if (resultsQuery.data && !selectedResult) {
      setSelectedResult(resultsQuery.data);
      setShowResults(true);
    }
  }, [resultsQuery.data, selectedResult]);

  // Podium display for top 3
  const PodiumDisplay = ({ results }: { results: StudentResult[] }) => {
    const top3 = results.slice(0, 3);
    const positions = [
      { rank: 2, height: "h-32", color: "from-gray-300 to-gray-500", icon: Medal, delay: 0.3 },
      { rank: 1, height: "h-40", color: "from-yellow-400 to-yellow-600", icon: Crown, delay: 0.1 },
      { rank: 3, height: "h-28", color: "from-orange-400 to-orange-600", icon: Award, delay: 0.5 },
    ];

    return (
      <div className="flex justify-center items-end gap-4 py-8">
        {positions.map((pos) => {
          const student = top3.find(s => s.rank === pos.rank);
          if (!student) return null;
          
          const Icon = pos.icon;
          
          return (
            <motion.div 
              key={pos.rank}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pos.delay, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <motion.div 
                className="relative mb-2"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {student.profilePhoto ? (
                  <img 
                    src={student.profilePhoto} 
                    alt={student.name}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {student.name.charAt(0)}
                  </div>
                )}
                <motion.div 
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Icon className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
                </motion.div>
              </motion.div>
              
              <div className="text-center mb-2">
                <h3 className="font-bold text-lg">{student.name}</h3>
                <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                <motion.p 
                  className="text-2xl font-bold text-blue-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: pos.delay + 0.3 }}
                >
                  {student.marks}
                </motion.p>
                <Badge className="mt-1" variant={pos.rank === 1 ? "default" : "secondary"}>
                  {student.percentage}% - Grade {student.grade}
                </Badge>
              </div>
              
              <motion.div 
                className={`bg-gradient-to-t ${pos.color} ${pos.height} w-32 rounded-t-lg flex items-center justify-center shadow-xl relative overflow-hidden`}
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ delay: pos.delay + 0.2, duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <span className="text-white text-4xl font-bold z-10">{pos.rank}</span>
                <Sparkles className="absolute top-2 right-2 w-6 h-6 text-white/50 animate-pulse" />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Leaderboard for remaining students
  const Leaderboard = ({ results }: { results: StudentResult[] }) => {
    const remaining = results.slice(3);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Class Leaderboard
            </CardTitle>
            <CardDescription>Performance rankings for all students</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {remaining.map((student, index) => (
                <motion.div 
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + (index * 0.1) }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-lg">
                      {student.rank}
                    </div>
                    {student.profilePhoto ? (
                      <img 
                        src={student.profilePhoto} 
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">{student.marks}</p>
                      <p className="text-sm text-gray-500">{student.percentage}%</p>
                    </div>
                    <Badge variant={
                      student.grade === 'A+' ? 'default' :
                      student.grade === 'A' ? 'secondary' :
                      'outline'
                    }>
                      Grade {student.grade}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Celebration animation
  const CelebrationOverlay = () => (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: 1 }}
            >
              <PartyPopper className="w-32 h-32 text-yellow-500" />
            </motion.div>
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2"
                initial={{ x: 0, y: 0 }}
                animate={{
                  x: Math.cos(i * 36 * Math.PI / 180) * 200,
                  y: Math.sin(i * 36 * Math.PI / 180) * 200,
                  opacity: [1, 0],
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <Star className="w-8 h-8 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <CelebrationOverlay />
      
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              {selectedResult?.examName} Results Published!
            </DialogTitle>
            <DialogDescription className="text-lg">
              {selectedResult?.subject} - Published on {new Date(selectedResult?.publishedAt || '').toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Marks</p>
                    <p className="text-2xl font-bold">{selectedResult.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold">{selectedResult.results.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Class Average</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        selectedResult.results.reduce((acc, r) => acc + r.percentage, 0) / 
                        selectedResult.results.length
                      )}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Top Performers
                </h3>
                <PodiumDisplay results={selectedResult.results} />
              </div>

              {selectedResult.results.length > 3 && (
                <Leaderboard results={selectedResult.results} />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}