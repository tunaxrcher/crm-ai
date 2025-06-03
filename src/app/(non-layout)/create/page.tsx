'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

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
import { Input } from '@src/components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@src/components/ui/tabs'
import { useGetJobClass } from '@src/features/character/hook/api'
import { characterService } from '@src/features/character/service/client'
import {
  CharacterConfirmPayload,
  CharacterConfirmResponse,
  CharacterCreatePayload,
  GeneratedPortrait,
  JobClass,
} from '@src/features/character/types'
import { useMutation } from '@tanstack/react-query'
import {
  BadgePercent,
  Briefcase,
  ChevronRight,
  LineChart,
  Loader2,
  Receipt,
  Upload,
  UserCircle2,
} from 'lucide-react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export default function CharacterCreation() {
  const router = useRouter()
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

  // Fetch job classes from API
  const {
    data: jobClasses,
    isLoading,
    error,
    refetch: refetchJobClasses,
  } = useGetJobClass()

  // Mutation for generating portraits
  const generateMutation = useMutation({
    mutationFn: (payload: CharacterCreatePayload) =>
      characterService.generatePortraits(payload),
    onSuccess: (data) => {
      setGeneratedPortraits(data.portraits)
      setSessionId(data.sessionId)
      setCurrentStep(4)
    },
    onError: (error) => {
      toast.error('Failed to generate portraits')
      console.error(error)
    },
  })

  // Mutation for confirming character
  const confirmMutation = useMutation({
    mutationFn: (payload: CharacterConfirmPayload) =>
      characterService.confirmCharacter(payload),
    onSuccess: async (data: CharacterConfirmResponse) => {
      // ถ้ามี credentials (user ใหม่) ให้ login อัตโนมัติ
      if (data.credentials) {
        const result = await signIn('credentials', {
          username: data.credentials.username,
          password: data.credentials.password,
          redirect: false,
        })

        if (result?.ok) {
          toast.success('Character created and logged in successfully!')
          router.push('/quest')
        } else {
          toast.error(
            'Character created but failed to login. Please login manually.'
          )
          router.push('/auth/login')
        }
      } else {
        // ถ้าเป็น user เก่า redirect ไปหน้า quest เลย
        toast.success('Character created successfully!')
        router.push('/quest')
      }
    },
    onError: (error) => {
      toast.error('Failed to create character')
      console.error(error)
    },
  })

  const confirmCharacter = (portrait: GeneratedPortrait) => {
    const generatedPortraitsMap: Record<string, string> = {}
    generatedPortraits.forEach((p) => {
      const level = p.id.split('_')[1]
      generatedPortraitsMap[level] = p.url
    })

    const payload: CharacterConfirmPayload = {
      jobClassId: parseInt(selectedJobClassId!),
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
        jobClassId: parseInt(selectedJobClassId!),
        name: characterName,
        portraitUrl: selectedPortrait.url,
        originalFaceImage: undefined, // จะได้มาจาก session ที่ server
        generatedPortraits: generatedPortraitsMap,
      }

      await confirmMutation.mutate(payload)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <SkeletonLoading type="character" text="กำลังโหลดข้อมูลอาชีพ..." />
      </div>
    )
  }

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
    jobClasses.find((jc) => jc.id === selectedJobClassId) || null

  // Get job class icon
  // ปรับให้ switch เช็คจาก jobClass.name (string, เช่น "นักการตลาด", "นักบัญชี" ฯลฯ)
  const getJobClassIcon = (jobClass: JobClass) => {
    switch (jobClass.name) {
      case 'นักการตลาด':
      case 'Marketing':
        return <BadgePercent className="h-8 w-8" />
      case 'นักขาย':
      case 'Sales':
        return <LineChart className="h-8 w-8" />
      case 'นักบัญชี':
      case 'Accounting':
        return <Receipt className="h-8 w-8" />
      case 'โปรแกรมเมอร์':
      case 'Programmer':
        return <UserCircle2 className="h-8 w-8" />
      // เพิ่มตามสายอาชีพที่มีในระบบ
      default:
        return <Briefcase className="h-8 w-8" />
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold ai-gradient-text">หน้าทดสอบ</h1>
        <p className="text-muted-foreground">Generate Character ผ่านระบบ AI</p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div
          className={`flex items-center ${currentStep >= 1 ? 'ai-gradient-text' : 'text-muted-foreground'}`}>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-2">
            1
          </div>
          <span>อาชีพ</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
        <div
          className={`flex items-center ${currentStep >= 2 ? 'ai-gradient-text' : 'text-muted-foreground'}`}>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-2">
            2
          </div>
          <span>ชื่อ</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
        <div
          className={`flex items-center ${currentStep >= 3 ? 'ai-gradient-text' : 'text-muted-foreground'}`}>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-2">
            3
          </div>
          <span>Character</span>
        </div>
      </div>

      {/* Step 1: Job Class Selection */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">เลือกอาชีพของคุณ</h2>

          {jobClasses.map((jobClass) => (
            <Card
              key={jobClass.id}
              className={`cursor-pointer hover:ai-gradient-border transition-all ${selectedJobClassId === jobClass.id ? 'ai-gradient-border' : ''}`}
              onClick={() => handleJobClassSelect(jobClass.id)}>
              <CardHeader className="flex flex-row items-center pb-2">
                <div className="mr-4">{getJobClassIcon(jobClass)}</div>
                <div>
                  <CardTitle>{jobClass.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {jobClass.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-2">
                <div className="text-sm text-muted-foreground">
                  <span className="ai-gradient-text">Level 1:</span>{' '}
                  {jobClass.levels[0]?.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="ai-gradient-text">Level 100:</span>{' '}
                  {jobClass.levels[5]?.title}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            className="w-full ai-gradient-bg"
            onClick={handleNextStep}
            disabled={!selectedJobClassId}>
            ขั้นตอนถัดไป
          </Button>
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
              <TabsTrigger value="generate">AI Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>อัปโหลดรูปคุณ</CardTitle>
                  <CardDescription>
                    รูปภาพของคุณจะถูกใช้เป็นแหล่งอ้างอิง Character โดยระบบ AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {uploadedImage ? (
                    <div className="mb-4 relative">
                      <img
                        src={uploadedImage}
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
                  <CardTitle>รูป Characterที่สร้างโดย AI</CardTitle>
                  <CardDescription>
                    ให้ AI ของเราสร้างรูป Characterให้คุณ
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="mb-4 w-32 h-32 flex items-center justify-center bg-secondary rounded-full overflow-hidden relative ai-gradient-border border-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 animate-pulse"></div>
                    <UserCircle2 className="h-20 w-20 text-muted-foreground relative z-10" />
                  </div>

                  <p className="text-center text-sm">
                    ระบบจะสร้างรูป Characterที่ไม่ซ้ำกัน 6
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
                      src={generatedPortraits[0].url}
                      alt="Generated character"
                      className="object-cover rounded-full mb-4"
                    />
                    <p className="text-sm text-muted-foreground mb-2">
                      Model: {generatedPortraits[0].model}
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
            <p>ระบบได้สร้าง Character ให้คุณแล้ว</p>
            <p>รูป Character จะเปลี่ยนไปตามระดับที่สูงขึ้น</p>
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
    </div>
  )
}
