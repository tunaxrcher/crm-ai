// src/app/api/stories/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { storyRepository } from '@src/features/feed/repository'
import { getServerSession } from '@src/lib/auth'
import { s3UploadService } from '@src/lib/service/s3UploadService'
import { spawn } from 'child_process'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

/**
 * สร้าง thumbnail จากวิดีโอด้วย ffmpeg
 *
 * @param videoPath Path ของไฟล์วิดีโอ
 * @returns Promise<string> path ของไฟล์ thumbnail
 */
async function generateThumbnail(videoPath: string): Promise<string> {
  // สร้างชื่อไฟล์ที่ไม่ซ้ำกันสำหรับ thumbnail
  const thumbnailFilename = `thumbnail-${uuidv4()}.jpg`

  // สร้างโฟลเดอร์สำหรับเก็บ thumbnail ถ้ายังไม่มี
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')
  await mkdir(uploadDir, { recursive: true })

  const thumbnailPath = path.join(uploadDir, thumbnailFilename)

  return new Promise((resolve, reject) => {
    // ใช้ ffmpeg เพื่อสร้าง thumbnail จากวิดีโอ
    // ffmpeg -i video.mp4 -ss 00:00:01 -vframes 1 thumbnail.jpg
    const ffmpeg = spawn('ffmpeg', [
      '-i',
      videoPath,
      '-ss',
      '00:00:01', // ใช้เฟรมที่วินาทีที่ 1
      '-vframes',
      '1',
      '-vf',
      'scale=640:-1', // ปรับขนาดให้กว้าง 640px รักษาสัดส่วน
      thumbnailPath,
    ])

    ffmpeg.stderr.on('data', (data) => {
      console.log(`ffmpeg stderr: ${data}`)
    })

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        // สำเร็จ - ส่งคืน path ของ thumbnail
        resolve(`/uploads/thumbnails/${thumbnailFilename}`)
      } else {
        reject(new Error(`ffmpeg process exited with code ${code}`))
      }
    })
  })
}

/**
 * API endpoint สำหรับอัปโหลด story ที่มีไฟล์ media
 */
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบการเข้าสู่ระบบของผู้ใช้
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    // ดึงข้อมูล FormData
    const formData = await request.formData()
    const type = formData.get('type') as string
    const expiresInHours =
      parseInt(formData.get('expiresInHours') as string) || 24

    // คำนวณเวลาหมดอายุ
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expiresInHours)

    let mediaUrl = null
    let thumbnailUrl = null

    // จัดการไฟล์ media
    const mediaFile = formData.get('media') as File
    const thumbnailFile = formData.get('thumbnail') as File

    if (mediaFile) {
      // อัปโหลดไฟล์ media ไป S3
      const uploadResult = await s3UploadService.uploadFile(mediaFile)

      if (!uploadResult.success) {
        return NextResponse.json(
          { error: 'Failed to upload media file' },
          { status: 500 }
        )
      }

      mediaUrl = uploadResult.url

      // ถ้าเป็นวิดีโอและไม่มี thumbnail ที่ส่งมา ให้สร้าง thumbnail
      if (type === 'video' && !thumbnailFile) {
        try {
          // อัปโหลดไฟล์วิดีโอไปยังโฟลเดอร์ชั่วคราว
          const tempDir = path.join(process.cwd(), 'tmp')
          await mkdir(tempDir, { recursive: true })

          const videoBuffer = Buffer.from(await mediaFile.arrayBuffer())
          const tempVideoPath = path.join(tempDir, `video-${uuidv4()}.mp4`)

          await writeFile(tempVideoPath, videoBuffer)

          // สร้าง thumbnail จากไฟล์วิดีโอ
          const localThumbnailPath = await generateThumbnail(tempVideoPath)

          // อัปโหลด thumbnail ไป S3
          const thumbnailFullPath = path.join(
            process.cwd(),
            'public',
            localThumbnailPath
          )
          const thumbnailBlob = await fetch(`file://${thumbnailFullPath}`).then(
            (res) => res.blob()
          )

          const thumbnailUploadResult = await s3UploadService.uploadFile(
            new File([thumbnailBlob], `thumbnail-${uuidv4()}.jpg`, {
              type: 'image/jpeg',
            })
          )

          if (thumbnailUploadResult.success) {
            thumbnailUrl = thumbnailUploadResult.url
          }
        } catch (thumbnailError) {
          console.error('Error generating thumbnail:', thumbnailError)
          // ไม่ให้การสร้าง thumbnail ล้มเหลวส่งผลต่อการ upload story
        }
      }
    }

    // ถ้ามี thumbnail ที่ส่งมา ให้ใช้ thumbnail นั้น
    if (thumbnailFile) {
      const thumbnailUploadResult =
        await s3UploadService.uploadFile(thumbnailFile)

      if (thumbnailUploadResult.success) {
        thumbnailUrl = thumbnailUploadResult.url
      }
    }

    // สร้าง story
    const story = await storyRepository.create({
      content: (formData.get('content') as string) || null,
      type: type as any,
      mediaUrl,
      thumbnailUrl, // เพิ่ม thumbnailUrl
      text: (formData.get('text') as string) || null,
      expiresAt,
      user: {
        connect: { id: userId },
      },
    })

    return NextResponse.json({
      success: true,
      story,
      thumbnailUrl,
    })
  } catch (error) {
    console.error('Error uploading story:', error)
    return NextResponse.json(
      { error: 'Failed to upload story' },
      { status: 500 }
    )
  }
}
