'use client'

import { useState } from 'react'

import { Button } from '@src/components/ui/button'
import { Card } from '@src/components/ui/card'
import { Loader2 } from 'lucide-react'

export function AutoCheckoutDevTools() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  // แสดงเฉพาะใน development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleProcessAutoCheckout = async () => {
    setIsProcessing(true)
    setResult(null)

    try {
      const response = await fetch('/api/checkin/auto-checkout', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`สำเร็จ: ${data.message}`)
      } else {
        setResult(`ผิดพลาด: ${data.error}`)
      }
    } catch (error) {
      setResult('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckPending = async () => {
    setIsProcessing(true)
    setResult(null)

    try {
      const response = await fetch('/api/checkin/auto-checkout')
      const data = await response.json()

      if (response.ok) {
        setResult('ตรวจสอบ pending auto checkouts เรียบร้อย')
      } else {
        setResult(`ผิดพลาด: ${data.error}`)
      }
    } catch (error) {
      setResult('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="p-4 border-orange-300 bg-orange-50">
      <div className="space-y-3">
        <h3 className="font-semibold text-orange-900">
          🛠️ Auto Checkout Dev Tools
        </h3>

        <div className="space-y-2">
          <Button
            onClick={handleProcessAutoCheckout}
            disabled={isProcessing}
            size="sm"
            className="w-full"
            variant="outline">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังประมวลผล...
              </>
            ) : (
              'Run Auto Checkout Process'
            )}
          </Button>

          <Button
            onClick={handleCheckPending}
            disabled={isProcessing}
            size="sm"
            className="w-full"
            variant="outline">
            Check Pending Auto Checkouts
          </Button>
        </div>

        {result && (
          <div className="text-sm p-2 bg-white rounded border">{result}</div>
        )}

        <div className="text-xs text-orange-700">
          <p>⚠️ Development Mode Only</p>
          <p>Auto Checkout Rules:</p>
          <ul className="list-disc list-inside ml-2">
            <li>เลิกงาน + 2 ชั่วโมง</li>
            <li>ทำงาน 12 ชั่วโมง</li>
            <li>เที่ยงคืน (ถ้าไม่มีเวลาทำงาน)</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
