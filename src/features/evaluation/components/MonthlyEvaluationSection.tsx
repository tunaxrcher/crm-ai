'use client'

import { useState } from 'react'

import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@src/components/ui/dialog'
import { ScrollArea } from '@src/components/ui/scroll-area'
import {
  Calendar,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react'

import { useMonthlyEvaluations } from '../hooks/useMonthlyEvaluations'

interface MonthlyEvaluationSectionProps {
  characterId: number
}

interface MonthlyEvaluation {
  id: number
  month: number
  year: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  evaluation: string | null
  summary: string | null
  strengths: string | null
  weaknesses: string | null
  improvements: string | null
  isPassed: boolean | null
  totalSubmissions: number
  evaluatedAt: Date | null
  createdAt: Date
}

const MONTH_NAMES = [
  '',
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500'
    case 'processing':
      return 'bg-yellow-500'
    case 'failed':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />
    case 'processing':
      return <Clock className="h-4 w-4" />
    case 'failed':
      return <XCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const EvaluationCard = ({ evaluation }: { evaluation: MonthlyEvaluation }) => {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (date: Date | null) => {
    if (!date) return 'ไม่ระบุ'
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">
                  {MONTH_NAMES[evaluation.month]} {evaluation.year + 543}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {evaluation.isPassed !== null &&
                  (evaluation.isPassed ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ))}
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(evaluation.status)} text-white`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(evaluation.status)}
                    <span className="text-xs">
                      {evaluation.status === 'completed'
                        ? 'เสร็จแล้ว'
                        : evaluation.status === 'processing'
                          ? 'กำลังประเมิน'
                          : evaluation.status === 'failed'
                            ? 'ล้มเหลว'
                            : 'รอประเมิน'}
                    </span>
                  </div>
                </Badge>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-2">
              งานที่ส่ง: {evaluation.totalSubmissions} งาน
            </div>

            {evaluation.summary && (
              <div className="text-sm line-clamp-2">{evaluation.summary}</div>
            )}

            {evaluation.status === 'completed' &&
              evaluation.isPassed !== null && (
                <div className="mt-2 flex items-center gap-1">
                  {evaluation.isPassed ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        ผ่านมาตรฐาน
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 font-medium">
                        ไม่ผ่านมาตรฐาน
                      </span>
                    </>
                  )}
                </div>
              )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            ผลประเมินประจำเดือน {MONTH_NAMES[evaluation.month]}{' '}
            {evaluation.year + 543}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Status and Basic Info */}
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* <div>
                  <span className="font-medium">สถานะ:</span>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(evaluation.status)} text-white`}>
                      {evaluation.status === 'completed' ? 'เสร็จแล้ว' :
                       evaluation.status === 'processing' ? 'กำลังประเมิน' :
                       evaluation.status === 'failed' ? 'ล้มเหลว' : 'รอประเมิน'}
                    </Badge>
                  </div>
                </div> */}
                <div>
                  <span className="font-medium">งานที่ส่ง:</span>
                  <div className="mt-1 font-semibold">
                    {evaluation.totalSubmissions} งาน
                  </div>
                </div>
                <div>
                  <span className="font-medium">วันที่ประเมิน:</span>
                  <div className="mt-1">
                    {formatDate(evaluation.evaluatedAt)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">ผลการประเมิน:</span>
                  <div className="mt-1">
                    {evaluation.isPassed !== null ? (
                      evaluation.isPassed ? (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          ผ่านมาตรฐาน
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white">
                          <XCircle className="h-3 w-3 mr-1" />
                          ไม่ผ่านมาตรฐาน
                        </Badge>
                      )
                    ) : (
                      <Badge variant="secondary">ยังไม่ได้ประเมิน</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Content */}
            {evaluation.status === 'completed' && evaluation.evaluation && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="font-semibold mb-3 text-lg">
                    📋 รายงานการประเมิน
                  </h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed ">
                    {evaluation.summary}
                  </div>
                </div>

                {/* Detailed Sections */}
                {(evaluation.strengths ||
                  evaluation.weaknesses ||
                  evaluation.improvements) && (
                  <div className="grid gap-4">
                    {evaluation.strengths && (
                      <div className="border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />✅ จุดดี
                        </h4>
                        <div className="text-sm whitespace-pre-wrap">
                          {evaluation.strengths}
                        </div>
                      </div>
                    )}

                    {evaluation.weaknesses && (
                      <div className="border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                          <TrendingDown className="h-4 w-4" />
                          ⚠️ จุดบกพร่อง
                        </h4>
                        <div className="text-sm whitespace-pre-wrap">
                          {evaluation.weaknesses}
                        </div>
                      </div>
                    )}

                    {evaluation.improvements && (
                      <div className="border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          🎯 สิ่งที่ต้องแก้/ทำต่อไป
                        </h4>
                        <div className="text-sm whitespace-pre-wrap">
                          {evaluation.improvements}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {evaluation.status === 'failed' && (
              <div className="border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  เกิดข้อผิดพลาด
                </h4>
                <div className="text-sm">
                  ไม่สามารถประเมินผลได้ในเดือนนี้ กรุณาติดต่อผู้ดูแลระบบ
                </div>
              </div>
            )}

            {evaluation.status === 'pending' && (
              <div className="border rounded-lg p-4 text-center">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="text-sm">รอการประเมินผลประจำเดือน</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default function MonthlyEvaluationSection({
  characterId,
}: MonthlyEvaluationSectionProps) {
  const {
    data: evaluations,
    isLoading,
    error,
    refetch,
  } = useMonthlyEvaluations(characterId)

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            ผลประเมินรายเดือน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            ผลประเมินรายเดือน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">ไม่สามารถโหลดข้อมูลได้</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              ลองใหม่
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          ผลประเมินรายเดือน
        </CardTitle>
      </CardHeader>
      <CardContent>
        {evaluations && evaluations.length > 0 ? (
          <>
            {evaluations.length > 3 && (
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <span>ปัดซ้าย-ขวาเพื่อดูเดือนอื่นๆ</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 pb-4 min-w-max">
                {evaluations
                  .sort((a, b) => {
                    // เรียงจากใหม่ไปเก่า (year desc, month desc)
                    if (a.year !== b.year) return b.year - a.year
                    return b.month - a.month
                  })
                  .map((evaluation) => (
                    <div key={evaluation.id} className="flex-shrink-0 w-72">
                      <EvaluationCard evaluation={evaluation} />
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">ยังไม่มีผลประเมินรายเดือน</p>
            <p className="text-sm text-gray-500 mt-2">
              ระบบจะประเมินผลงานให้อัตโนมัติทุกต้นเดือน
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
