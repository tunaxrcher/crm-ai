'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { type ClassValue, clsx } from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import type { ConfigData } from '../types'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface BuilderHeaderProps {
  configData: ConfigData
  iconPreview: string | null
  isSaving: boolean
  handleManualSave: () => void
  isEditMode?: boolean
  pageTitle?: string
  isDraft?: boolean
}

export default function BuilderHeader({
  configData,
  iconPreview,
  isSaving,
  handleManualSave,
  isEditMode = false,
  pageTitle = 'AI ใหม่',
  isDraft = true,
}: BuilderHeaderProps) {
  const router = useRouter()

  // กำหนด status text และ button text ตาม draft status
  const getStatusText = () => {
    if (isSaving) return 'กำลังบันทึก...'
    return isDraft ? 'ร่าง' : 'พร้อมใช้งาน'
  }

  const getButtonText = () => {
    if (isDraft) {
      if (isEditMode) {
        return 'สร้าง'
      } else {
        return isEditMode ? 'อัปเดต' : 'สร้าง'
      }
    } else {
      return 'อัปเดต'
    }
  }

  const getStatusColor = () => {
    if (isSaving) return 'bg-yellow-500 animate-pulse'
    return isDraft ? 'bg-gray-400' : 'bg-green-500'
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-[#1E1E1E]">
      <div className="flex items-center gap-3">
        <button
          className="p-1 rounded-full hover:bg-gray-700"
          onClick={() => router.push('/ai')}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {iconPreview ? (
              <Image
                src={iconPreview}
                alt="Assistant Icon"
                className="w-full h-full object-cover"
                width={32}
                height={32}
              />
            ) : (
              <span className="text-xs">AI</span>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold">
              {configData.name || pageTitle}
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <span
                className={cn(
                  'w-2 h-2 rounded-full mr-1',
                  getStatusColor()
                )}></span>
              <span>{getStatusText()}</span>
            </div>
          </div>
        </div>
      </div>
      <button
        className={`btn btn-primary animate-gradient-x disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-opacity-70`}
        onClick={handleManualSave}
        disabled={!configData.name || !configData.instructions}>
        {getButtonText()}
      </button>
    </header>
  )
}
