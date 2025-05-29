import { NextResponse } from 'next/server'

// import { getCurrentUserCharacter } from '@src/features/character/service/server'

// export async function GET() {
//   try {
//     // ดึงข้อมูลตัวละครของผู้ใช้ปัจจุบัน
//     const data = await getCurrentUserCharacter()

//     // ตรวจสอบว่ามีข้อมูล job class หรือไม่ ถ้าไม่มีให้เพิ่มข้อมูลเริ่มต้น
//     if (data && !data.jobClass) {
//       data.jobClass = {
//         id: 'novice', // ใช้ string id แทน null
//         name: 'Novice',
//         description: 'No job class assigned',
//         levels: [], // เพิ่ม levels array ตาม interface
//       }
//     }

//     return NextResponse.json(data)
//   } catch (error) {
//     console.error('Error fetching character:', error)
//     return NextResponse.json(
//       { error: 'Failed to fetch character data' },
//       { status: 500 }
//     )
//   }
// }
