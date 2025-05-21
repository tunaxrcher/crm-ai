import { PrismaClient } from '@prisma/client'
import { prisma } from '@src/lib/db'
import { Crypto } from '@src/lib/security'
import 'server-only'

type DepthOption = number | 'all'

// ประกาศ type utility ที่จะใช้แปลง type ของฟิลด์ที่ถูก encrypt
type Encryptable<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? string : T[P]
}

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  // ฟังก์ชันพื้นฐานที่ repositories ทุกตัวควรจะมี
  abstract findAll(options?: any): Promise<T[]>
  abstract findById(id: number): Promise<T | null>
  abstract create(data: any): Promise<T>
  abstract update(id: number, data: any): Promise<T>
  abstract delete(id: number): Promise<T>

  /**
   * แปลงข้อมูลโดย encrypt ฟิลด์ที่ระบุ
   * @param fieldsToEncrypt รายชื่อฟิลด์ที่ต้องการ encrypt
   * @param depth ความลึกที่ต้องการ encrypt (number | "all")
   * @param data ข้อมูลที่ต้องการแปลง
   * @returns ข้อมูลที่ถูก encrypt ตามฟิลด์ที่ระบุ
   */
  protected transformWithEncrypted<D>(
    fieldsToEncrypt: string[],
    depth: DepthOption = 'all',
    data: D
  ): D {
    if (!data) return data

    // กรณีเป็น array ให้แปลงทีละรายการ
    if (Array.isArray(data)) {
      return data.map((item) =>
        this.transformWithEncrypted(fieldsToEncrypt, depth, item)
      ) as unknown as D
    }

    // กรณีไม่ใช่ object ให้คืนค่าเดิม
    if (typeof data !== 'object') return data

    const result = { ...data } as any

    // ทำการ encrypt ฟิลด์ที่ระบุ
    for (const field of fieldsToEncrypt) {
      if (
        field in result &&
        result[field] !== null &&
        result[field] !== undefined
      ) {
        result[field] = Crypto.encrypt(result[field])
      }
    }

    // ถ้า depth เป็น 0 ไม่ต้องไปต่อ
    if (depth === 0) return result

    // ทำการ process nested objects ตามความลึกที่กำหนด
    const nextDepth = depth === 'all' ? 'all' : depth - 1

    // ถ้า depth > 0 หรือเป็น "all" ให้ทำ recursion กับ nested objects
    if (nextDepth === 'all' || nextDepth > 0) {
      Object.keys(result).forEach((key) => {
        const value = result[key]

        // ถ้าเป็น object ที่ไม่ใช่ null ให้ทำ recursion
        if (value !== null && typeof value === 'object') {
          result[key] = this.transformWithEncrypted(
            fieldsToEncrypt,
            nextDepth,
            value
          )
        }
      })
    }

    return result
  }

  /**
   * Helper method สำหรับเรียกใช้ transformWithEncrypted กับผลลัพธ์จาก query
   * @param result ผลลัพธ์จาก query
   * @param fieldsToEncrypt รายชื่อฟิลด์ที่ต้องการ encrypt
   * @param depth ความลึกที่ต้องการ encrypt
   * @returns ผลลัพธ์ที่ถูก encrypt ตามฟิลด์ที่ระบุ
   */
  public encryptResult<R, K extends string>(
    result: R,
    fieldsToEncrypt: K[],
    depth: DepthOption = 'all'
  ): R extends any[]
    ? Array<
        R[number] extends object
          ? Encryptable<R[number], Extract<keyof R[number], K>>
          : R[number]
      >
    : R extends object
      ? Encryptable<R, Extract<keyof R, K>>
      : R {
    return this.transformWithEncrypted(fieldsToEncrypt, depth, result) as any
  }
}
