'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { Markdown } from '@src/components/markdown'
// หรือ path ที่เหมาะสมของคุณ
import { ChatRequestOptions, UIMessage } from 'ai'
import { type ClassValue, clsx } from 'clsx'
import { Mic, Plus, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const getTextFromDataUrl = (dataUrl: string) => {
  const base64 = dataUrl.split(',')[1]
  return window.atob(base64)
}

interface PreviewPanelProps {
  messages: UIMessage[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent, options: ChatRequestOptions) => void
  isLoading: boolean
  onFileSelect?: (files: FileList) => void
}

export default function PreviewPanel({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onFileSelect,
}: PreviewPanelProps) {
  const [files, setFiles] = useState<FileList | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter(
        (file) =>
          file.type.startsWith('image/') ||
          file.type.startsWith('text/') ||
          file.type === 'application/pdf' ||
          file.type.includes('word') ||
          file.type.includes('spreadsheet') ||
          file.type === 'text/csv'
      )

      if (validFiles.length === selectedFiles.length) {
        const dataTransfer = new DataTransfer()
        validFiles.forEach((file) => dataTransfer.items.add(file))
        setFiles(dataTransfer.files)
        if (onFileSelect) {
          onFileSelect(dataTransfer.files)
        }
      } else {
        toast.error('ไฟล์ที่รองรับ: รูปภาพ, เอกสาร, และไฟล์ข้อความ')
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    if (files) {
      const newFiles = Array.from(files)
      newFiles.splice(index, 1)
      const dataTransfer = new DataTransfer()
      newFiles.forEach((file) => dataTransfer.items.add(file))
      setFiles(dataTransfer.files.length > 0 ? dataTransfer.files : null)
      if (onFileSelect && dataTransfer.files.length > 0) {
        onFileSelect(dataTransfer.files)
      }
    }
  }

  const handleSubmitWithFiles = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      const options = files ? { experimental_attachments: files } : {}
      handleSubmit(e, options)
      setFiles(null)
    }
  }

  // Check if user is near bottom for auto-scroll
  const [isNearBottom, setIsNearBottom] = useState(true)

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setIsNearBottom(isNearBottom)
    }
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom()
    }
  }, [messages, isNearBottom])

  return (
    <div className="hidden md:flex md:w-1/2 flex-col relative bg-[#2F2F2F]">
      {messages.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center font-medium pointer-events-none">
          ดูตัวอย่าง
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    'max-w-[80%] p-3 rounded-lg',
                    message.role === 'user'
                      ? 'bg-[#323232] ml-auto'
                      : 'bg-[#2f2f2f] mr-auto'
                  )}>
                  <div className="markdown-content">
                    <Markdown>{message.content}</Markdown>
                  </div>
                  {message.experimental_attachments?.map((attachment) =>
                    attachment.contentType?.startsWith('image') ? (
                      <img
                        className="rounded-md w-40 mb-3"
                        key={attachment.name}
                        src={attachment.url}
                        alt={attachment.name}
                      />
                    ) : attachment.contentType?.startsWith('text') ? (
                      <div
                        key={attachment.name}
                        className="text-xs w-40 h-24 overflow-hidden text-zinc-400 border p-2 rounded-md dark:bg-zinc-800 dark:border-zinc-700 mb-3">
                        {getTextFromDataUrl(attachment.url)}
                      </div>
                    ) : null
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="bg-[#2f2f2f] max-w-[80%] p-3 rounded-lg mr-auto">
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
            <form onSubmit={handleSubmitWithFiles} className="relative">
              {/* File preview */}
              {files && files.length > 0 && (
                <div className="flex flex-row gap-2 mb-2 overflow-x-auto">
                  {Array.from(files).map((file, index) => (
                    <div key={file.name} className="relative group">
                      {file.type.startsWith('image') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="rounded-md w-16 h-16 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-[#1E1E1E] border border-gray-600 rounded-md flex items-center justify-center">
                          <div className="text-center">
                            <div>📄</div>
                            <div className="text-[8px] truncate max-w-[60px] px-1">
                              {file.name}
                            </div>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-[#1E1E1E] rounded-2xl p-2 flex flex-col">
                <textarea
                  placeholder="ถามอะไรก็ได้"
                  className="w-full bg-transparent rounded-lg py-2 px-4 focus:outline-none resize-none overflow-hidden min-h-[40px] max-h-[120px]"
                  value={input}
                  onChange={handleInputChange}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitWithFiles(e)
                    }
                  }}
                />
                <div className="flex justify-between items-center px-2 mt-1">
                  <button
                    type="button"
                    className="p-1.5 rounded-full border border-gray-700 hover:bg-gray-700"
                    onClick={handleUploadClick}>
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
                        className={
                          !input.trim() || isLoading ? 'text-gray-500' : ''
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        multiple
        accept="image/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
