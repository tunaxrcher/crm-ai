// src/features/quest/components/AddQuestButton.tsx
'use client'

import { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
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
import { useQuestNotifications } from '@src/features/quest/hooks/useQuestNotifications'
import {
  Camera,
  Check,
  Coins,
  Edit3,
  Plus,
  Send,
  Sparkles,
  Upload,
  X,
  Zap,
} from 'lucide-react'

import { useSelfSubmitQuest, useUpdateQuestSubmission } from '../hooks/api'

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

// src/features/quest/components/AddQuestButton.tsx

const AddQuestButton = () => {
  const router = useRouter()
  const { addNotification } = useNotification()
  const { handleQuestSubmissionNotifications } = useQuestNotifications()

  // States
  const [showModal, setShowModal] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [aiAnalysisProgress, setAiAnalysisProgress] = useState(0)
  const [showAIResult, setShowAIResult] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [editableSummary, setEditableSummary] = useState('')

  // Hooks
  const selfSubmitQuest = useSelfSubmitQuest()
  const updateSummary = useUpdateQuestSubmission()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const MAX_SIZE_MB = 25
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

    if (!file) return

    if (file.size > MAX_SIZE_BYTES) {
      alert(`ไฟล์มีขนาดเกิน ${MAX_SIZE_MB}MB กรุณาเลือกไฟล์ที่เล็กกว่านี้`)
      e.target.value = ''
      return
    }

    const fileURL = URL.createObjectURL(file)
    setUploadedFile(file)
    setUploadedImage(fileURL)
  }

  const handleSubmit = async () => {
    if (!uploadedFile && !description) return

    try {
      setAiAnalysisProgress(0)
      setShowModal(false)

      const interval = setInterval(() => {
        setAiAnalysisProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress >= 99 ? 99 : newProgress
        })
      }, 300)

      const result = await selfSubmitQuest.mutateAsync({
        mediaFile: uploadedFile || undefined,
        description: description || undefined,
      })

      clearInterval(interval)
      setAiAnalysisProgress(100)

      if (result?.submission?.mediaTranscript) {
        setEditableSummary(result.submission.mediaTranscript)
      }

      if (result?.characterUpdate) {
        handleQuestSubmissionNotifications({
          xpEarned: result.submission.xpEarned,
          questTitle: result.quest.title || 'New Quest',
          characterUpdate: result.characterUpdate,
        })
      }

      setTimeout(() => {
        setShowAIResult(true)
      }, 500)
    } catch (error) {
      console.error('Failed to submit quest:', error)
      addNotification({
        type: 'error',
        title: 'การส่งงานล้มเหลว',
        message:
          error instanceof Error
            ? error.message
            : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        duration: 5000,
      })
      resetForm()
    }
  }

  const handleUpdateSummary = async () => {
    if (!selfSubmitQuest.data?.submission?.id || !editableSummary.trim()) {
      addNotification({
        type: 'error',
        title: 'แก้ไขไม่สำเร็จ',
        message: 'กรุณาใส่เนื้อหาโพสต์',
        duration: 3000,
      })
      return
    }

    try {
      await updateSummary.mutateAsync({
        questId: selfSubmitQuest.data.quest.id.toString(),
        submissionId: selfSubmitQuest.data.submission.id,
        summary: editableSummary,
      })

      addNotification({
        type: 'success',
        title: 'อัปเดตสำเร็จ',
        message: 'เนื้อหาโพสต์ถูกอัปเดตแล้ว',
        duration: 3000,
      })

      setShowAIResult(false)
      setShowSuccessDialog(true)
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'อัปเดตไม่สำเร็จ',
        message: 'ไม่สามารถอัปเดตเนื้อหาโพสต์ได้',
        duration: 3000,
      })
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    resetForm()
    router.push('/feed')
  }

  const resetForm = () => {
    setUploadedImage(null)
    setUploadedFile(null)
    setDescription('')
    setEditableSummary('')
  }

  return (
    <>
      {/* ปุ่มลอย - Fixed Version */}
      <div className="fixed bottom-20 right-4 z-10">
        {/* Glow effects */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-20 blur-2xl scale-150 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 opacity-15 blur-xl scale-125 animate-ping"></div>

        {/* Orbiting particles */}
        <div
          className="absolute inset-0 flex items-center justify-center animate-spin"
          style={{ animationDuration: '8s' }}>
          <div
            className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-lg"
            style={{ transform: 'translateX(35px)' }}></div>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center animate-spin"
          style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
          <div
            className="absolute w-2 h-2 bg-pink-400 rounded-full shadow-lg"
            style={{ transform: 'translateX(40px)' }}></div>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center animate-spin"
          style={{ animationDuration: '10s' }}>
          <div
            className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-lg"
            style={{ transform: 'translateX(30px)' }}></div>
        </div>

        {/* Main button */}
        <Button
          onClick={(e) => {
            setShowModal(true)
          }}
          className="relative h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-110 group border-4 border-white/30 animate-pulse"
          aria-label="Add Quest"
          style={{
            background:
              'linear-gradient(45deg, #8b5cf6, #3b82f6, #06b6d4, #10b981, #f59e0b, #ef4444, #ec4899)',
            backgroundSize: '400% 400%',
            animation:
              'gradient-shift 3s ease infinite, pulse 2s ease-in-out infinite',
            filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))',
          }}>
          {/* Inner effects */}
          <div className="absolute inset-1 rounded-full bg-white/10 animate-ping"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>

          {/* Icon */}
          <Plus
            className="h-10 w-10 relative z-10 transition-all duration-500 group-hover:rotate-90 group-hover:scale-125 text-white drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }}
          />

          {/* Sparkles */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping shadow-lg"></div>
          <div
            className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping shadow-lg"
            style={{ animationDelay: '0.15s' }}></div>
          <div
            className="absolute -top-2 -left-2 w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping shadow-lg"
            style={{ animationDelay: '0.3s' }}></div>
          <div
            className="absolute -bottom-2 -right-2 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping shadow-lg"
            style={{ animationDelay: '0.45s' }}></div>

          {/* Energy rings */}
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping scale-110"></div>
          <div
            className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping scale-125"
            style={{ animationDelay: '0.3s' }}></div>
          <div
            className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping scale-150"
            style={{ animationDelay: '0.6s' }}></div>
        </Button>
      </div>

      {/* Add CSS for gradient animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
        }}
      />

      {/* Modal หลัก */}
      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          if (!open && !selfSubmitQuest.isPending) resetForm()
          setShowModal(open)
        }}>
        <DialogContent className="sm:max-w-md overflow-y-auto max-h-screen">
          <DialogHeader>
            <Image
              src="/auto-import-evx-logo.png"
              alt="Auto Import EVX Logo"
              width={120}
              height={40}
              className="mx-auto mb-5"
            />
            <DialogTitle>อัพโหลดภาพ หรือ วิดีโอประกอบงานที่คุณทำ</DialogTitle>
            <DialogDescription>
              Supported formats: PNG, JPG, MP4 (
              <span className="text-yellow-500 font-semibold">สูงสุด 25MB</span>
              )
            </DialogDescription>
          </DialogHeader>

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
                  <X className="h-4 w-4" />
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

            <div>
              <label className="text-sm font-medium mb-2 block">
                หากอยากบอกรายละเอียด
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ฉันเพิ่งทำ..."
                className="w-full p-3 border border-border rounded-lg bg-background resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="ai-gradient-bg w-full"
              disabled={
                (!uploadedFile && !description) || selfSubmitQuest.isPending
              }
              onClick={handleSubmit}>
              {selfSubmitQuest.isPending ? (
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
                  กำลังประมวลผล...
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  ส่งงาน
                </>
              )}
            </Button>
          </DialogFooter>
          <div className="mt-4 bg-secondary/20 p-3 rounded-lg">
            <div className="text-sm mb-2">What happens next?</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• AI จะตรวจสอบข้อมูลของคุณ</li>
              <li>• ผลงานที่คุณส่งจะถูกประเมินโดย AI</li>
              <li>• AI จะคำนวน XP และ Token ตามผลงาน</li>
              <li>• ผลงานของคุณจะปรากฏในฟีดกิจกรรมทันที</li>
              <hr />
              <li>• สามารถแก้ไขข้อความได้ หากผิดพลาด</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Processing Dialog */}
      <Dialog open={selfSubmitQuest.isPending} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md text-center py-8 overflow-y-auto max-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 animate-pulse"></div>
              <div className="absolute inset-[10px] rounded-full bg-card flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-lg font-semibold text-center">
                เอไอกำลังตรวจสอบงานของคุณ
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 text-center">
                โปรดรอสักครู่ เอไอ ...
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
                {aiAnalysisProgress > 70 && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span>กำลังสร้างภารกิจใหม่...</span>
                  </div>
                )}
                {aiAnalysisProgress > 80 && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span>คำนวน XP และ Token</span>
                  </div>
                )}
                {aiAnalysisProgress > 97 && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span>โพสต์ลงฟีด</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Result Dialog - แก้ไขส่วนนี้ */}
      <Dialog
        open={showAIResult}
        onOpenChange={(open) => {
          if (!open && !updateSummary.isPending) {
            setShowAIResult(open)
            if (!open) setShowSuccessDialog(true)
          }
        }}>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-screen">
          <DialogHeader>
            <DialogTitle>ผลการวิเคราะห์</DialogTitle>
            <DialogDescription>
              AI ได้สร้างภารกิจใหม่และบันทึกความสำเร็จของคุณเรียบร้อยแล้ว
            </DialogDescription>
          </DialogHeader>

          {selfSubmitQuest.data && (
            <div className="space-y-4">
              {/* Quest Info */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg">
                <h3 className="font-semibold mb-2">ภารกิจที่สร้าง</h3>
                <div className="font-medium text-base">
                  {selfSubmitQuest.data.quest?.title}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {selfSubmitQuest.data.quest?.description}
                </p>
              </div>

              {/* Post Content */}
              {selfSubmitQuest.data.submission?.mediaType === 'video' && (
                <div className="p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg">
                  <h3 className="font-semibold mb-2">โพสต์</h3>
                  <textarea
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className="w-full p-2 border border-border rounded bg-background resize-none"
                    rows={3}
                    placeholder="แก้ไขเนื้อหาโพสต์..."
                  />
                </div>
              )}

              {/* Results - เพิ่ม Token Display */}
              <div className="grid grid-cols-2 gap-3">
                {/* <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Award className="h-3 w-3" />
                    <span>Score</span>
                  </div>
                  <div className="text-xl font-bold">
                    {selfSubmitQuest.data.submission?.score || 0}/100
                  </div>
                </div> */}

                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Zap className="h-3 w-3" />
                    <span>XP ที่ได้รับ</span>
                  </div>
                  <div className="text-xl font-bold text-yellow-400">
                    {selfSubmitQuest.data.submission?.xpEarned || 0}
                  </div>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Coins className="h-3 w-3" />
                    <span>Token ที่ได้รับ</span>
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    {selfSubmitQuest.data.userToken?.tokensEarned || 0}
                  </div>
                </div>
              </div>

              {/* Current Balance */}
              {/* {selfSubmitQuest.data.userToken && (
                <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      ยอด Token สะสม:
                    </span>
                    <span className="text-lg font-semibold flex items-center gap-1">
                      <Coins className="h-4 w-4 text-amber-500" />
                      {selfSubmitQuest.data.userToken.currentTokens} 
                    </span>
                  </div>
                </div>
              )} */}

              {/* Feedback */}
              <div>
                <h3 className="font-semibold mb-2">Feedback จาก เอไอ</h3>
                <p className="text-sm bg-secondary/20 p-3 rounded-lg">
                  {selfSubmitQuest.data.submission?.feedback ||
                    'AI ได้วิเคราะห์งานของคุณเรียบร้อยแล้ว'}
                </p>
              </div>

              {/* Tags */}
              {selfSubmitQuest.data.submission?.tags && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selfSubmitQuest.data.submission.tags) &&
                      selfSubmitQuest.data.submission.tags.map(
                        (tag: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {tag}
                          </Badge>
                        )
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex space-x-2 pt-4">
            {selfSubmitQuest.data?.submission?.mediaType === 'video' && (
              <Button
                variant="outline"
                onClick={handleUpdateSummary}
                disabled={updateSummary.isPending}>
                {updateSummary.isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    กำลังอัปเดต...
                  </span>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    อัพเดทแก้ไขโพสต์
                  </>
                )}
              </Button>
            )}
            <Button
              className="ai-gradient-bg"
              disabled={updateSummary.isPending}
              onClick={() => {
                setShowAIResult(false)
                setShowSuccessDialog(true)
                router.push('/feed')
              }}>
              ไปดู Feed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
    </>
  )
}

export default AddQuestButton
