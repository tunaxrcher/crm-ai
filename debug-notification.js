// Debug script เพื่อตรวจสอบ notification ใน database
// รันด้วย: node debug-notification.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkNotifications() {
  try {
    console.log('🔍 ตรวจสอบ Notifications ใน Database...\n')

    // ดึง notification ล่าสุด 10 รายการ
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    })

    if (notifications.length === 0) {
      console.log('❌ ไม่มี Notification ใน database')
      return
    }

    console.log(`📊 พบ ${notifications.length} Notifications ล่าสุด:\n`)

    notifications.forEach((notification, index) => {
      const emoji = notification.type === 'like' ? '💖' : notification.type === 'comment' ? '💬' : '🔔'
      const readStatus = notification.isRead ? '✅' : '🆕'
      
      console.log(`${index + 1}. ${emoji} ${readStatus} ID: ${notification.id}`)
      console.log(`   Type: ${notification.type}`)
      console.log(`   Title: ${notification.title}`)
      console.log(`   Message: ${notification.message}`)
      console.log(`   User: ${notification.user.name} (ID: ${notification.userId})`)
      console.log(`   Created: ${notification.createdAt}`)
      console.log(`   Read: ${notification.isRead ? 'Yes' : 'No'}`)
      console.log('')
    })

    // สถิติตาม type
    const likesCount = notifications.filter(n => n.type === 'like').length
    const commentsCount = notifications.filter(n => n.type === 'comment').length
    const repliesCount = notifications.filter(n => n.type === 'reply').length

    console.log('📈 สถิติ:')
    console.log(`   💖 Like: ${likesCount} รายการ`)
    console.log(`   💬 Comment: ${commentsCount} รายการ`)
    console.log(`   ↩️ Reply: ${repliesCount} รายการ`)

    // ตรวจสอบ unread notifications
    const unreadCount = await prisma.notification.count({
      where: { isRead: false }
    })
    
    console.log(`\n🔔 Unread Notifications: ${unreadCount} รายการ`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNotifications() 