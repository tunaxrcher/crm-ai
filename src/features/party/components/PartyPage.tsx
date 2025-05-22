'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  EmptyState,
  ErrorDisplay,
  LoadingState,
  SkeletonLoading,
} from '@src/components/shared'
import { useError } from '@src/components/shared/ErrorProvider'
import { useSimpleNotification } from '@src/components/shared/SimpleToast'
import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import { Card, CardContent } from '@src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog'
import { Input } from '@src/components/ui/input'
import { Label } from '@src/components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@src/components/ui/tabs'
import { withErrorHandling } from '@src/hooks'
import useErrorHandler from '@src/hooks/useErrorHandler'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Plus,
  Search,
  Shield,
  Users,
} from 'lucide-react'

import {
  useCreateTeam,
  useJoinTeam,
  useTeamQuests,
  useTeams,
} from '../hook/api'
import type { Team } from '../types'
import TeamDetailView from './TeamDetailView'
import TeamQuestItem from './TeamQuestItem'

function PartyPageComponent() {
  const router = useRouter()
  // Use the SimpleNotification from our shared components
  const { addNotification } = useSimpleNotification()

  // Use error handler context
  const { showError } = useError()
  const { handleAsyncOperation } = useErrorHandler()

  // State for UI
  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTeamDetail, setShowTeamDetail] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false)
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false)
  const [teamJoinMessage, setTeamJoinMessage] = useState('')
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    tags: ['tag1', 'tag2'],
    maxMembers: 5,
  })

  // API Hooks
  const {
    teams,
    loading: teamsLoading,
    error: teamsError,
    refetch: refetchTeams,
  } = useTeams()
  const {
    quests,
    loading: questsLoading,
    error: questsError,
    refetch: refetchQuests,
  } = useTeamQuests()
  const { requestJoin, loading: joinLoading } = useJoinTeam()
  const { create: createTeam, loading: createLoading } = useCreateTeam()

  // Filter teams based on search query
  const filteredTeams = teams.filter((team) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      team.name.toLowerCase().includes(query) ||
      team.description.toLowerCase().includes(query) ||
      team.tags.some((tag) => tag.includes(query))
    )
  })

  // Handle join team
  const handleJoinTeam = (team: Team) => {
    if (team.isFull) {
      showError(`ทีม ${team.name} เต็มแล้ว`, {
        message: 'ไม่สามารถเข้าร่วมทีมนี้ได้ในขณะนี้',
        severity: 'warning',
        autoHideAfter: 5000,
      })
      return
    }

    setSelectedTeam(team)
    setShowJoinTeamDialog(true)
  }

  // Handle submit join request with error handling
  const handleSubmitJoinRequest = async () => {
    if (!selectedTeam) return

    const result = await handleAsyncOperation(async () => {
      return await requestJoin(selectedTeam.id, teamJoinMessage)
    })

    if (result) {
      showError(`ส่งคำขอเข้าร่วมทีม ${selectedTeam.name} เรียบร้อยแล้ว`, {
        severity: 'info',
        autoHideAfter: 3000,
      })

      setShowJoinTeamDialog(false)
      setTeamJoinMessage('')
    }
  }

  // View team details
  const handleViewTeamDetails = (team: Team) => {
    setSelectedTeam(team)
    setShowTeamDetail(true)
  }

  // Back to teams list
  const handleBackToTeams = () => {
    setShowTeamDetail(false)
    setSelectedTeam(null)
  }

  // Handle create team with error handling
  const handleCreateTeam = async () => {
    if (newTeamData.name.trim() === '') {
      showError('กรุณาระบุชื่อทีม', {
        severity: 'warning',
        autoHideAfter: 3000,
      })
      return
    }

    const result = await handleAsyncOperation(async () => {
      return await createTeam(newTeamData)
    })

    if (result) {
      // showError("สร้างทีมสำเร็จแล้ว", {
      //   severity: "success",
      //   autoHideAfter: 3000
      // });

      setShowCreateTeamDialog(false)
      setNewTeamData({
        name: '',
        description: '',
        isPrivate: false,
        tags: ['tag1', 'tag2'],
        maxMembers: 5,
      })
    }
  }

  // Handle input changes for team creation
  const handleTeamDataChange = (
    field: string,
    value: string | boolean | number | string[]
  ) => {
    setNewTeamData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Get activity badge (helper function)
  const getActivityBadge = (activity: string) => {
    switch (activity) {
      case 'very-active':
        return (
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
            Very Active
          </Badge>
        )
      case 'active':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
            Active
          </Badge>
        )
      case 'semi-active':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
            Semi-Active
          </Badge>
        )
      case 'inactive':
        return (
          <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
            Inactive
          </Badge>
        )
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold ai-gradient-text">ระบบปาร์ตี้</h1>
          <p className="text-muted-foreground">เข้าร่วมทีมและทำภารกิจร่วมกัน</p>
        </div>
      </div>

      {/* Main content */}
      {!showTeamDetail ? (
        <div>
          <Tabs defaultValue="browse" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="browse">ค้นหาทีม</TabsTrigger>
                <TabsTrigger value="quests">ภารกิจทีม</TabsTrigger>
                <TabsTrigger value="my-team">ทีมของฉัน</TabsTrigger>
              </TabsList>

              <Button
                size="sm"
                className="ai-gradient-bg"
                onClick={() => setShowCreateTeamDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                สร้างทีม
              </Button>
            </div>

            {/* Browse Teams Tab */}
            <TabsContent value="browse" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาทีมตามชื่อ คำอธิบาย หรือแท็ก..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {teamsLoading ? (
                <SkeletonLoading type="party" text="กำลังโหลดทีม..." />
              ) : teamsError ? (
                <ErrorDisplay
                  title="ไม่สามารถโหลดทีมได้"
                  message="เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง"
                  severity="error"
                  onRetry={refetchTeams}
                  showRetry={true}
                  technicalDetails={teamsError}
                />
              ) : filteredTeams.length > 0 ? (
                <div className="space-y-4">
                  {filteredTeams.map((team) => (
                    <Card key={team.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-secondary/30 rounded-lg flex items-center justify-center">
                              <Users className="h-6 w-6 text-blue-400" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center">
                                <h3 className="font-medium">{team.name}</h3>
                                {team.isPrivate && (
                                  <Badge variant="outline" className="ml-2">
                                    <Shield className="h-3 w-3 mr-1" />
                                    ส่วนตัว
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground">
                                {team.description}
                              </p>

                              <div className="flex items-center text-xs text-muted-foreground space-x-2">
                                <span>Level {team.level}</span>
                                <span>•</span>
                                <span>
                                  {team.members}/{team.maxMembers} สมาชิก
                                </span>
                                <span>•</span>
                                <span>นำโดย {team.leader.name}</span>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-2">
                                {team.tags.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {getActivityBadge(team.activity)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center"
                              onClick={() => handleViewTeamDetails(team)}>
                              รายละเอียด
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              className={
                                team.isFull
                                  ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                                  : 'ai-gradient-bg'
                              }
                              onClick={() => handleJoinTeam(team)}
                              disabled={team.isFull}>
                              {team.isFull ? 'เต็ม' : 'เข้าร่วม'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="ไม่พบทีม"
                  message="ลองค้นหาด้วยคำอื่นหรือสร้างทีมของคุณเอง"
                  actionText="สร้างทีม"
                  onAction={() => setShowCreateTeamDialog(true)}
                  icon={<Info className="h-10 w-10 text-muted-foreground" />}
                />
              )}
            </TabsContent>

            {/* Team Quests Tab */}
            <TabsContent value="quests" className="space-y-4">
              <h2 className="text-lg font-medium mb-2">ภารกิจทีมที่มีอยู่</h2>

              {questsLoading ? (
                <SkeletonLoading type="quest" text="กำลังโหลดภารกิจ..." />
              ) : questsError ? (
                <ErrorDisplay
                  title="ไม่สามารถโหลดภารกิจได้"
                  message="เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง"
                  severity="error"
                  onRetry={refetchQuests}
                  showRetry={true}
                  technicalDetails={questsError}
                />
              ) : quests.length > 0 ? (
                <div className="space-y-4">
                  {quests.map((quest) => (
                    <TeamQuestItem key={quest.id} quest={quest} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="ไม่มีภารกิจที่พร้อม"
                  message="กลับมาตรวจสอบภายหลังสำหรับภารกิจทีมใหม่"
                  icon={<Info className="h-10 w-10 text-muted-foreground" />}
                />
              )}
            </TabsContent>

            {/* My Team Tab - Placeholder for now */}
            <TabsContent value="my-team">
              <Card className="mb-4">
                <CardContent className="p-6 text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    คุณยังไม่ได้อยู่ในทีม
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    เข้าร่วมทีมที่มีอยู่หรือสร้างทีมของคุณเองเพื่อสนุกกับการเล่นเป็นทีม
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('browse')}>
                      ค้นหาทีม
                    </Button>
                    <Button
                      className="ai-gradient-bg"
                      onClick={() => setShowCreateTeamDialog(true)}>
                      สร้างทีมของคุณ
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-4 bg-secondary/5">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-blue-400" />
                    ประโยชน์ของทีม
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">ภารกิจพิเศษ</p>
                        <p className="text-xs text-muted-foreground">
                          เข้าถึงภารกิจเฉพาะทีมที่ให้รางวัลดีกว่า
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <ArrowRight className="h-5 w-5 mr-2 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">โบนัส XP</p>
                        <p className="text-xs text-muted-foreground">
                          รับ XP โบนัสเมื่อทำภารกิจสำเร็จเป็นทีม
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-2 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">แชทของทีม</p>
                        <p className="text-xs text-muted-foreground">
                          สื่อสารและประสานงานกับสมาชิกในทีมของคุณ
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Team detail view (rendered when a team is selected)
        selectedTeam && (
          <TeamDetailView
            team={selectedTeam}
            onBack={handleBackToTeams}
            onJoin={handleJoinTeam}
          />
        )
      )}

      {/* Create Team Dialog */}
      <Dialog
        open={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้างทีมใหม่</DialogTitle>
            <DialogDescription>
              จัดตั้งทีมเพื่อทำภารกิจร่วมกันและรับโบนัสเป็นทีม
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">ชื่อทีม</Label>
              <Input
                id="team-name"
                placeholder="ใส่ชื่อทีม"
                value={newTeamData.name}
                onChange={(e) => handleTeamDataChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">คำอธิบาย</Label>
              <Input
                id="team-description"
                placeholder="อธิบายจุดมุ่งหมายและเป้าหมายของทีม"
                value={newTeamData.description}
                onChange={(e) =>
                  handleTeamDataChange('description', e.target.value)
                }
              />
            </div>

            {/* Additional form fields would be added here in a real application */}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateTeamDialog(false)}
              disabled={createLoading}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleCreateTeam}
              className="ai-gradient-bg"
              disabled={createLoading}>
              {createLoading ? 'กำลังสร้าง...' : 'สร้างทีม'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Team Dialog */}
      <Dialog open={showJoinTeamDialog} onOpenChange={setShowJoinTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เข้าร่วม {selectedTeam?.name}</DialogTitle>
            <DialogDescription>ส่งคำขอเข้าร่วมทีมนี้</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="join-message">ข้อความ (ไม่บังคับ)</Label>
              <Input
                id="join-message"
                placeholder="แนะนำตัวกับหัวหน้าทีม"
                value={teamJoinMessage}
                onChange={(e) => setTeamJoinMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                ระดับและบทบาทของตัวละครคุณจะถูกแนบไปโดยอัตโนมัติ
              </p>
            </div>

            {selectedTeam?.joinRequirement && (
              <div className="p-3 rounded-lg bg-yellow-500/10 flex items-start">
                <Info className="h-5 w-5 mr-2 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">ข้อกำหนดการเข้าร่วม</p>
                  <p className="text-xs">{selectedTeam.joinRequirement}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJoinTeamDialog(false)}
              disabled={joinLoading}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmitJoinRequest}
              className="ai-gradient-bg"
              disabled={joinLoading}>
              {joinLoading ? 'กำลังส่ง...' : 'ส่งคำขอ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ใช้ Higher Order Component เพื่อเพิ่ม error boundary
export default withErrorHandling(PartyPageComponent)
