'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import { ErrorDisplay, SkeletonLoading } from '@src/components/shared'
import { Button } from '@src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog'
import { Input } from '@src/components/ui/input'
import { Progress } from '@src/components/ui/progress'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@src/components/ui/tabs'
import { useGetJobClass } from '@src/features/character/hooks/api'
import { useCharacterStatus } from '@src/features/character/hooks/useCharacterStatus'
import { characterService } from '@src/features/character/services/client'
import type {
  CharacterConfirmPayload,
  CharacterConfirmResponse,
  CharacterCreatePayload,
  GeneratedPortrait,
} from '@src/features/character/types'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight, Loader2, Upload, UserCircle2 } from 'lucide-react'
import { Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import CharacterSelector from './character-selector'

export default function CharacterCreatePage() {
  // 🔄 ─── Session & Status ────────────────────────────────────
  const {
    hasCharacter,
    isLoading: isLoadingCharacterStatus,
    isAuthenticated,
  } = useCharacterStatus()

  // 📦 ─── State ───────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [selectedJobClassId, setSelectedJobClassId] = useState<string | null>(
    null
  )
  const [characterName, setCharacterName] = useState<string>('')
  const [portrait, setPortrait] = useState<'upload' | 'generate'>('upload')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [generatedPortraits, setGeneratedPortraits] = useState<
    GeneratedPortrait[]
  >([])
  const [selectedPortrait, setSelectedPortrait] =
    useState<GeneratedPortrait | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [aiAnalysisProgress, setAiAnalysisProgress] = useState(0)
  const [showGeneratingDialog, setShowGeneratingDialog] = useState(false)

  // 🧲 ─── Hooks ───────────────────────────────────────────────
  // Fetch job classes from API
  const {
    data: jobClasses,
    isLoading,
    error,
    refetch: refetchJobClasses,
  } = useGetJobClass()

  // ⚙️ ─── Mutations ───────────────────────────────────────────
  // Mutation for generating portraits
  const generateMutation = useMutation({
    mutationFn: (payload: CharacterCreatePayload) =>
      characterService.generatePortraits(payload),
    onMutate: () => setShowGeneratingDialog(true),
    onSuccess: (data) => {
      setGeneratedPortraits(data.portraits)
      setSessionId(data.sessionId)
      setCurrentStep(4)

      setAiAnalysisProgress(100)
      setTimeout(() => {
        setAiAnalysisProgress(0)
        setShowGeneratingDialog(false)
      }, 500)
    },
    onError: (error) => {
      toast.error('Failed to generate portraits')
      console.error(error)
      setShowGeneratingDialog(false)
    },
  })

  // Mutation for confirming character
  const confirmMutation = useMutation({
    mutationFn: (payload: CharacterConfirmPayload) =>
      characterService.confirmCharacter(payload),
    onSuccess: async (data: CharacterConfirmResponse) => {
      console.log('Character created successfully:', data)

      // เพิ่ม toast แจ้งความสำเร็จ
      toast.success('สร้าง Character สำเร็จ!')

      window.location.href = '/'
    },
    onError: (error) => {
      toast.error('Failed to create character')
      console.error(error)
    },
  })

  // 🛠 ─── Handlers ────────────────────────────────────────────
  const confirmCharacter = (portrait: GeneratedPortrait) => {
    const generatedPortraitsMap: Record<string, string> = {}
    generatedPortraits.forEach((p) => {
      const level = p.id.split('_')[1]
      generatedPortraitsMap[level] = p.url
    })

    const payload: CharacterConfirmPayload = {
      jobClassId: Number.parseInt(selectedJobClassId!),
      name: characterName,
      portraitUrl: portrait.url,
      originalFaceImage: undefined,
      generatedPortraits: generatedPortraitsMap,
    }

    confirmMutation.mutate(payload)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
    }
  }

  const handleJobClassSelect = (jobClassId: string) => {
    setSelectedJobClassId(jobClassId)
    setCurrentStep(2)
  }

  const handleNextStep = async () => {
    if (currentStep === 1 && selectedJobClassId) {
      setCurrentStep(2)
    } else if (currentStep === 2 && characterName.trim() !== '') {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Generate portraits
      const payload: CharacterCreatePayload = {
        jobClassId: selectedJobClassId!,
        name: characterName,
        portraitType: portrait,
        ...(portrait === 'upload' && uploadedFile
          ? { file: uploadedFile }
          : {}),
      }

      await generateMutation.mutate(payload)
    } else if (currentStep === 4 && selectedPortrait) {
      // Confirm character creation
      const generatedPortraitsMap: Record<string, string> = {}
      generatedPortraits.forEach((p) => {
        const level = p.id.split('_')[1]
        generatedPortraitsMap[level] = p.url
      })

      const payload: CharacterConfirmPayload = {
        jobClassId: Number.parseInt(selectedJobClassId!),
        name: characterName,
        portraitUrl: selectedPortrait.url,
        originalFaceImage: undefined, // จะได้มาจาก session ที่ server
        generatedPortraits: generatedPortraitsMap,
      }

      await confirmMutation.mutate(payload)
    }
  }

  // 🔄 ─── Effects ────────────────────────────────────────
  useEffect(() => {
    if (generateMutation.isPending) {
      let progress = 0
      const start = Date.now()
      const duration = 30000 // 30 วินาที
      const interval = setInterval(() => {
        const elapsed = Date.now() - start
        const calculated = Math.min((elapsed / duration) * 99, 99)
        progress = calculated
        setAiAnalysisProgress(progress)
      }, 200)

      return () => clearInterval(interval)
    }
  }, [generateMutation.isPending])

  useEffect(() => {
    if (generateMutation.isSuccess) {
      setAiAnalysisProgress(100)
    }
  }, [generateMutation.isSuccess])

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <SkeletonLoading type="character" text="กำลังโหลดข้อมูลอาชีพ..." />
      </div>
    )
  }

  // แสดง loading ขณะตรวจสอบ session
  if (isLoadingCharacterStatus)
    return <div className="flex items-center justify-center min-h-screen"></div>

  // ถ้าไม่ได้ login หรือมี character แล้ว จะถูก redirect ไปแล้วใน hook
  if (!isAuthenticated || hasCharacter) return null

  // Show error state
  if (error) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <ErrorDisplay
          title="ไม่สามารถโหลดข้อมูลอาชีพได้"
          message="เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง"
          severity="error"
          onRetry={refetchJobClasses}
          showRetry={true}
          technicalDetails={error}
        />
      </div>
    )
  }

  // Get selected job class details
  const selectedJobClass =
    jobClasses.find((jc: any) => jc.id === selectedJobClassId) || null

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold ai-gradient-text">สร้าง Character</h1>
        <p className="text-muted-foreground">Generate Character ผ่านระบบ AI</p>
      </div>

      <div className="flex justify-between items-center mb-8 ">
        <div
          className={`flex items-center ${currentStep >= 1 ? 'ai-gradient-text' : 'text-muted-foreground'}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 1 ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
            1
          </div>
          <span>อาชีพ</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
        <div
          className={`flex items-center ${currentStep >= 2 ? 'ai-gradient-text' : 'text-muted-foreground'}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 2 ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
            2
          </div>
          <span>ชื่อ</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
        <div
          className={`flex items-center ${currentStep >= 3 ? 'ai-gradient-text' : 'text-muted-foreground'}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 3 ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
            3
          </div>
          <span>Character</span>
        </div>
      </div>

      {/* Step 1: Job Class Selection with new Carousel UI */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4"></h2>

          {/* New Character Selector Carousel */}
          <CharacterSelector
            jobClasses={jobClasses || []}
            selectedJobClassId={selectedJobClassId}
            onSelectJobClass={handleJobClassSelect}
          />

          {/* <Button
            className="w-full ai-gradient-bg mt-6"
            onClick={handleNextStep}
            disabled={!selectedJobClassId}>
            ขั้นตอนถัดไป
          </Button> */}
        </div>
      )}

      {/* Step 2: Character Name */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">ใส่ชื่อของคุณ</h2>

          <Card>
            <CardHeader>
              <CardTitle>ชื่อ</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="ชื่อ"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="mb-4"
              />

              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm mb-2">
                  อาชีพที่เลือก:{' '}
                  <span className="ai-gradient-text font-semibold">
                    {selectedJobClass?.name}
                  </span>
                </p>
                <p className="text-sm">
                  ตำแหน่งเริ่มต้น:{' '}
                  <span className="ai-gradient-text font-semibold">
                    {selectedJobClass?.levels[0]?.title}
                  </span>
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="mr-2">
                ย้อนกลับ
              </Button>
              <Button
                className="flex-1 ai-gradient-bg"
                onClick={handleNextStep}
                disabled={characterName.trim() === ''}>
                ขั้นตอนถัดไป
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Step 3: Character Portrait */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">สร้าง Character</h2>

          <Tabs
            defaultValue="upload"
            onValueChange={(v) => setPortrait(v as 'upload' | 'generate')}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="upload">อัปโหลดรูปภาพ</TabsTrigger>
              <TabsTrigger value="generate">Random</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>อัปโหลดรูปคุณ</CardTitle>
                  <CardDescription>
                    รูปของคุณจะถูกใช้เป็นแหล่งอ้างอิงในการสร้าง Character
                    ให้เหมือนคุณที่สุด
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {uploadedImage ? (
                    <div className="mb-4 relative">
                      <img
                        src={uploadedImage || '/placeholder.svg'}
                        alt="Uploaded portrait"
                        className="w-32 h-32 object-cover rounded-full border-4 ai-gradient-border"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 w-32 h-32 flex items-center justify-center bg-secondary rounded-full">
                      <UserCircle2 className="h-20 w-20 text-muted-foreground" />
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 cursor-pointer bg-secondary hover:bg-secondary/80 transition-colors text-foreground px-4 py-2 rounded-md w-full">
                    <Upload className="h-4 w-4" />
                    <span>เลือก</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    รูปภาพของคุณจะถูกใช้เพื่อสร้างรูป Character ที่แตกต่างกัน 6
                    แบบสำหรับแต่ละระดับความสำเร็จ
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Random</CardTitle>
                  <CardDescription>
                    ให้ AI ของเราสร้างรูป Character ให้คุณ
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="mb-4 w-32 h-32 flex items-center justify-center bg-secondary rounded-full overflow-hidden relative ai-gradient-border border-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 animate-pulse"></div>
                    <UserCircle2 className="h-20 w-20 text-muted-foreground relative z-10" />
                  </div>

                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    ระบบจะสร้างรูป Character ที่ไม่ซ้ำกัน 6
                    รูปสำหรับระดับความสำเร็จของคุณ
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="flex-1">
              ย้อนกลับ
            </Button>
            <Button
              className="flex-1 ai-gradient-bg"
              onClick={handleNextStep}
              disabled={generateMutation.isPending}>
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                'สร้าง Character'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Select Generated Portrait */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4"> Character ของคุณ</h2>

          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                {generatedPortraits.length > 0 && (
                  <>
                    <img
                      src={generatedPortraits[0].url || '/placeholder.svg'}
                      alt="Generated character"
                      className="object-cover rounded-full mb-4"
                    />
                    <p className="text-sm text-muted-foreground mb-2">
                      Model: EVX {generatedPortraits[0].model.toUpperCase()}
                    </p>
                  </>
                )}

                <div className="w-full bg-secondary/30 rounded-lg p-4 text-center">
                  <p className="text-sm mb-2">
                    ชื่อ:{' '}
                    <span className="ai-gradient-text font-semibold">
                      {characterName}
                    </span>
                  </p>
                  <p className="text-sm mb-2">
                    อาชีพ:{' '}
                    <span className="ai-gradient-text font-semibold">
                      {selectedJobClass?.name}
                    </span>
                  </p>
                  <p className="text-sm">
                    Level 1:{' '}
                    <span className="ai-gradient-text font-semibold">
                      {selectedJobClass?.levels[0]?.title}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            {/* <p>ระบบได้สร้าง Character ให้คุณแล้ว</p> */}
            {/* <p>รูป Character จะเปลี่ยนไปตามระดับที่สูงขึ้น</p> */}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(3)}
              className="flex-1">
              ย้อนกลับ
            </Button>
            <Button
              className="flex-1 ai-gradient-bg"
              onClick={() => {
                if (generatedPortraits.length > 0) {
                  const portrait = generatedPortraits[0]
                  setSelectedPortrait(portrait)
                  confirmCharacter(portrait)
                }
              }}
              disabled={
                generatedPortraits.length === 0 || confirmMutation.isPending
              }>
              {confirmMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                'ยืนยันการสร้าง'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* AI Processing Dialog สำหรับการสร้าง Character */}
      <Dialog open={showGeneratingDialog} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md text-center py-8 overflow-y-auto max-h-screen"
          hideClose>
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
                เรากำลังสร้าง Character ของคุณ
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 text-center">
                โปรดรอสักครู่...
              </DialogDescription>
            </DialogHeader>
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs mb-1">
                <span>Analysis in progress</span>
                <span>{Math.round(aiAnalysisProgress)}%</span>
              </div>
              <Progress value={aiAnalysisProgress} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                {aiAnalysisProgress > 10 && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span>กำลังตรวจสอบข้อมูล...</span>
                  </div>
                )}
                {aiAnalysisProgress > 20 && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span>กำลังวิเคราะห์ใบหน้า...</span>
                  </div>
                )}
                {aiAnalysisProgress > 50 && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span>กำลังสร้าง Character...</span>
                  </div>
                )}
                {aiAnalysisProgress > 70 && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span>กำลัง Remove Background...</span>
                  </div>
                )}
                {aiAnalysisProgress > 90 && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span>บันทึกข้อมูล...</span>
                  </div>
                )}
                {aiAnalysisProgress > 97 && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span>กำลังรอ Response...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
