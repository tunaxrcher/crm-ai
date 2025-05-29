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
import { JobClass } from '@src/features/character/types'
import {
  BadgePercent,
  Briefcase,
  ChevronRight,
  LineChart,
  Receipt,
  Upload,
  UserCircle2,
} from 'lucide-react'

export default function CharacterCreation() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [selectedJobClassId, setSelectedJobClassId] = useState<string | null>(
    null
  )
  const [characterName, setCharacterName] = useState<string>('')
  const [portrait, setPortrait] = useState<'upload' | 'generate'>('upload')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  // Fetch job classes from API
  // const { jobClasses, isLoading, error, refetchJobClasses } = useJobClasses()
  const {
    data: jobClasses,
    isLoading,
    error,
    refetch: refetchJobClasses,
  } = useGetJobClass()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
    }
  }

  const handleJobClassSelect = (jobClassId: string) => {
    setSelectedJobClassId(jobClassId)
  }

  const handleNextStep = () => {
    if (currentStep === 1 && selectedJobClassId) {
      setCurrentStep(2)
    } else if (currentStep === 2 && characterName.trim() !== '') {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // In a real app, we would save the character data to backend
      router.push('/quest')
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
  const getJobClassIcon = (jobClass: JobClass) => {
    switch (jobClass.id) {
      case 'jobclass-marketing':
        return <BadgePercent className="h-8 w-8" />
      case 'jobclass-sales':
        return <LineChart className="h-8 w-8" />
      case 'jobclass-accounting':
        return <Receipt className="h-8 w-8" />
      default:
        return <Briefcase className="h-8 w-8" />
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold ai-gradient-text">
          สร้างตัวละครของคุณ
        </h1>
        <p className="text-muted-foreground">ผ่านระบบ AI (ทดสอบ)</p>
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
          <span>รูปตัวละคร</span>
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
          <h2 className="text-xl font-semibold mb-4">ตั้งชื่อตัวละครของคุณ</h2>

          <Card>
            <CardHeader>
              <CardTitle>ใส่ชื่อ</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="ใส่ชื่อ"
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
          <h2 className="text-xl font-semibold mb-4">เลือกรูปตัวละคร</h2>

          <Tabs
            defaultValue="upload"
            onValueChange={(v) => setPortrait(v as 'upload' | 'generate')}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="upload">อัปโหลดรูปภาพ</TabsTrigger>
              <TabsTrigger value="generate">AI สร้างรูปภาพ</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>อัปโหลดรูปตัวละครของคุณ</CardTitle>
                  <CardDescription>
                    รูปภาพของคุณจะถูกใช้เป็นแหล่งอ้างอิงสำหรับรูปตัวละคร
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
                    <span>อัปโหลดรูปภาพ</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    รูปภาพของคุณจะถูกใช้เพื่อสร้างรูปตัวละครที่แตกต่างกัน 6
                    แบบสำหรับแต่ละระดับความสำเร็จ
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>รูปตัวละครที่สร้างโดย AI</CardTitle>
                  <CardDescription>
                    ให้ AI ของเราสร้างรูปตัวละครให้คุณ
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="mb-4 w-32 h-32 flex items-center justify-center bg-secondary rounded-full overflow-hidden relative ai-gradient-border border-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 animate-pulse"></div>
                    <UserCircle2 className="h-20 w-20 text-muted-foreground relative z-10" />
                  </div>

                  <p className="text-center text-sm">
                    ระบบจะสร้างรูปตัวละครที่ไม่ซ้ำกัน 6
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
            <Button className="flex-1 ai-gradient-bg" onClick={handleNextStep}>
              สร้างตัวละคร
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
