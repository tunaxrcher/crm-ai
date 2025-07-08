# ขั้นตอนการ Debug ระบบแจ้งเตือน

## สถานะปัจจุบัน
ได้เพิ่ม debug logs ไว้ทั้งใน frontend และ backend แล้ว

## ขั้นตอนการทดสอบ

### 1. เตรียมความพร้อม
- ✅ Server ทำงานที่ `http://localhost:3002`
- ✅ Prisma Studio ทำงานที่ `http://localhost:5555`

### 2. ทดสอบในเบราว์เซอร์

#### A. เปิด Developer Tools
1. เข้า `http://localhost:3002`
2. กด F12 เพื่อเปิด DevTools
3. ไปที่แท็บ **Console**
4. ไปที่แท็บ **Network** ด้วย

#### B. ตรวจสอบ NotificationSheet
1. มองหากระดิ่งแจ้งเตือน (🔔) ที่มุมบนขวา
2. คลิกที่กระดิ่ง
3. ดู Console logs ที่ขึ้นต้นด้วย `🔔 NotificationSheet Debug:`

**คาดหวัง:**
```javascript
🔔 NotificationSheet Debug: {
  isLoading: false,
  notificationData: {...},
  unreadCountData: {...},
  error: null,
  unreadError: null,
  notifications: 0,
  unreadCount: 0
}
```

### 3. ทดสอบการสร้างแจ้งเตือน

#### A. ทดสอบ Like Notification
1. **ใช้ User A:**
   - Login เข้าสู่ระบบ
   - ดูฟีดที่มีอยู่

2. **ใช้ User B (บัญชีอื่น):**
   - เปิด browser ใหม่ หรือใช้ Incognito mode
   - Login ด้วยบัญชีอื่น
   - กดไลค์ฟีดของ User A

3. **ตรวจสอบ Server Logs:**
   ดู terminal ที่รัน `npm run dev` ควรเห็น:
   ```
   🔍 Checking if notification should be sent for like...
   📝 Feed item found: {...}
   📤 Sending like notification: {...}
   🔔 Creating like notification: {...}
   📝 Notification data to create: {...}
   💾 Saving to database: {...}
   ✅ Notification saved to database: {...}
   ✅ Like notification sent successfully
   ```

4. **กลับไปที่ User A:**
   - Refresh หน้าเว็บ
   - คลิกกระดิ่งแจ้งเตือน
   - ควรเห็นแจ้งเตือนใหม่

### 4. ตรวจสอบฐานข้อมูล

#### ใช้ Prisma Studio
1. เข้า `http://localhost:5555`
2. คลิกที่ตาราง **Notification**
3. ดูข้อมูลที่สร้างใหม่

### 5. ตรวจสอบ Network Requests

#### ใน Browser DevTools -> Network
1. Filter โดยพิมพ์ `notifications`
2. ดู API calls:
   - `GET /api/notifications` 
   - `GET /api/notifications/unread-count`

**คาดหวัง:**
- Status: 200 OK
- Response มีข้อมูลแจ้งเตือน

### 6. สิ่งที่ต้องตรวจสอบถ้ามีปัญหา

#### A. ถ้าไม่มีแจ้งเตือนแสดง:
1. **ตรวจสอบ Authentication:**
   - Login อยู่หรือไม่?
   - Session valid หรือไม่?

2. **ตรวจสอบ API Errors:**
   ```
   ❌ Notification API Error: {...}
   ❌ Unread Count API Error: {...}
   ```

3. **ตรวจสอบ Server Logs:**
   - มี error ใน console หรือไม่?
   - Notification ถูกสร้างจริงหรือไม่?

#### B. ถ้า API ไม่ทำงาน:
1. **ตรวจสอบ Next.js Server:**
   - รันอยู่หรือไม่? (npm run dev)
   - Port ถูกต้องหรือไม่? (3002)

2. **ตรวจสอบ Database:**
   - Prisma connected หรือไม่?
   - มี Notification table หรือไม่?

#### C. ถ้า Like ไม่สร้างแจ้งเตือน:
1. **ตรวจสอบว่า:**
   - กดไลค์ฟีดของคนอื่น (ไม่ใช่ตัวเอง)
   - Server logs แสดง notification creation
   - Database มีข้อมูลใหม่

### 7. Common Issues & Solutions

#### Issue: "Failed to fetch notifications: 401"
**สาเหตุ:** ไม่ได้ login หรือ session หมดอายุ
**แก้ไข:** Login ใหม่

#### Issue: "Failed to fetch notifications: 500"  
**สาเหตุ:** Server error
**แก้ไข:** ดู server logs หา error details

#### Issue: กดไลค์แล้วไม่มี notification
**สาเหตุ:** 
- กดไลค์ฟีดตัวเอง
- Server error ในการสร้าง notification
**แก้ไข:** ใช้ user อื่นกดไลค์

## ผลลัพธ์ที่คาดหวัง

✅ **สำเร็จ** ถ้า:
1. เห็น debug logs ใน console
2. API calls return 200 OK
3. มี notification ใหม่ใน database
4. แสดงแจ้งเตือนใน UI

❌ **ไม่สำเร็จ** ถ้า:
1. API calls return error
2. ไม่มี server logs เมื่อกดไลค์
3. ไม่มีข้อมูลใน database
4. ไม่แสดงแจ้งเตือนใน UI

## หากยังไม่ทำงาน

กรุณาส่ง:
1. **Browser Console Logs** (copy ทั้งหมด)
2. **Server Terminal Logs** (เมื่อกดไลค์)
3. **Network Tab Screenshot** (API calls)
4. **Prisma Studio Screenshot** (Notification table)

เพื่อให้สามารถช่วย debug ต่อได้ 