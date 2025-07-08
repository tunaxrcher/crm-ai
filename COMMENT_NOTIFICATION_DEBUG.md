# 🔍 Debug Instructions สำหรับ Comment Notification

## วิธีตรวจสอบ Comment Notification

### 1. เปิด Browser DevTools (F12)
- เปิด Console tab
- ดูว่ามี error หรือไม่

### 2. ดู Server Console
- ในหน้าต่าง terminal ที่รัน `npm run dev`
- ดูว่ามี log ข้อความเหล่านี้หรือไม่เมื่อ comment:

```
🔍 Checking if notification should be sent for comment...
📝 Feed item found: { feedId: xxx, feedOwnerId: xxx, commenterId: xxx, shouldSendNotification: true }
📤 Sending comment notification: { feedOwnerId: xxx, commenterName: 'xxx', comment: 'xxx' }
🔔 Creating comment notification: { feedOwnerId: xxx, commenterName: 'xxx', comment: 'xxx' }
📝 Comment notification data to create: { type: 'comment', title: 'xxx', message: 'xxx', userId: xxx }
[SERVER] Creating notification: comment
💾 Saving to database: { type: 'comment', title: 'xxx', message: 'xxx', userId: xxx, isRead: false }
✅ Notification saved to database: { id: xxx, type: 'comment', ... }
✅ Comment notification created: { id: xxx, type: 'comment', ... }
✅ Comment notification sent successfully
```

### 3. การทดสอบ
1. ใช้ user A เขียน comment ใน post ของ user B
2. ดู server console ว่ามี log ตาม step 2 หรือไม่
3. Switch ไปที่ user B (refresh หน้าเพื่อให้แน่ใจว่าเป็น user B)
4. ดูว่ามี notification badge ขึ้นหรือไม่

### 4. ตรวจสอบ API Calls
ใน Browser DevTools > Network tab:
- ดูว่ามี POST request ไปที่ `/api/feed/[id]/comments` หรือไม่
- ดูว่ามี GET request ไปที่ `/api/notifications` หรือไม่
- ดูว่ามี GET request ไปที่ `/api/notifications/unread-count` หรือไม่

### 5. ตรวจสอบ React Query
ใน Browser DevTools > Console:
- ดูว่ามี log `🔔 NotificationSheet Debug:` หรือไม่
- ดูว่าใน log นั้น `notifications` และ `unreadCount` มีค่าหรือไม่

### 6. ถ้าไม่มี Server Log
แสดงว่า `createComment` ไม่ถูกเรียกเลย:
- ตรวจสอบว่า comment form submit ถูกต้องหรือไม่
- ตรวจสอบว่า API endpoint ถูกต้องหรือไม่

### 7. ถ้ามี Server Log แต่ไม่มี Notification
แสดงว่า frontend ไม่ได้ fetch ข้อมูลใหม่:
- ตรวจสอบว่า `queryClient.invalidateQueries` ทำงานหรือไม่
- ลอง refresh หน้าเว็บด้วยตนเอง

### 8. ถ้ามี Error ใน Console
- Copy error message ทั้งหมดมาแจ้ง

## 🚨 Common Issues
1. **ไม่มี Server Log**: Comment API ไม่ถูกเรียก
2. **มี Server Log แต่ไม่มี Notification**: Frontend ไม่ได้ refresh
3. **401 Error**: Authentication ผิดพลาด
4. **500 Error**: Database หรือ server error

## ⚡ Quick Fix
หากยังไม่ทำงาน ลองทำการนี้:
1. Refresh หน้าเว็บ
2. ลอง comment อีกครั้ง
3. รอ 30 วินาที (notification auto-refresh)
4. ลองเปิด notification panel ใหม่ 