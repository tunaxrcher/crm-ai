"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@src/components/ui/card";
import { Badge } from "@src/components/ui/badge";
import { Progress } from "@src/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@src/components/ui/tabs";
import { ArrowLeft, Award, BadgePercent, Clock, Crown, Info, LineChart, Medal, Receipt, Shield, Star, Swords, Trophy, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@src/components/ui/avatar";
import { useProfile } from "../hook/api";
import { ErrorDisplay, SkeletonLoading } from "@src/components/shared";
import { withErrorHandling } from "@src/hooks";
import { useError } from "@src/components/shared/ErrorProvider";
import useErrorHandler from "@src/hooks/useErrorHandler";

// Get class icon by class name
const getClassIcon = (className: string) => {
  if (className === 'marketing') return <BadgePercent className="h-5 w-5" />;
  if (className === 'sales') return <LineChart className="h-5 w-5" />;
  if (className === 'accounting') return <Receipt className="h-5 w-5" />;
  return null;
};

// Get stat icon
const getStatIcon = (stat: string) => {
  switch(stat) {
    case 'AGI': return <Zap className="h-5 w-5" />;
    case 'STR': return <Swords className="h-5 w-5" />;
    case 'DEX': return <BadgePercent className="h-5 w-5" />;
    case 'VIT': return <Clock className="h-5 w-5" />;
    case 'INT': return <Shield className="h-5 w-5" />;
    default: return null;
  }
};

// Get stat abbreviation description
const getStatDescription = (stat: string) => {
  switch(stat) {
    case 'AGI': return 'ความเร็ว, การตอบสนอง';
    case 'STR': return 'ความสามารถในการรับมือกับงานหนัก';
    case 'DEX': return 'ความแม่นยำ, ความถูกต้อง';
    case 'VIT': return 'ความสม่ำเสมอ, ความอดทน';
    case 'INT': return 'การวางแผน, การวิเคราะห์';
    default: return '';
  }
};

// Get position badge
const getPositionBadge = (position: number) => {
  switch(position) {
    case 1:
      return (
        <div className="flex items-center text-yellow-500">
          <Crown className="h-5 w-5 mr-1" />
          <span className="font-semibold">อันดับ #1</span>
        </div>
      );
    case 2:
      return (
        <div className="flex items-center text-gray-300">
          <Medal className="h-5 w-5 mr-1" />
          <span className="font-semibold">อันดับ #2</span>
        </div>
      );
    case 3:
      return (
        <div className="flex items-center text-amber-600">
          <Award className="h-5 w-5 mr-1" />
          <span className="font-semibold">อันดับ #3</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center text-muted-foreground">
          <Trophy className="h-5 w-5 mr-1" />
          <span className="font-semibold">อันดับ #{position}</span>
        </div>
      );
  }
};

function ProfileContent({ profile, xpPercentage }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Use error handling
  const { showError } = useError();
  const { handleAsyncOperation } = useErrorHandler();

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center"
            onClick={() => router.push("/ranking")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>ย้อนกลับ</span>
          </Button>

          <div>{getPositionBadge(profile.position)}</div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="rounded-full overflow-hidden w-24 h-24 border-4 ai-gradient-border">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://same-assets.com/placeholder-avatar.png";
              }}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1 border-2 border-background ai-gradient-border">
            <Badge className="ai-gradient-bg border-0">Lvl {profile.level}</Badge>
          </div>
        </div>

        <h1 className="text-xl font-bold">{profile.name}</h1>
        <div className="flex items-center">
          <p className="text-muted-foreground">{profile.title}</p>
          <div className="ml-2">{getClassIcon(profile.class)}</div>
        </div>

        <div className="mt-4 flex items-center w-full max-w-xs">
          <span className="text-xs text-muted-foreground mr-2">เลเวล {profile.level}</span>
          <Progress value={xpPercentage} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground ml-2">เลเวล {profile.level + 1}</span>
        </div>

        <div className="mt-2 flex items-center text-sm">
          <Award className="h-4 w-4 mr-1 text-yellow-400" />
          <span className="text-yellow-400 font-medium">
            {profile.currentXP} / {profile.nextLevelXP} XP
          </span>
        </div>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="stats">สถิติ</TabsTrigger>
          <TabsTrigger value="achievements">ความสำเร็จ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">เกี่ยวกับ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{profile.about}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                สมาชิกตั้งแต่: {profile.joinedDate}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" />
                ตราสัญลักษณ์
              </CardTitle>
              <CardDescription>
                การยอมรับและทักษะพิเศษ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.badges.map((badge) => (
                  <div key={badge.id} className="flex items-center p-3 bg-secondary/20 rounded-lg">
                    <div className="text-2xl mr-3">{badge.icon}</div>
                    <div>
                      <div className="font-medium text-sm">{badge.name}</div>
                      <div className="text-xs text-muted-foreground">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-blue-400" />
                สถิติภารกิจ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">ภารกิจทั้งหมด</div>
                  <div className="text-xl font-bold">{profile.questStats.totalCompleted}</div>
                </div>
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">คะแนนเฉลี่ย</div>
                  <div className="text-xl font-bold">{profile.questStats.averageRating} / 5</div>
                </div>
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">ภารกิจรายวัน</div>
                  <div className="text-xl font-bold">{profile.questStats.dailyCompleted}</div>
                </div>
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">ภารกิจรายสัปดาห์</div>
                  <div className="text-xl font-bold">{profile.questStats.weeklyCompleted}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-400" />
                สถิติตัวละคร
              </CardTitle>
              <CardDescription>
                ความสามารถและความเชี่ยวชาญของตัวละคร
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(profile.stats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                      {getStatIcon(stat)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{stat}</div>
                          <div className="text-xs text-muted-foreground">{getStatDescription(stat)}</div>
                        </div>
                        <div className="font-bold">{value}</div>
                      </div>
                      <Progress value={(value as number / 100) * 100} className="h-2 mt-1" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground mt-4 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                <span>สถิติจะพัฒนาขึ้นเมื่อคุณทำภารกิจสำเร็จ</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">การกระจายสถิติ</CardTitle>
              <CardDescription>
                ความสมดุลของความสามารถตัวละคร
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around gap-2 mb-6">
                {Object.entries(profile.stats).map(([stat, value]) => (
                  <div key={stat} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-1 relative">
                      {getStatIcon(stat)}
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-card flex items-center justify-center text-xs font-semibold border border-border">
                        {value}
                      </div>
                    </div>
                    <span className="text-xs font-medium">{stat}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
                <div className="text-sm font-medium mb-1">จุดแข็ง</div>
                <div className="text-sm">
                  {(() => {
                    const stats = Object.entries(profile.stats).sort((a, b) => (b[1] as number) - (a[1] as number));
                    const topStats = stats.slice(0, 2);
                    return `เด่นที่สุดใน ${topStats[0][0]} และ ${topStats[1][0]} ทำให้ ${profile.name} เก่งในด้าน${getStatDescription(topStats[0][0])} และ${getStatDescription(topStats[1][0])}`;
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" />
                ความสำเร็จและตำแหน่ง
              </CardTitle>
              <CardDescription>
                เป้าหมายและความสำเร็จ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center p-3 rounded-lg ${achievement.earned ? 'bg-secondary/20' : 'bg-secondary/5 opacity-60'}`}
                  >
                    <div className="text-2xl mr-3">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center">
                        {achievement.name}
                        {achievement.earned && (
                          <Badge variant="outline" className="ml-2 text-xs border-green-500 text-green-500">
                            ได้รับแล้ว
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                      {achievement.earned && achievement.earnedOn && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ได้รับเมื่อ: {
                            typeof achievement.earnedOn === 'object' && achievement.earnedOn instanceof Date
                              ? achievement.earnedOn.toLocaleDateString()
                              : (typeof achievement.earnedOn === 'string'
                                ? new Date(achievement.earnedOn).toLocaleDateString()
                                : 'เร็วๆ นี้')
                          }
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <div className="bg-secondary/20 px-4 py-2 rounded-full">
                  <span className="text-sm">
                    {profile.achievements.filter(a => a.earned).length} / {profile.achievements.length} ความสำเร็จที่ปลดล็อคแล้ว
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type ProfilePageProps = {
  userId: string;
};

function ProfilePageComponent({ userId }: ProfilePageProps) {
  const router = useRouter();

  // Use profile data hook
  const { profile, isLoading, error, xpPercentage, refetchProfile } = useProfile(userId);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <SkeletonLoading type="profile" text="กำลังโหลดโปรไฟล์..." />
      </div>
    );
  }

  // Handle error or profile not found with new ErrorDisplay component
  if (error || !profile) {
    return (
      <div className="p-4 pb-20">
        <ErrorDisplay
          title="ไม่พบโปรไฟล์"
          message="ไม่พบโปรไฟล์ที่คุณกำลังค้นหา หรือเกิดข้อผิดพลาดในการโหลดข้อมูล"
          severity="error"
          onRetry={() => refetchProfile()}
          showRetry={true}
          technicalDetails={error}
          actionText="กลับไปยังหน้าอันดับ"
          onAction={() => router.push("/ranking")}
        />
      </div>
    );
  }

  // Render profile content
  return <ProfileContent profile={profile} xpPercentage={xpPercentage} />;
}

// ใช้ Higher Order Component เพื่อเพิ่ม error boundary
export default withErrorHandling(ProfilePageComponent);
