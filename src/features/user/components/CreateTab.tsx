'use client'

import type React from 'react'
import { useEffect, useRef } from 'react'

import { useChat } from '@ai-sdk/react'
import { type ClassValue, clsx } from 'clsx'
import { Mic, Plus, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

import type { ConfigData } from '../types'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CreateTabProps {
  configData: ConfigData
  setConfigData: React.Dispatch<React.SetStateAction<ConfigData>>
}

export default function CreateTab({
  configData,
  setConfigData,
}: CreateTabProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/ai-builder/chat',
      initialMessages: [
        {
          id: '1',
          role: 'assistant',
          content:
            'Hi! I\'ll help you build a new GPT. You can say something like, "make a creative who helps generate visuals for new products" or "make a software engineer who helps format my code."',
        },
        {
          id: '2',
          role: 'assistant',
          content: 'What would you like to make?',
        },
      ],
      onFinish: (message) => {
        // Analyze message and sync to config
        analyzeAndSyncToConfig(message.content)
      },
    })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Analyze AI response and update config
  const analyzeAndSyncToConfig = async (content: string) => {
    try {
      const response = await fetch('/api/ai-builder/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, currentConfig: configData }),
      })

      if (response.ok) {
        const analysisResult = await response.json()

        setConfigData((prev) => ({
          ...prev,
          ...(analysisResult.name && { name: analysisResult.name }),
          ...(analysisResult.description && {
            description: analysisResult.description,
          }),
          ...(analysisResult.instructions && {
            instructions: analysisResult.instructions,
          }),
        }))
      }
    } catch (error) {
      console.error('Error analyzing content:', error)
    }
  }

  const handleSubmitOverride = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    handleSubmit(e)
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="text-center text-white space-y-3 px-12 py-12 bg-[#121212] border border-gray-700 rounded-2xl shadow-xl max-w-md">
          <div className="text-lg font-semibold">กำลังอยู่ระหว่างการพัฒนา</div>
          <p className="text-sm text-gray-300">
            กรุณาตั้งค่าที่แทป{' '}
            <span className="font-semibold text-white">“กำหนดค่าเอง”</span>{' '}
            ก่อนเริ่มต้นใช้งาน
          </p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'max-w-[80%] p-3 rounded-lg',
                message.role === 'user'
                  ? 'bg-blue-600 ml-auto'
                  : 'bg-[#1E1E1E] mr-auto'
              )}>
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="bg-[#1E1E1E] max-w-[80%] p-3 rounded-lg mr-auto">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="px-4 py-6">
        <form
          onSubmit={handleSubmitOverride}
          className="bg-[#1E1E1E] rounded-2xl p-2 flex flex-col">
          <textarea
            ref={textareaRef}
            placeholder="ถามอะไรก็ได้"
            className="w-full bg-transparent rounded-lg py-2 px-4 focus:outline-none resize-none overflow-hidden min-h-[40px] max-h-[120px]"
            value={input}
            onChange={handleInputChange}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmitOverride(e)
              }
            }}
          />
          <div className="flex justify-between items-center px-2 mt-1">
            <button
              type="button"
              className="p-1.5 rounded-full border border-gray-700 hover:bg-gray-700"
              onClick={() => toast.error('File upload in development')}>
              <Plus size={18} />
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className="p-1.5 rounded-full border border-gray-700 hover:bg-gray-700"
                onClick={() => toast.error('Voice input in development')}>
                <Mic size={18} />
              </button>
              <button
                type="submit"
                className="p-1.5 rounded-full border border-gray-700 hover:bg-gray-700"
                disabled={!input.trim() || isLoading}>
                <Send
                  size={18}
                  className={!input.trim() || isLoading ? 'text-gray-500' : ''}
                />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
