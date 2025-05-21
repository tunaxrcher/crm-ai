import Hashids from 'hashids'
import jwt from 'jsonwebtoken'
import 'server-only'

const SECRET_KEY = process.env.SECRET_KEY as string
const hashids = new Hashids(SECRET_KEY)

export class Crypto {
  public static encrypt(value: string | number): string {
    return hashids.encodeHex(value.toString())
  }

  public static decrypt(encryptedValue: string): string {
    return hashids.decodeHex(encryptedValue)
  }
}

type DepthOption = number | 'all'

// ประกาศ type utility ที่จะใช้แปลง type ของฟิลด์ที่ถูก encrypt
type Encryptable<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? string : T[P]
}

/**
 * แปลงข้อมูลโดย encrypt ฟิลด์ที่ระบุ
 * @param fieldsToEncrypt รายชื่อฟิลด์ที่ต้องการ encrypt
 * @param depth ความลึกที่ต้องการ encrypt (number | "all")
 * @param data ข้อมูลที่ต้องการแปลง
 * @returns ข้อมูลที่ถูก encrypt ตามฟิลด์ที่ระบุ
 */
function transformWithEncrypted<D>(
  fieldsToEncrypt: string[],
  depth: DepthOption = 'all',
  data: D
): D {
  if (!data) return data

  // กรณีเป็น array ให้แปลงทีละรายการ
  if (Array.isArray(data)) {
    return data.map((item) =>
      transformWithEncrypted(fieldsToEncrypt, depth, item)
    ) as unknown as D
  }

  // กรณีไม่ใช่ object หรือเป็น Date ให้คืนค่าเดิม
  if (typeof data !== 'object' || data instanceof Date) return data

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

      // ถ้าเป็น object ที่ไม่ใช่ null และไม่ใช่ Date ให้ทำ recursion
      if (
        value !== null &&
        typeof value === 'object' &&
        !(value instanceof Date)
      ) {
        result[key] = transformWithEncrypted(fieldsToEncrypt, nextDepth, value)
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
export function encryptResult<R, K extends string>(
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
  return transformWithEncrypted(fieldsToEncrypt, depth, result) as any
}

interface JwtConfig {
  expiresIn?: any // e.g., '1h', '7d', 60 * 60 (seconds)
  algorithm?: jwt.Algorithm // e.g., 'HS256', 'RS256'
}

export function encodeJwt(
  payload: any,
  config: JwtConfig = { algorithm: 'HS256', expiresIn: '1h' }
): string {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: config.expiresIn,
    algorithm: config.algorithm,
  })
}

export function decodeJwt<T = any>(
  token: string,
  config: JwtConfig = { algorithm: 'HS256' }
): T {
  const { algorithm = 'HS256' } = config
  return jwt.verify(token, SECRET_KEY, {
    algorithms: [algorithm],
  }) as T
}
