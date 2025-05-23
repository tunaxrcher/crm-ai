'use client'

import type React from 'react'

import Image from 'next/image'

import { Maximize2, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

import type { ConfigData } from '../types'

interface ConfigureTabProps {
  configData: ConfigData
  setConfigData: React.Dispatch<React.SetStateAction<ConfigData>>
  handleRemoveItem: (index: number) => void
  iconPreview: string | null
  setIconPreview: React.Dispatch<React.SetStateAction<string | null>>
}

export default function ConfigureTab({
  configData,
  setConfigData,
  handleRemoveItem,
  iconPreview,
  setIconPreview,
}: ConfigureTabProps) {
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setIconPreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)

      // Update config with icon file
      setConfigData((prev) => ({
        ...prev,
        iconFile: file,
      }))
    }
  }

  const handleRemoveIcon = () => {
    setIconPreview(null)
    setConfigData((prev) => ({
      ...prev,
      iconFile: null,
      iconUrl: null, // Clear existing icon URL if any
    }))
  }

  const handleKnowledgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newItems = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setConfigData((prev) => ({
      ...prev,
      knowledgeItems: [...prev.knowledgeItems, ...newItems],
    }))
    e.target.value = ''
  }

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      {/* Profile Image Upload */}
      <div>
        <input
          type="file"
          id="profile-image"
          accept="image/*"
          className="hidden"
          onChange={handleIconUpload}
        />

        <div className="relative inline-block mx-auto left-1/2 transform -translate-x-1/2">
          <label
            htmlFor="profile-image"
            className="w-20 h-20 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors overflow-hidden">
            {iconPreview ? (
              <Image
                src={iconPreview}
                alt="Assistant Icon"
                className="w-full h-full object-cover"
                width={80}
                height={80}
              />
            ) : (
              <Plus size={24} className="text-gray-500" />
            )}
          </label>

          {iconPreview && (
            <button
              onClick={handleRemoveIcon}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors shadow-md">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium mb-2">
          ชื่อ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="ตั้งชื่อ AI ของคุณ (ไม่มีผลกับการสนทนา)"
          value={configData.name}
          onChange={(e) =>
            setConfigData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-600"
        />
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium mb-2">คำอธิบาย</label>
        <input
          type="text"
          placeholder="เพิ่มข้อความสั้นอธิบายการทำงานของ AI"
          value={configData.description}
          onChange={(e) =>
            setConfigData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-600"
        />
      </div>

      {/* Instructions Field */}
      <div>
        <label className="block text-sm font-medium mb-2">
          คำสั่ง <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            placeholder="AI นี้ทำอะไร มีพฤติกรรมอย่างไร และไม่ควรทำอะไร"
            value={configData.instructions}
            onChange={(e) =>
              setConfigData((prev) => ({
                ...prev,
                instructions: e.target.value,
              }))
            }
            className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-md py-2 px-3 min-h-[120px] focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
          <button
            type="button"
            className="absolute bottom-2 right-2 p-1 text-gray-400 hover:text-gray-300"
            onClick={() => toast('Expand feature coming soon')}>
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Knowledge Upload Section */}
      <div>
        <label className="block text-sm font-medium mb-2">ความรู้</label>
        <p className="text-xs text-gray-400 mb-3">
          หากคุณอัปโหลดไฟล์ไว้ที่ความรู้ บทสนทนากับ GPT
          ของคุณก็อาจมีเนื้อหาในไฟล์อยู่ด้วย
          โดยจะสามารถดาวน์โหลดไฟล์ได้เมื่อเปิดการใช้งานเครื่องมืออัปโหลดไฟล์
        </p>

        {/* File Type & Limitations Info - Collapsible */}
        <details className="mb-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
          <summary className="px-4 py-2 cursor-pointer hover:bg-[#2A2A2A] transition-colors text-xs text-gray-300 font-medium">
            ℹ️ ประเภทไฟล์ที่รองรับและข้อจำกัด
          </summary>
          <div className="px-4 pb-3 pt-2 text-xs text-gray-400 space-y-3">
            {/* Supported File Types */}
            <div>
              <h6 className="font-medium text-gray-300 mb-2">
                ✅ ประเภทไฟล์ที่รองรับ
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-300">📝 ข้อความ:</span>
                  <span className="text-gray-500"> .txt, .md, .html, .tex</span>
                </div>
                <div>
                  <span className="text-gray-300">📄 เอกสาร:</span>
                  <span className="text-gray-500"> .pdf, .doc, .docx</span>
                </div>
                <div>
                  <span className="text-gray-300">📊 สเปรดชีต:</span>
                  <span className="text-gray-500"> .csv</span>
                </div>
                <div>
                  <span className="text-gray-300">📈 การนำเสนอ:</span>
                  <span className="text-gray-500"> .pptx</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-300">* ฐานข้อมูล:</span>
                  <span className="text-gray-500">
                    {' '}
                    .sql, xlsx(excel) แต่ต้องแปลงเป็น .csv ก่อน
                  </span>
                </div>
              </div>
            </div>

            {/* Limitations */}
            <div>
              <h6 className="font-medium text-gray-300 mb-1">
                📏 ข้อจำกัดด้านขนาด
              </h6>
              <ul className="space-y-1 text-gray-500">
                <li>
                  • ขนาดไฟล์สูงสุด:{' '}
                  <span className="text-orange-400">512 MB</span> ต่อไฟล์
                </li>
                <li>
                  • จำนวนไฟล์สูงสุด:{' '}
                  <span className="text-orange-400">10,000</span> ไฟล์
                </li>
                <li>
                  • จำนวนโทเคนสูงสุด:{' '}
                  <span className="text-orange-400">5,000,000</span> โทเคน (≈20
                  ล้านคำ)
                </li>
              </ul>
            </div>

            {/* Warnings */}
            <div>
              <h6 className="font-medium text-gray-300 mb-1">⚠️ ข้อควรระวัง</h6>
              <ul className="space-y-1 text-gray-500">
                <li>
                  • ไฟล์ที่มีเนื้อหาเป็นภาพ (PDF สแกน)
                  อาจไม่สามารถดึงข้อความได้ถูกต้อง
                </li>
              </ul>
            </div>
          </div>
        </details>

        <div className="flex flex-col gap-3">
          {/* File List - Card Style */}
          {configData.knowledgeItems.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {configData.knowledgeItems.map((item, idx) => {
                const fileExt =
                  item.file.name.split('.').pop()?.toLowerCase() || ''
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
                  fileExt
                )
                const fileSize = item.file.size
                const sizeInKB = (fileSize / 1024).toFixed(1)
                const sizeInMB = (fileSize / (1024 * 1024)).toFixed(1)
                const displaySize =
                  fileSize > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`

                // Icon ตามประเภทไฟล์
                const getFileIcon = () => {
                  if (isImage) return '🖼️'
                  if (['pdf'].includes(fileExt)) return '📄'
                  if (['doc', 'docx'].includes(fileExt)) return '📝'
                  if (['xls', 'xlsx'].includes(fileExt)) return '📊'
                  if (['ppt', 'pptx'].includes(fileExt)) return '📈'
                  if (['txt', 'md'].includes(fileExt)) return '📋'
                  if (['zip', 'rar', '7z'].includes(fileExt)) return '🗜️'
                  return '📎'
                }

                return (
                  <div
                    key={idx}
                    className="group flex items-center bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-3 hover:border-gray-600 transition-colors">
                    {/* File Preview/Icon */}
                    <div className="shrink-0 mr-3">
                      {isImage ? (
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-[#2A2A2A]">
                          <Image
                            src={item.preview}
                            alt={item.file.name}
                            className="object-cover w-full h-full"
                            width={48}
                            height={48}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-[#2A2A2A] rounded-md">
                          <span className="text-2xl">{getFileIcon()}</span>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-200 truncate">
                        {item.file.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fileExt.toUpperCase()} • {displaySize}
                        {item.fileId && ' • อัปโหลดแล้ว ✓'}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="ml-3 p-1.5 rounded-lg bg-transparent hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <X size={18} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-2">
            <input
              id="knowledge-files"
              type="file"
              multiple
              accept="*/*"
              className="hidden"
              onChange={handleKnowledgeUpload}
            />
            <label
              htmlFor="knowledge-files"
              className="inline-flex items-center px-4 py-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-md text-sm hover:bg-[#2A2A2A] cursor-pointer transition-colors">
              <Plus size={18} className="mr-2" />
              {configData.knowledgeItems.length > 0
                ? 'เพิ่มไฟล์เพิ่มเติม'
                : 'อัปโหลดไฟล์'}
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
