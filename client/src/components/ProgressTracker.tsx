import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Award, 
  Target, 
  Calendar,
  BookOpen,
  GraduationCap,
  Flame,
  Crown
} from "lucide-react";

interface ProgressTrackerProps {
  studentId?: string;
  showLeaderboard?: boolean;
}

export function ProgressTracker({ studentId, showLeaderboard = true }: ProgressTrackerProps) {
  // Get student progress
  const progressQuery = useQuery({
    queryKey: ['/api/student/progress'],
    enabled: !!studentId,
  });

  // Get student achievements  
  const achievementsQuery = useQuery({
    queryKey: ['/api/student/achievements'],
    enabled: !!studentId,
  });

  // Get all available achievements
  const allAchievementsQuery = useQuery({
    queryKey: ['/api/achievements'],
  });

  // Get leaderboard
  const leaderboardQuery = useQuery({
    queryKey: ['/api/leaderboard'],
    enabled: showLeaderboard,
  });

  const progress = progressQuery.data;
  const achievements = achievementsQuery.data || [];
  const allAchievements = allAchievementsQuery.data || [];
  const leaderboard = leaderboardQuery.data || [];

  // Calculate progress to next level
  const currentLevelXP = progress ? (progress.level - 1) * 1000 : 0;
  const nextLevelXP = progress ? progress.level * 1000 : 1000;
  const progressToNextLevel = progress ? 
    ((progress.experiencePoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 0;

  // Get earned achievement IDs for filtering
  const earnedAchievementIds = new Set(achievements.map((a: any) => a.achievementId));
  
  // Filter achievements by category
  const achievementsByCategory = {
    attendance: allAchievements.filter((a: any) => a.category === 'attendance'),
    academic: allAchievements.filter((a: any) => a.category === 'academic'), 
    engagement: allAchievements.filter((a: any) => a.category === 'engagement'),
    milestone: allAchievements.filter((a: any) => a.category === 'milestone')
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attendance': return <Calendar className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'engagement': return <BookOpen className="h-4 w-4" />;
      case 'milestone': return <Trophy className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const AchievementCard = ({ achievement, isEarned }: { achievement: any, isEarned: boolean }) => (
    <Card className={`relative ${isEarned ? 'ring-2 ring-yellow-400 bg-yellow-50' : 'opacity-60'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{achievement.icon}</span>
            <div>
              <CardTitle className="text-sm">{achievement.title}</CardTitle>
              <div className="flex items-center gap-1 mt-1">
                {getCategoryIcon(achievement.category)}
                <Badge variant="outline" className={getBadgeColor(achievement.type)}>
                  {achievement.type}
                </Badge>
              </div>
            </div>
          </div>
          {isEarned && <Trophy className="h-5 w-5 text-yellow-600" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            {achievement.points} pts
          </Badge>
          {isEarned && (
            <Badge className="text-xs bg-green-100 text-green-800">
              Earned!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!progress) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold text-blue-600">{progress.level}</p>
              </div>
              <Crown className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress to Level {progress.level + 1}</span>
                <span>{Math.round(progressToNextLevel)}%</span>
              </div>
              <Progress value={progressToNextLevel} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-green-600">{progress.totalPoints}</p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Login Streak</p>
                <p className="text-2xl font-bold text-orange-600">{progress.loginStreak}</p>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-purple-600">{achievements.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Details */}
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          {showLeaderboard && <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>}
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
              <CardDescription>
                Earn badges by completing various activities and reaching milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  <TabsTrigger value="milestone">Milestone</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allAchievements.map((achievement: any) => (
                      <AchievementCard 
                        key={achievement.id}
                        achievement={achievement}
                        isEarned={earnedAchievementIds.has(achievement.id)}
                      />
                    ))}
                  </div>
                </TabsContent>

                {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(categoryAchievements as any[]).map((achievement: any) => (
                        <AchievementCard 
                          key={achievement.id}
                          achievement={achievement}
                          isEarned={earnedAchievementIds.has(achievement.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tests Passed</span>
                  <Badge variant="outline">{progress.testsPassed}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Notes Downloaded</span>
                  <Badge variant="outline">{progress.notesDownloaded}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Perfect Attendance Days</span>
                  <Badge variant="outline">{progress.perfectAttendanceDays}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Assignments</span>
                  <Badge variant="outline">{progress.completedAssignments}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Level: {progress.level}</span>
                      <span>{progress.experiencePoints} XP</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      {1000 - (progress.experiencePoints % 1000)} XP to next level
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {showLeaderboard && (
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Top students by total points earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry: any, index: number) => (
                    <div 
                      key={entry.student.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{entry.student.name}</p>
                          <p className="text-sm text-gray-600">Level {entry.progress.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.progress.totalPoints}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}