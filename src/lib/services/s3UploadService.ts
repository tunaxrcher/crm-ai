// src/lib/services/s3UploadService.ts
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export interface UploadResponse {
  success: boolean
  url: string
  key: string
}

class S3UploadService {
  private s3Client: S3Client

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: process.env.DO_SPACES_REGION,
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!,
      },
      forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    })
  }

  async uploadFile(
    file: File,
    folder: string = 'quest-submissions'
  ): Promise<UploadResponse> {
    try {
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`
      const bucketName = process.env.DO_SPACES_BUCKET!

      const buffer = Buffer.from(await file.arrayBuffer())

      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read' as const,
      }

      const command = new PutObjectCommand(uploadParams)
      await this.s3Client.send(command)

      const url = `https://${bucketName}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${fileName}`

      return {
        success: true,
        url,
        key: fileName,
      }
    } catch (error) {
      console.error('S3 Upload Error:', error)
      throw new Error('Failed to upload file to S3')
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    folder: string = 'quest-submissions'
  ): Promise<UploadResponse> {
    try {
      const key = `${folder}/${Date.now()}-${fileName}`
      const bucketName = process.env.DO_SPACES_BUCKET!

      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read' as const,
      }

      const command = new PutObjectCommand(uploadParams)
      await this.s3Client.send(command)

      const url = `https://${bucketName}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${key}`

      return {
        success: true,
        url,
        key,
      }
    } catch (error) {
      console.error('S3 Upload Error:', error)
      throw new Error('Failed to upload buffer to S3')
    }
  }
}

export const s3UploadService = new S3UploadService()
