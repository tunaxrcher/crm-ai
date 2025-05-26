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
  X,
} from 'lucide-react'

import { mockAIAnalysis } from './mockAIAnalysis'
// Import mock data
import { mockQuests } from './mockQuestDetail'

// Function to determine difficulty badge color
const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return (
        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
          {difficulty}
        </Badge>
      )
    case 'medium':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
          {difficulty}
        </Badge>
      )
    case 'hard':
      return (
        <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
          {difficulty}
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

  // This effect is a workaround for error boundaries in client components
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

  // Try-catch for rendering children
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
}

export default function QuestDetail({ questId }: QuestDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('details')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAIResult, setShowAIResult] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [aiAnalysisProgress, setAiAnalysisProgress] = useState(0)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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

  // Get quest data
  const quest = mockQuests[questId as keyof typeof mockQuests]

  // Handle if quest doesn't exist
  if (!quest) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-60">
        <h1 className="text-xl font-bold mb-2">Quest Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The quest with ID "{questId}" doesn't exist.
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
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
    }
  }

  // Handle simulated AI evaluation
  const handleSubmitQuest = () => {
    setIsLoading(true)
    setAiAnalysisProgress(0)

    // Simulate AI processing with progress updates
    const interval = setInterval(() => {
      setAiAnalysisProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 300)

    // Simulate AI evaluation completion after 3-5 seconds
    setTimeout(
      () => {
        clearInterval(interval)
        setAiAnalysisProgress(100)

        setTimeout(() => {
          setIsLoading(false)
          setAiAnalysis(mockAIAnalysis)
          setShowAIResult(true)
        }, 500)
      },
      3000 + Math.random() * 2000
    )
  }

  // Function to handle confirmation of AI evaluation
  const handleConfirmSubmission = () => {
    setShowAIResult(false)

    // Add XP to character
    const xpEarned = aiAnalysis?.xpEarned || quest.rewards.xp
    addXp(xpEarned)

    // Manually show XP gain notification
    addNotification({
      type: 'reward',
      title: 'XP Gained',
      message: `You earned ${xpEarned} XP!`,
      duration: 3000,
    })

    // Send a notification when quest is completed
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

    // Check if quest has isSpecial property and if it's true
    if ('isSpecial' in quest && quest.isSpecial) {
      unlockAchievement(1)
    }

    // Special case for the first quest to unlock the "First Steps" achievement
    if (questId === 'q1') {
      unlockAchievement(1)
    }
  }
  // Navigate back to quests after successful submission
  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    router.push('/quest')
  }

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
              <span>Back</span>
            </Button>

            <h2 className="text-lg font-semibold ai-gradient-text">
              Quest Detail
            </h2>

            <div className="w-[70px]"></div>
          </div>

          <h1 className="text-xl font-bold ai-gradient-text text-center mb-2">
            {quest.title}
          </h1>

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
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="submit">Submit Quest</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Description</CardTitle>
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
                <CardTitle className="text-base">Requirements</CardTitle>
                <CardDescription>
                  Complete these tasks to succeed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {quest.requirements.map((requirement, index) => (
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
                <CardTitle className="text-base">Rewards</CardTitle>
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

                <div className="hidden">
                  <div className="text-sm mb-2">Estimated Stat Gains:</div>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(quest.rewards.stats).map(
                      ([stat, value]) => (
                        <div
                          key={stat}
                          className="bg-secondary/30 p-2 rounded-lg flex flex-col items-center">
                          <span className="text-xs font-medium">{stat}</span>
                          <span className="text-sm">+{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Submit Your Work</CardTitle>
                <CardDescription>
                  Upload evidence of your completed quest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedImage ? (
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Quest evidence"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setUploadedImage(null)}>
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
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Supported formats: PNG, JPG, PDF, MP4 (max 20MB)
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full ai-gradient-bg"
                      disabled={!uploadedImage || isLoading}
                      onClick={handleSubmitQuest}>
                      {isLoading ? (
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
                          Submit for AI Evaluation
                        </>
                      )}
                    </Button>

                    <div className="mt-4 bg-secondary/20 p-3 rounded-lg">
                      <div className="text-sm mb-2">What happens next?</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Your submission will be evaluated by AI</li>
                        <li>
                          • You'll receive XP based on the quality of your work
                        </li>
                        <li>• Your stats will be analyzed and improved</li>
                        <li>
                          • Your submission will appear in the activity feed
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Processing Dialog */}
        {isLoading && (
          <Dialog open={isLoading} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md text-center py-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 animate-pulse"></div>
                  <div className="absolute inset-[10px] rounded-full bg-card flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-blue-400" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    AI is Evaluating Your Work
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please wait while our AI analyzes your submission...
                  </p>
                </div>

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
                        <span>Examining submission...</span>
                      </div>
                    )}

                    {aiAnalysisProgress > 50 && (
                      <div className="flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-400" />
                        <span>Evaluating requirements completion...</span>
                      </div>
                    )}

                    {aiAnalysisProgress > 80 && (
                      <div className="flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-400" />
                        <span>Calculating rewards...</span>
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
              <DialogTitle>AI Evaluation Results</DialogTitle>
              <DialogDescription>
                Here's the AI analysis of your quest submission
              </DialogDescription>
            </DialogHeader>

            {aiAnalysis && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-sm">{aiAnalysis.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="text-xl font-bold">
                      {aiAnalysis.score}/100
                    </div>
                  </div>

                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      XP Earned
                    </div>
                    <div className="text-xl font-bold text-yellow-400">
                      {aiAnalysis.xpEarned} XP
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements Check</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(aiAnalysis.requirements).map(
                      ([req, completed]) => (
                        <div key={req} className="flex items-center">
                          {completed ? (
                            <Check className="h-4 w-4 mr-2 text-green-400" />
                          ) : (
                            <X className="h-4 w-4 mr-2 text-red-400" />
                          )}
                          <span>{req}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Feedback</h3>
                  <p className="text-sm">{aiAnalysis.feedback}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAIResult(false)}>
                Cancel
              </Button>
              <Button
                className="ai-gradient-bg"
                onClick={handleConfirmSubmission}>
                Confirm Submission
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

              <h2 className="text-xl font-bold mb-2">Quest Completed!</h2>

              <p className="text-muted-foreground mb-6">
                Your submission has been successfully processed
              </p>

              <div className="flex items-center justify-center w-full mb-4">
                <div className="flex items-center bg-secondary/30 px-6 py-3 rounded-lg">
                  <Award className="h-6 w-6 mr-2 text-yellow-400" />
                  <span className="text-lg font-bold text-yellow-400">
                    +{aiAnalysis?.xpEarned || quest.rewards.xp} XP
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
