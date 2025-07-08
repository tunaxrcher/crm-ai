# 🔍 Debug Instructions สำหรับ Like Notification Toast

## 🎯 วัตถุประสงค์
ตรวจสอบทำไม like notification ไม่ขึ้น toast แต่ comment notification ขึ้น

## 📋 ขั้นตอนการทดสอบ

### 1. เปิด Browser DevTools
- กด F12
- เปิด Console tab
- เคลียร์ console (Clear ทั้งหมด)

### 2. เปิด Server Console
- ดู terminal ที่รัน `npm run dev`
- เตรียมดู log

### 3. ทดสอบ Like (ขั้นตอนละเอียด)

**User A (คนที่จะไลค์):**
1. เข้าสู่ระบบด้วย user A
2. ไปที่หน้า feed
3. หาโพสต์ของ user B
4. **กดไลค์ครั้งเดียว** (อย่ากดซ้ำ!)
5. รอ 3 วินาที

**ดู Server Console ควรมี log นี้:**
```
💖 New like detected - will send notification
🔍 Checking if notification should be sent for like...
📝 Feed item found: { feedId: xxx, feedOwnerId: xxx, likerId: xxx, shouldSendNotification: true }
📤 Sending like notification: { feedOwnerId: xxx, likerName: 'xxx' }
🔔 Creating like notification: { feedOwnerId: xxx, likerName: 'xxx' }
📝 Like notification data to create: { type: 'like', title: 'มีคนกดไลค์โพสต์ของคุณ', message: 'xxx กดไลค์โพสต์ของคุณ', userId: xxx }
[SERVER] Creating notification: like
💾 Saving to database: { type: 'like', title: 'มีคนกดไลค์โพสต์ของคุณ', message: 'xxx กดไลค์โพสต์ของคุณ', userId: xxx, isRead: false }
✅ Notification saved to database: { id: xxx, type: 'like', ... }
✅ Like notification created with ID: xxx
💾 Like notification committed to database
✅ Like notification sent successfully
```

**ดู Browser Console (User A) ควรมี log นี้:**
```
🔄 Invalidating and refetching notification queries after like...
🔄 1st delayed refetch of notification queries (500ms)...
🔄 2nd delayed refetch of notification queries (1.5s)...
🔄 3rd delayed refetch of notification queries (3s)...
```

### 4. เปลี่ยนไปเป็น User B (คนที่ถูกไลค์)

**User B:**
1. เปลี่ยนเป็น user B (ลิงก์ใหม่หรือ incognito)
2. เข้าสู่ระบบด้วย user B
3. ไปที่หน้า feed

**ดู Browser Console (User B) ควรมี log นี้:**
```
🍞 User changed, resetting toast service counters
🍞 Initializing toast service...
🍞 Notification data received: { unreadCount: xxx, notificationsCount: xxx, isInitialized: false, latestNotificationId: xxx }
🍞 Toast Service - Checking for new notifications: { newUnreadCount: xxx, lastUnreadCount: 0, lastNotificationId: 0, latestNotifications: [...] }
🍞 Toast Service - Found new notifications: [{ id: xxx, type: 'like' }]
🍞 Toast Service - Showing toast for: { id: xxx, type: 'like', title: 'มีคนกดไลค์โพสต์ของคุณ', message: 'xxx กดไลค์โพสต์ของคุณ', ... }
🍞 Toast Service - Showing toast for notification: { id: xxx, type: 'like', ... }
💖 Toast Service - Processing LIKE notification
🍞 Toast Service - Adding toast: { type: 'success', title: '💖 มีคนไลค์โพสต์!', message: 'xxx กดไลค์โพสต์ของคุณ', notificationType: 'like' }
✅ Toast Service - Toast added successfully!
```

### 5. ตรวจสอบ Notification Panel (เพิ่มเติม)
- กดไอคอน bell 🔔
- ดูว่ามี like notification ใน panel หรือไม่
- ดูว่า unread count เพิ่มขึ้นหรือไม่

## 🚨 สถานการณ์ที่เป็นไปได้

### ❌ กรณีที่ 1: ไม่มี Server Log เลย
**ปัญหา:** Like API ไม่ถูกเรียก
**แก้ไข:** ตรวจสอบ UI การกดไลค์

### ❌ กรณีที่ 2: มี "Unlike detected" แทน "New like detected"
**ปัญหา:** โพสต์ถูกไลค์อยู่แล้ว กดอีกครั้งเป็นการยกเลิกไลค์
**แก้ไข:** ใช้โพสต์ที่ยังไม่ได้ไลค์

### ❌ กรณีที่ 3: มี Server Log แต่ไม่มี Browser Refetch
**ปัญหา:** Frontend ไม่ได้ refetch
**แก้ไข:** ตรวจสอบ React Query

### ❌ กรณีที่ 4: มี Refetch แต่ไม่มี Toast Service Log
**ปัญหา:** Notification ไม่ถูกตรวจจับ
**แก้ไข:** ตรวจสอบ timing หรือ data format

### ❌ กรณีที่ 5: มี Toast Service Log แต่ไม่มี Toast ขึ้น
**ปัญหา:** Toast UI ไม่ทำงาน
**แก้ไข:** ตรวจสอบ Toast Provider

## ✅ ถ้าทำงานถูกต้อง
จะเห็น toast สีเขียวมุมขวาล่าง:
```
💖 มีคนไลค์โพสต์!
[ชื่อ user] กดไลค์โพสต์ของคุณ
```

## 📊 ตรวจสอบ Database (เพิ่มเติม)
1. เปิด http://localhost:5555 (Prisma Studio)
2. ไปที่ตาราง `Notification`
3. ดูว่ามี notification type 'like' ใหม่หรือไม่
4. ตรวจสอบ userId ที่ถูกต้อง

## 🔧 Quick Fix
หากยังไม่ทำงาน:
1. Refresh หน้าเว็บ user B
2. รอ 10-15 วินาที (auto refetch)
3. ลองกดไลค์โพสต์อื่นดู 