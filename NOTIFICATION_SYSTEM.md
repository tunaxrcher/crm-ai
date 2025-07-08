# Notification System Documentation

## Overview
ระบบแจ้งเตือนที่ได้ถูกเพิ่มเข้ามาในแอปพลิเคชัน เพื่อแจ้งเตือนผู้ใช้เมื่อมีกิจกรรมสำคัญเกิดขึ้น เช่น การกดไลค์ฟีด หรือการแสดงความคิดเห็น

## Features
- ✅ แจ้งเตือนเมื่อมีคนกดไลค์ฟีดของเรา
- ✅ แจ้งเตือนเมื่อมีคนแสดงความคิดเห็นในฟีดที่เราโพส
- ✅ แจ้งเตือนเมื่อมีคนตอบกลับความคิดเห็นของเรา
- ✅ แสดงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
- ✅ ระบบอ่านแจ้งเตือนและอ่านทั้งหมด
- ✅ UI ที่สวยงามและใช้งานง่าย

## Architecture

### Backend Components

#### 1. Database Model
ใช้ Notification model ที่มีอยู่ใน Prisma schema:
```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  type      String
  title     String
  message   String   @db.Text
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 2. Notification Service
- **NotificationRepository**: จัดการการเข้าถึงฐานข้อมูล
- **NotificationService**: Business logic สำหรับสร้างและจัดการแจ้งเตือน
- **Helper Methods**: 
  - `createLikeNotification()`
  - `createCommentNotification()`
  - `createReplyNotification()`

#### 3. API Endpoints
- `GET /api/notifications` - ดึงรายการแจ้งเตือน
- `PUT /api/notifications/[id]/read` - อ่านแจ้งเตือนเฉพาะ
- `PUT /api/notifications/mark-all-read` - อ่านทั้งหมด
- `GET /api/notifications/unread-count` - ดึงจำนวนที่ยังไม่อ่าน

### Frontend Components

#### 1. React Hooks
```typescript
// ดึงรายการแจ้งเตือน
const { data, isLoading } = useNotifications(page, limit)

// ดึงจำนวนที่ยังไม่อ่าน
const { data: unreadCount } = useUnreadCount()

// อ่านแจ้งเตือน
const markAsReadMutation = useMarkAsRead()

// อ่านทั้งหมด
const markAllAsReadMutation = useMarkAllAsRead()
```

#### 2. UI Components
- **NotificationSheet**: แสดงรายการแจ้งเตือนในรูปแบบ Slide-out
- **Notification Bell**: ปุ่มกระดิ่งพร้อมจำนวนแจ้งเตือน
- **Notification Cards**: การ์ดแสดงแจ้งเตือนแต่ละรายการ

## Integration Points

### 1. Like System Integration
ใน `src/features/feed/services/server.ts` - `LikeService.toggleLike()`:
```typescript
// ส่งแจ้งเตือนให้เจ้าของฟีด (ถ้าไม่ใช่ตัวเอง)
if (feedItem && feedItem.userId !== userId) {
  const likerName = session.user.name || 'Unknown User'
  await notificationService.createLikeNotification({
    feedOwnerId: feedItem.userId,
    likerName,
  })
}
```

### 2. Comment System Integration
ใน `src/features/feed/services/server.ts` - `CommentService.createComment()`:
```typescript
// ส่งแจ้งเตือนให้เจ้าของฟีด (ถ้าไม่ใช่ตัวเอง)
if (feedItem && feedItem.userId !== userId) {
  const commenterName = session.user.name || 'Unknown User'
  await notificationService.createCommentNotification({
    feedOwnerId: feedItem.userId,
    commenterName,
    comment: content,
  })
}
```

## File Structure
```
src/
├── features/
│   └── notifications/
│       ├── hooks/
│       │   └── api.ts           # React Query hooks
│       ├── services/
│       │   ├── client.ts        # Frontend service
│       │   └── server.ts        # Backend service
│       ├── types/
│       │   └── index.ts         # TypeScript types
│       ├── repository.ts        # Database operations
│       └── index.ts             # Exports
├── app/
│   └── api/
│       └── notifications/       # API routes
│           ├── route.ts
│           ├── [id]/read/route.ts
│           ├── mark-all-read/route.ts
│           └── unread-count/route.ts
└── components/
    └── shared/
        └── NotificationSheet.tsx # UI component
```

## Usage Examples

### 1. การใช้งาน Notification Hook
```typescript
import { useNotifications, useUnreadCount } from '@src/features/notifications'

function MyComponent() {
  const { data: notifications, isLoading } = useNotifications()
  const { data: unreadCount } = useUnreadCount()
  
  return (
    <div>
      <h3>Notifications ({unreadCount?.count || 0})</h3>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        notifications?.notifications.map(notification => (
          <div key={notification.id}>
            {notification.title}: {notification.message}
          </div>
        ))
      )}
    </div>
  )
}
```

### 2. การสร้างแจ้งเตือนแบบกำหนดเอง
```typescript
import { notificationService } from '@src/features/notifications/services/server'

// ในฟังก์ชัน API route หรือ server action
await notificationService.createNotification({
  type: 'custom',
  title: 'Custom Notification',
  message: 'This is a custom message',
  userId: targetUserId,
})
```

## Testing

### การทดสอบระบบแจ้งเตือน:

1. **ทดสอบการกดไลค์**:
   - เข้าสู่ระบบด้วยผู้ใช้ A
   - โพสต์ฟีดใหม่
   - เข้าสู่ระบบด้วยผู้ใช้ B
   - กดไลค์ฟีดของผู้ใช้ A
   - กลับไปที่ผู้ใช้ A ควรเห็นแจ้งเตือนการไลค์

2. **ทดสอบการแสดงความคิดเห็น**:
   - เข้าสู่ระบบด้วยผู้ใช้ A
   - โพสต์ฟีดใหม่
   - เข้าสู่ระบบด้วยผู้ใช้ B
   - แสดงความคิดเห็นในฟีดของผู้ใช้ A
   - กลับไปที่ผู้ใช้ A ควรเห็นแจ้งเตือนความคิดเห็น

3. **ทดสอบการตอบกลับ**:
   - ทำตามขั้นตอนการทดสอบความคิดเห็น
   - ผู้ใช้ A ตอบกลับความคิดเห็นของผู้ใช้ B
   - ผู้ใช้ B ควรเห็นแจ้งเตือนการตอบกลับ

## Performance Considerations

1. **Database Indexing**: มี index ใน userId สำหรับการค้นหาแจ้งเตือนที่รวดเร็ว
2. **Pagination**: ใช้ pagination ในการดึงแจ้งเตือนเพื่อป้องกันการโหลดข้อมูลมากเกินไป
3. **Real-time Updates**: ใช้ React Query สำหรับ caching และ auto-refetch
4. **Error Handling**: Notification failures ไม่กระทบต่อการทำงานหลักของระบบ

## Future Enhancements

1. **Real-time Notifications**: เพิ่ม WebSocket หรือ Server-Sent Events
2. **Push Notifications**: เพิ่มการส่งแจ้งเตือนผ่าน browser หรือ mobile app
3. **Notification Preferences**: ให้ผู้ใช้เลือกประเภทแจ้งเตือนที่ต้องการ
4. **Email Notifications**: ส่งอีเมลสำหรับแจ้งเตือนสำคัญ
5. **Notification Categories**: จัดกลุ่มแจ้งเตือนตามประเภท
6. **Rich Notifications**: เพิ่มรูปภาพและลิงก์ในแจ้งเตือน

## Troubleshooting

### ปัญหาที่อาจพบ:

1. **แจ้งเตือนไม่แสดง**: ตรวจสอบ API endpoints และ database connection
2. **จำนวนแจ้งเตือนไม่ถูกต้อง**: ตรวจสอบ React Query cache และ refetch logic
3. **Performance ช้า**: ตรวจสอบ database queries และ indexing

### การ Debug:

1. เปิด Network tab ใน Browser DevTools เพื่อดู API calls
2. ตรวจสอบ Console logs สำหรับ errors
3. ตรวจสอบ Database records ใน Notification table 