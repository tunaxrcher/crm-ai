'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog'
import { useNotification } from '@src/components/ui/notification-system'
import { Progress } from '@src/components/ui/progress'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@src/components/ui/tabs'
import { useCharacter } from '@src/contexts/CharacterContext'
import { useQuestDetail } from '@src/features/quest/hook/api'
import { useQuestSubmission } from '@src/features/quest/hook/useQuestSubmission'
import { formatDeadline } from '@src/features/quest/utils'
import {
  ArrowLeft,
  Award,
  Camera,
  Check,
  Clock,
  Clock3,
  MessageSquare,
  Send,
  Sparkles,
  Upload,
} from 'lucide-react'

// Function to determine difficulty badge color
const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return (
        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
          ง่าย
        </Badge>
      )
    case 'medium':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
          ปานกลาง
        </Badge>
      )
    case 'hard':
      return (
        <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
          ยาก
        </Badge>
      )
    default:
      return <Badge>{difficulty}</Badge>
  }
}

// Function to determine quest type icon
const getQuestTypeIcon = (type: string) => {
  switch (type) {
    case 'daily':
      return <Clock className="h-4 w-4 mr-1 text-blue-400" />
    case 'weekly':
      return <Clock className="h-4 w-4 mr-1 text-purple-400" />
    case 'no-deadline':
      return <MessageSquare className="h-4 w-4 mr-1 text-green-400" />
    default:
      return <MessageSquare className="h-4 w-4 mr-1" />
  }
}

// Error Boundary Component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setError(null)
  }, [children])

  if (error) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-60">
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">{error.message}</p>
      </div>
    )
  }

  try {
    return <>{children}</>
  } catch (err: any) {
    setError(err)
    return null
  }
}

// Props interface for the component
interface QuestDetailProps {
  questId: string
  userId: any
  characterId: any
}

export default function QuestDetail({
  questId,
  userId,
  characterId,
}: QuestDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('details')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [showAIResult, setShowAIResult] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [aiAnalysisProgress, setAiAnalysisProgress] = useState(0)
  const [editableSummary, setEditableSummary] = useState('')

  // *** ใช้ real hooks แทน mock data ***
  const { data: quest, isLoading, error } = useQuestDetail(questId, userId)
  const questSubmission = useQuestSubmission()

  // Notification system
  const { addNotification } = useNotification()

  // Character context for XP and achievements
  const { addXp, unlockAchievement } = useCharacter()

  // Check if questId is valid
  if (!questId) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-60">
        <h1 className="text-xl font-bold mb-2">Invalid Quest ID</h1>
        <p className="text-muted-foreground mb-4">
          No valid quest ID was provided.
        </p>
        <Button
          onClick={() => router.push('/quest')}
          className="ai-gradient-bg">
          Back to Quests
        </Button>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล</p>
      </div>
    )
  }

  // Handle error state
  if (error || !quest) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-60">
        <h1 className="text-xl font-bold mb-2">Quest Not Found</h1>
        <p className="text-muted-foreground mb-4">
          {error
            ? 'Failed to load quest details'
            : `The quest with ID "${questId}" doesn't exist.`}
        </p>
        <Button
          onClick={() => router.push('/quest')}
          className="ai-gradient-bg">
          Back to Quests
        </Button>
      </div>
    )
  }

  // Handle file change for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileURL = URL.createObjectURL(file)
      setUploadedFile(file)

      // ตรวจสอบชนิดของไฟล์
      if (file.type.startsWith('image/')) {
        setUploadedImage(fileURL) // ใช้กับ <img>
      } else if (file.type.startsWith('video/')) {
        setUploadedImage(fileURL) // ใช้กับ <video>
      } else {
        setUploadedImage(null)
      }
    }
  }

  // Handle quest submission
  const handleSubmitQuest = async () => {
    try {
      setAiAnalysisProgress(0)

      // Simulate progress updates
      const interval = setInterval(() => {
        setAiAnalysisProgress((prev) => {
          const newProgress = prev + Math.random() * 15
          return newProgress >= 95 ? 95 : newProgress
        })
      }, 300)

      // Submit quest to backend
      const result = await questSubmission.mutateAsync({
        questId,
        characterId: characterId,
        mediaFile: uploadedFile || undefined,
        description: description || undefined,
      })

      // Complete progress
      clearInterval(interval)
      setAiAnalysisProgress(100)

      // Set editable summary from AI analysis
      setEditableSummary(result.submission.mediaTranscript)

      setTimeout(() => {
        setShowAIResult(true)
      }, 500)
    } catch (error) {
      console.error('Quest submission failed:', error)
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 5000,
      })
    }
  }

  // Function to handle confirmation of AI evaluation
  const handleConfirmSubmission = () => {
    setShowAIResult(false)

    const result = questSubmission.data
    if (!result) return

    // Add XP to character (from context)
    const xpEarned = result.aiAnalysis.xpEarned
    addXp(xpEarned)

    // Show notifications
    addNotification({
      type: 'reward',
      title: 'XP Gained',
      message: `You earned ${xpEarned} XP!`,
      duration: 3000,
    })

    addNotification({
      type: 'success',
      title: 'Quest Completed',
      message: `You've successfully completed "${quest.title}"`,
      duration: 5000,
      action: {
        label: 'View Rewards',
        onClick: () => {
          router.push('/character')
        },
      },
    })

    // Show success dialog
    setShowSuccessDialog(true)

    // Check for achievements (simplified logic)
    if (questId === 'q1' || questId === '1') {
      unlockAchievement(1)
    }
  }

  // Navigate back to quests after successful submission
  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    router.push('/quest')
  }

  // Mock requirements for display (since not in schema yet)
  const mockRequirements = ['-', '-', '-']

  return (
    <ErrorBoundary>
      <div className="p-4 pb-20">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center"
              onClick={() => router.push('/quest')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>

            <h2 className="text-lg font-semibold ai-gradient-text">
              {quest.title}
            </h2>

            <div className="w-[70px]"></div>
          </div>

          {/* <h1 className="text-xl font-bold ai-gradient-text text-center mb-2">{quest.title}</h1> */}

          <div className="flex items-center justify-center gap-4 mt-1">
            <div className="flex items-center">
              {getQuestTypeIcon(quest.type)}
              <span className="text-sm capitalize">{quest.type} Quest</span>
            </div>

            {getDifficultyBadge(quest.difficulty)}
          </div>
        </div>

        <Tabs defaultValue="details" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">รายละเอียด</TabsTrigger>
            <TabsTrigger value="submit">ส่งงาน</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">คำอธิบาย</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{quest.description}</p>

                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4 mr-1" />
                  <span>
                    {quest.deadline
                      ? formatDeadline(quest.deadline)
                      : 'No deadline'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">เงื่อนไข</CardTitle>
                <CardDescription>
                  Complete these tasks to succeed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockRequirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="min-w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">รางวัล</CardTitle>
                <CardDescription>
                  What you'll earn upon completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-400" />
                    <span className="font-medium text-yellow-400 text-lg">
                      {quest.rewards.xp} XP
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Helps you level up faster
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  อัพโหลดภาพ หรือ วิดีโอประกอบงานที่คุณทำ
                </CardTitle>
                <CardDescription>
                  Upload evidence of your completed quest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedImage && uploadedFile ? (
                    <div className="relative">
                      {uploadedFile.type.startsWith('image/') ? (
                        <img
                          src={uploadedImage}
                          alt="Quest evidence"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : uploadedFile.type.startsWith('video/') ? (
                        <video
                          src={uploadedImage}
                          controls
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : null}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setUploadedImage(null)
                          setUploadedFile(null)
                        }}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded-lg hover:bg-secondary/20 transition-colors">
                        <Camera className="h-8 w-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Take Photo
                        </span>
                      </button>

                      <label className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Upload File
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}

                  {/* Description input */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      อธิบายรายละเอียด (ปล่อยว่างได้)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="..."
                      className="w-full p-3 border border-border rounded-lg bg-background resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Supported formats: PNG, JPG, PDF, MP4 (max 20MB)
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full ai-gradient-bg"
                      disabled={
                        (!uploadedFile && !description) ||
                        questSubmission.isPending
                      }
                      onClick={handleSubmitQuest}>
                      {questSubmission.isPending ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          ส่งงาน
                        </>
                      )}
                    </Button>

                    <div className="mt-4 bg-secondary/20 p-3 rounded-lg">
                      <div className="text-sm mb-2">What happens next?</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• ผลงานที่คุณส่งจะถูกประเมินโดย AI</li>
                        <li>• สถิติของคุณจะถูกวิเคราะห์และปรับปรุง</li>
                        <li>• ผลงานของคุณจะปรากฏในฟีดกิจกรรมทันที</li>
                        <li>• สามารถแก้ไขข้อความได้ หากผิดพลาด</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Processing Dialog */}
        {questSubmission.isPending && (
          <Dialog open={questSubmission.isPending} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                {' '}
                {/* Adjust space-y if needed */}
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 animate-pulse"></div>
                  <div className="absolute inset-[10px] rounded-full bg-card flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <DialogHeader className="text-center">
                  <DialogTitle className="text-lg font-semibold">
                    {' '}
                    {/* Use original h3's styling */}
                    เอไอกำลังตรวจสอบงานของคุณ
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    {' '}
                    {/* Use original p's styling, adjust margin as needed */}
                    โปรดรอสักครู่ เอไอ กำลังวิเคราะห์...
                  </DialogDescription>
                </DialogHeader>
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Analysis in progress</span>
                    <span>{Math.round(aiAnalysisProgress)}%</span>
                  </div>
                  <Progress value={aiAnalysisProgress} className="h-2" />
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    {aiAnalysisProgress > 20 && (
                      <div className="flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-400" />
                        <span>กำลังตรวจสอบข้อมูล...</span>
                      </div>
                    )}
                    {aiAnalysisProgress > 50 && (
                      <div className="flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-400" />
                        <span>กำลังวิเคราะห์...</span>
                      </div>
                    )}
                    {aiAnalysisProgress > 80 && (
                      <div className="flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-400" />
                        <span>คำนวน XP และบันทึกข้อมูล</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* AI Result Dialog */}
        <Dialog open={showAIResult} onOpenChange={setShowAIResult}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>ผลการวิเคราะห์</DialogTitle>
              <DialogDescription>
                ระบบได้แสดงการส่งงานของคุณที่ Feed เรียบร้อยแล้ว
              </DialogDescription>
            </DialogHeader>

            {questSubmission.data && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg">
                  <h3 className="font-semibold mb-2">โพส</h3>
                  <textarea
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className="w-full p-2 border border-border rounded bg-background resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="text-xl font-bold">
                      {questSubmission.data.submission.score}/100
                    </div>
                  </div>

                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      XP ที่ได้รับ
                    </div>
                    <div className="text-xl font-bold text-yellow-400">
                      {questSubmission.data.submission.xpEarned} XP
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements Check</h3>
                  <div className="space-y-1 text-sm">
                    {/* {Object.entries(
                      questSubmission.data.aiAnalysis.requirements
                    ).map(([req, completed]) => (
                      <div key={req} className="flex items-center">
                        {completed ? (
                          <Check className="h-4 w-4 mr-2 text-green-400" />
                        ) : (
                          <X className="h-4 w-4 mr-2 text-red-400" />
                        )}
                        <span>{req}</span>
                      </div>
                    ))} */}
                    <div className="flex items-center">
                      <span>-</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Feedback จาก เอไอ</h3>
                  <p className="text-sm">
                    {questSubmission.data.aiAnalysis.feedback}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {questSubmission.data.aiAnalysis.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex space-x-2 pt-4">
              {/* <Button variant="outline" onClick={() => setShowAIResult(false)}>
                ปิด
              </Button> */}
              <Button
                className="ai-gradient-bg"
                onClick={handleConfirmSubmission}>
                ไปดู Feed ของคุณ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md text-center">
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>

              <DialogHeader className="text-center mb-6">
                {' '}
                {/* Added mb-6 to maintain spacing */}
                <DialogTitle className="text-xl font-bold">
                  {' '}
                  {/* Use original h2's styling */}
                  Quest Completed!
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  {' '}
                  {/* Use original p's styling, adjust margin as needed */}
                  Your submission has been successfully processed
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center justify-center w-full mb-4">
                <div className="flex items-center bg-secondary/30 px-6 py-3 rounded-lg">
                  <Award className="h-6 w-6 mr-2 text-yellow-400" />
                  <span className="text-lg font-bold text-yellow-400">
                    +
                    {questSubmission.data?.aiAnalysis.xpEarned ||
                      quest.rewards.xp}{' '}
                    XP
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSuccessClose}
                className="ai-gradient-bg w-full">
                Back to Quests
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
