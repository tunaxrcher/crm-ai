# Smart Polling System

ระบบ Smart Polling เป็นระบบที่ปรับปรุงจาก polling ธรรมดาให้เป็นแบบอัจฉริยะมากขึ้น โดยจะทำการ poll ข้อมูลเร็วขึ้นหลังจากที่ผู้ใช้ทำ action ต่างๆ แล้วค่อยๆ ลดความเร็วลงเมื่อไม่มี activity

## คุณสมบัติหลัก

### 🚀⚡ Ultra Fast Polling หลัง User Actions
- หลังจากผู้ใช้ like, comment, หรือ read notification จะเริ่ม **ULTRA FAST** polling ทันที
- **Immediate refetch** ทันทีหลัง action
- Poll ทุก **0.3-0.5 วินาที** เป็นจำนวน **15-25 ครั้ง**
- จากนั้นกลับไปใช้ slow polling ปกติ

### 🐌 Slow Polling ในช่วงปกติ
- Poll ทุก **10-15 วินาที** เมื่อไม่มี user activity (เร็วขึ้นจากเดิม)
- ประหยัด bandwidth และ server resources

### ⏸️ Smart Pause/Resume
- หยุด polling อัตโนมัติเมื่อ tab ไม่ active
- Resume และ refetch ทันทีเมื่อ user กลับมา

### 🚀⚡ Ultra Fast Mode
- โหมดพิเศษสำหรับ critical actions (like, comment)
- Immediate refetch ทันทีหลัง action
- Polling interval ต่ำสุด 300ms (0.3 วินาที)
- Duration เพิ่มขึ้น +5 cycles เมื่อเปิดใช้งาน

## วิธีใช้งาน

### 1. ใช้ useAppPolling (แนะนำ)
```typescript
import { useAppPolling } from '@src/hooks'

function MyComponent() {
  const { triggerAfterLike, triggerAfterComment } = useAppPolling()
  
  const handleLike = async () => {
    await likePost()
    triggerAfterLike() // เริ่ม fast polling
  }
  
  const handleComment = async () => {
    await addComment()
    triggerAfterComment() // เริ่ม fast polling  
  }
}
```

### 2. ใช้ useSmartPolling แบบ Custom
```typescript
import { useSmartPolling } from '@src/hooks'

function CustomComponent() {
  const { triggerFastPolling } = useSmartPolling({
    queryKeys: [['my-data']],
    fastPollDuration: 15,   // poll เร็ว 15 ครั้ง
    fastInterval: 400,      // ทุก 0.4 วินาที  
    slowInterval: 10000,    // ทุก 10 วินาที
    ultraFastMode: true,    // 🚀⚡ เปิดโหมดเร็วสุด
  })
  
  const handleAction = () => {
    triggerFastPolling() // เริ่ม ultra fast polling
  }
}
```

## Implementation Details

### Hooks ที่ใช้ Smart Polling
- ✅ `useNotifications` - อัตโนมัติ
- ✅ `useUnreadCount` - อัตโนมัติ  
- ✅ `useMarkAsRead` - Trigger หลัง mutation
- ✅ `useMarkAllAsRead` - Trigger หลัง mutation
- ✅ `useFeed` - Trigger หลัง like/comment

### Query Keys ที่ Polling
```typescript
[
  ['notifications'],              // รายการ notifications
  ['notifications', 'unread-count'], // จำนวน unread
  ['feed'],                      // feed items
]
```

### Timeline ของ Ultra Fast Smart Polling
```
User Action (like/comment) → 🚀⚡ ULTRA FAST Polling เริ่ม
├─ 0s: Immediate refetch ทันที ⚡
├─ 0.3s: Ultra fast poll #1 ⚡⚡
├─ 0.6s: Ultra fast poll #2 ⚡⚡
├─ 0.9s: Ultra fast poll #3 ⚡⚡
├─ 1.2s: Ultra fast poll #4 ⚡⚡
├─ ... (ต่อไปอีก 15-20 ครั้ง) ⚡⚡
├─ 7-8s: Ultra fast poll สุดท้าย ⚡⚡
└─ หลัง 8s: กลับไป Slow polling (ทุก 10-15s) 🐌
```

## Benefits

### 🎯 Ultra Responsive UX
- Notifications ปรากฏเร็วมากหลัง user actions (ภายใน 0.3s)
- Immediate feedback ทันทีหลัง action
- ลด perceived latency อย่างมีนัยสำคัญ

### 💰 Resource Efficient  
- ไม่ waste bandwidth ด้วย constant fast polling
- Server load ลดลงเมื่อไม่มี activity

### 🔋 Battery Friendly
- หยุด polling เมื่อ tab ไม่ active
- ลด background processing

## Debugging

เปิด console เพื่อดู Ultra Fast Smart Polling logs:
```
🚀⚡ ULTRA FAST Polling - Starting for 20 cycles every 300ms
⚡ Immediate refetch before fast polling starts
⚡ Fast poll cycle 1/20
⚡ Fast poll cycle 2/20
...
🐌 Smart Polling - Switching to slow polling
👍 User liked - triggering smart polling for notifications
💬 Comment action - triggering smart polling for notifications
```

## Configuration

แก้ไขค่า default ได้ที่:
- `src/hooks/useSmartPolling.ts` - Base hook
- `src/hooks/useAppPolling.ts` - App-wide settings
- Individual feature hooks - Specific settings 