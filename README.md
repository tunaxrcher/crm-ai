🤖 AI CRM - Web Application  
https://app.evxspst.com/

AI CRM เป็นเว็บแอปพลิเคชันระบบจัดการลูกค้าสัมพันธ์ (CRM) รูปแบบใหม่ที่ผสานการทำงานร่วมกับ AI เพื่อเพิ่มประสิทธิภาพในการติดตาม, ประเมิน, และบริหารงานลูกค้า พัฒนาด้วย **Next.js 15**, **Prisma**, และเชื่อมต่อ OpenAI API สำหรับการประมวลผลภาษาอัจฉริยะ

📌 คุณสมบัติของเว็บแอปพลิเคชัน  
📁 จัดการข้อมูลลูกค้าแบบมีโครงสร้าง พร้อมระบบแท็กและจัดกลุ่ม  
🧠 ผู้ช่วย AI วิเคราะห์และแนะนำวิธีติดต่อลูกค้าให้มีประสิทธิภาพ  
📆 ระบบเควส (Quest) และสถิติ เพื่อกระตุ้นการติดตามงานแบบเกม RPG  
📈 สร้างฟีดกิจกรรมอัตโนมัติจากการกระทำ เช่น เพิ่มลูกค้า / ปิดเคส  
🔍 ระบบค้นหาแบบ natural language ช่วยให้เข้าถึงข้อมูลได้ไว  
🛠 ระบบจัดการตัวละครพนักงาน + การอัปเกรดสเตตัสตามผลงาน  
🎯 การวิเคราะห์ XP, Level, และ Ranking แบบเกมเพื่อสร้างแรงจูงใจ

🏗 เทคโนโลยีที่ใช้  
Next.js 15 (App Router) - สำหรับพัฒนา Frontend & Backend  
TypeScript + TailwindCSS - เพื่อ UI ที่มีคุณภาพสูงและ maintain ง่าย  
Prisma ORM + MySQL/PostgreSQL - ใช้จัดการฐานข้อมูล  
OpenAI API (Assistants / GPT-4o) - สำหรับประมวลผลภาษาธรรมชาติ  
Vercel AI SDK - สำหรับ streaming การโต้ตอบกับ AI อย่างเป็นธรรมชาติ  
Zustand - จัดการ state ฝั่ง client  
Radix UI / ShadCN - ใช้สร้าง UI components แบบ modern

🔧 การติดตั้งและใช้งาน  
1️⃣ การติดตั้งระบบ

```bash
# Clone โปรเจกต์
git clone https://github.com/tunaxrcher/ai-crm.git
cd ai-crm

# ติดตั้ง dependencies
pnpm install

# สร้างไฟล์ .env สำหรับการตั้งค่า
cp .env.example .env

# สร้างฐานข้อมูล + รัน Prisma
npx prisma generate
npx prisma migrate dev --name init

# รันเซิร์ฟเวอร์แบบ dev
pnpm dev
```
