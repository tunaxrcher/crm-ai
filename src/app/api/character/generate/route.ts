import { NextRequest, NextResponse } from 'next/server'

import { characterService } from '@src/features/character/services/server'
import { s3UploadService } from '@src/lib/services/s3UploadService'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] Generate Character`)

  const formData = await request.formData()
  const jobClassId = parseInt(formData.get('jobClassId') as string)
  const name = formData.get('name') as string
  const portraitType = formData.get('portraitType') as 'upload' | 'generate'
  const file = formData.get('file') as File | null

  let faceImageUrl: string | undefined

  // ถ้ามีการ upload file
  if (file && portraitType === 'upload') {
    try {
      // อัพโหลดไปยัง S3
      const uploadResult = await s3UploadService.uploadFile(
        file,
        'character-portraits'
      )
      faceImageUrl = uploadResult.url
    } catch (error) {
      console.error('Failed to upload face image:', error)
      throw new Error('Failed to upload image')
    }
  }

  const result = await characterService.generateCharacterPortraits(
    jobClassId,
    name,
    portraitType,
    faceImageUrl
  )

  return NextResponse.json(result)
})
