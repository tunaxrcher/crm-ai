import { faker } from '@faker-js/faker/locale/en'
import { EnumMediaType, PrismaClient } from '@prisma/client'

const bucket = process.env.DO_SPACES_BUCKET
const region = process.env.DO_SPACES_REGION

const prisma = new PrismaClient()

async function main() {
  // console.log('🌱 เริ่มต้น Seeding...')

  // // ล้างข้อมูลเก่าออกก่อน (จะมีข้อมูลอยู่ในฐานข้อมูลหรือไม่ก็ได้)
  // await cleanupDB()

  // console.log('🔄 เริ่มสร้างข้อมูลใหม่...')

  // // ============= สร้าง JobClass และ JobLevel =============
  // const jobClasses = await createJobClasses()
  // console.log(
  //   `✅ สร้าง JobClass และ JobLevel ${jobClasses.length} อาชีพเรียบร้อย`
  // )

  // // ============= สร้าง User =============
  // // const users = await createUsers()
  // // console.log(`✅ สร้าง User ${users.length} คนเรียบร้อย`)

  // // ============= สร้าง Character =============
  // // const characters = await createCharacters(users, jobClasses)
  // // console.log(`✅ สร้าง Character ${characters.length} ตัวเรียบร้อย`)

  // // ============= สร้าง Achievement =============
  // const achievements = await createAchievements()
  // console.log(`✅ สร้าง Achievement ${achievements.length} ชิ้นเรียบร้อย`)

  // // ============= มอบ Achievement ให้กับ Character =============
  // // const characterAchievements = await assignAchievements(
  // //   characters,
  // //   achievements,
  // //   users
  // // )
  // // console.log(
  // //   `✅ มอบ Achievement ${characterAchievements.length} รายการเรียบร้อย`
  // // )

  // // ============= สร้าง Party =============
  // // const parties = await createParties(users)
  // // console.log(`✅ สร้าง Party ${parties.length} ทีมเรียบร้อย`)

  // // ============= สร้าง Quest =============
  // const quests = await createQuests()
  // console.log(`✅ สร้าง Quest ${quests.length} เควสเรียบร้อย`)

  // // ============= เพิ่ม AssignedQuest =============
  // // const assignedQuests = await assignQuests(characters, quests, users)
  // // console.log(`✅ มอบหมาย Quest ${assignedQuests.length} เควสเรียบร้อย`)

  // // ============= ส่ง QuestSubmission =============
  // // const questSubmissions = await submitQuests(characters, quests)
  // // console.log(
  // //   `✅ ส่ง QuestSubmission ${questSubmissions.length} รายการเรียบร้อย`
  // // )

  // // ============= สร้าง LevelHistory =============
  // // const levelHistories = await createLevelHistories(characters)
  // // console.log(`✅ สร้าง LevelHistory ${levelHistories.length} รายการเรียบร้อย`)

  // // ============= สร้าง FeedItem =============
  // // const feedItems = await createFeedItems(
  // //   users,
  // //   questSubmissions,
  // //   levelHistories,
  // //   characterAchievements
  // // )
  // // console.log(`✅ สร้าง FeedItem ${feedItems.length} รายการเรียบร้อย`)

  // // ============= สร้าง Story =============
  // // const stories = await createStories(users)
  // // console.log(`✅ สร้าง Story ${stories.length} รายการเรียบร้อย`)

  // // ============= สร้าง Like =============
  // // const likes = await createLikes(users, feedItems)
  // // console.log(`✅ สร้าง Like ${likes.length} รายการเรียบร้อย`)

  // // ============= สร้าง Comment =============
  // // const comments = await createComments(users, feedItems)
  // // console.log(`✅ สร้าง Comment ${comments.length} รายการเรียบร้อย`)

  // // ============= สร้าง ReplyComment =============
  // // const replyComments = await createReplyComments(users, comments)
  // // console.log(`✅ สร้าง ReplyComment ${replyComments.length} รายการเรียบร้อย`)

  // // ============= สร้าง StoryView =============
  // // const storyViews = await createStoryViews(users, stories)
  // // console.log(`✅ สร้าง StoryView ${storyViews.length} รายการเรียบร้อย`)

  // // ============= สร้าง UserToken =============
  // // const userTokens = await createUserTokens(users)
  // // console.log(`✅ สร้าง UserToken ${userTokens.length} รายการเรียบร้อย`)

  const rewards = await createRewardItems()
  console.log(`✅ สร้าง Reward Items ${rewards.length} รายการเรียบร้อย`)

  // console.log('✨ เสร็จสิ้นการ Seed ข้อมูล')
}

async function cleanupDB() {
  // ปิด foreign key checks ชั่วคราว
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;')

  // ใช้ backticks กับทุกตารางเพื่อหลีกเลี่ยง reserved words
  const tablesToClean = [
    'ReplyComment',
    'Comment',
    'Like',
    'StoryView',
    'Story',
    'TokenTransaction',
    'QuestToken',
    'TokenPurchase',
    'TokenShopItem',
    'QuestStreak',
    'TokenMultiplierEvent',
    'UserToken',
    'FeedItem',
    'LevelHistory',
    'QuestSubmission',
    'AssignedQuest',
    // 'PartyQuest',
    'Quest',
    // 'PartyMember',
    // 'Party',
    'CharacterAchievement',
    'Achievement',
    'Notification',
    'Ranking',
    'Character',
    'JobLevel',
    'JobClass',
    'User',
    'LevelRequirement',
  ]

  for (const table of tablesToClean) {
    try {
      // ใช้ backticks รอบชื่อตารางทุกตัว
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`)
      console.log(`🧹 ลบข้อมูลจากตาราง ${table} แล้ว`)
    } catch (error) {
      console.log(`⚠️ ไม่สามารถลบข้อมูลจากตาราง ${table} ได้: ${error}`)

      // ถ้า TRUNCATE ไม่ได้ ลองใช้ DELETE แทน
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\`;`)
        console.log(`🧹 ลบข้อมูลจากตาราง ${table} ด้วย DELETE แล้ว`)
      } catch (deleteError) {
        console.log(
          `❌ ไม่สามารถลบข้อมูลจากตาราง ${table} ด้วย DELETE: ${deleteError}`
        )
      }
    }
  }

  // เปิด foreign key checks กลับ
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;')

  // MySQL จะ reset AUTO_INCREMENT อัตโนมัติเมื่อใช้ TRUNCATE
  console.log('🔄 เสร็จสิ้นการล้างข้อมูล')
}

// ========== ฟังก์ชันสร้าง JobClass และ JobLevel ==========
async function createJobClasses() {
  const jobClassData = [
    {
      name: 'นักการตลาด',
      description:
        'ผู้ที่มีความสามารถในการวิเคราะห์ตลาด วางแผนและดำเนินกลยุทธ์ทางการตลาด',
      imageUrl: `https://${bucket}.${region}.digitaloceanspaces.com/marketing.png`,
      jobLevels: [
        {
          level: 1,
          requiredCharacterLevel: 1,
          title: 'นักการตลาดฝึกหัด',
          description: 'เริ่มต้นเส้นทางการเป็นนักการตลาด ยังต้องเรียนรู้อีกมาก',
          personaDescription:
            'Wearing wrinkled shirt holding old brochures, carrying phone with cracked screen',
        },
        {
          level: 10,
          requiredCharacterLevel: 10,
          title: 'ผู้ช่วยนักการตลาด',
          description:
            'เริ่มเข้าใจหลักการพื้นฐานของการตลาด สามารถช่วยทีมในงานง่ายๆ ได้',
          personaDescription:
            'Wearing neat shirt with new smartphone + small notebook',
        },
        {
          level: 35,
          requiredCharacterLevel: 35,
          title: 'นักการตลาดมือฉมัง',
          description:
            'เชี่ยวชาญการวิเคราะห์การตลาด และสามารถวางแผนแคมเปญได้อย่างมีประสิทธิภาพ',
          personaDescription:
            'Wearing light suit holding presentation tablet with basic graphic media',
        },
        {
          level: 60,
          requiredCharacterLevel: 60,
          title: 'หัวหน้าฝ่ายการตลาด',
          description: 'ควบคุมและบริหารทีมการตลาด กำหนดแนวทางกลยุทธ์หลักได้',
          personaDescription:
            'Wearing high-tech suit with bluetooth headset/mic and hologram graphs',
        },
        {
          level: 80,
          requiredCharacterLevel: 80,
          title: 'ผู้อำนวยการฝ่ายการตลาด',
          description:
            'กำหนดวิสัยทัศน์และกลยุทธ์ระดับองค์กร สร้างแบรนด์ที่แข็งแกร่ง',
          personaDescription:
            'Premium business suit with floating presentation screens, professional presenter',
        },
        {
          level: 99,
          requiredCharacterLevel: 99,
          title: 'กูรูด้านการตลาด',
          description:
            'ปรมาจารย์ด้านการตลาด ผู้กำหนดเทรนด์และนวัตกรรมใหม่ให้วงการ',
          personaDescription:
            'Futuristic strategy suit, surrounded by UI holograms, executive-level aura',
        },
      ],
    },
    {
      name: 'นักบัญชี',
      description:
        'ผู้ที่มีความสามารถในการจัดการบัญชี วิเคราะห์การเงิน และวางแผนภาษี',
      imageUrl: `https://${bucket}.${region}.digitaloceanspaces.com/accounthing.png`,
      jobLevels: [
        {
          level: 1,
          requiredCharacterLevel: 1,
          title: 'พนักงานบัญชีฝึกหัด',
          description:
            'เริ่มต้นเรียนรู้ระบบบัญชีเบื้องต้น ตรวจสอบเอกสารและบันทึกรายการ',
          personaDescription:
            'Old shirt with papers in hand, using calculator with missing buttons',
        },
        {
          level: 10,
          requiredCharacterLevel: 10,
          title: 'เจ้าหน้าที่บัญชี',
          description: 'สามารถจัดทำบัญชีรายรับรายจ่าย และงบการเงินเบื้องต้นได้',
          personaDescription:
            'Digital accounting notebook, formal attire, starting to use modern devices',
        },
        {
          level: 35,
          requiredCharacterLevel: 35,
          title: 'นักบัญชีอาวุโส',
          description:
            'วิเคราะห์งบการเงิน วางแผนภาษี และให้คำปรึกษาทางการเงินได้',
          personaDescription:
            'Neat shirt with tablet, digital calculator attached',
        },
        {
          level: 60,
          requiredCharacterLevel: 60,
          title: 'ผู้จัดการฝ่ายบัญชี',
          description:
            'ดูแลระบบบัญชีทั้งหมดขององค์กร พัฒนาระบบและควบคุมการเงิน',
          personaDescription:
            'Agile attire with AR analysis system surrounding',
        },
        {
          level: 80,
          requiredCharacterLevel: 80,
          title: 'ผู้อำนวยการฝ่ายการเงิน',
          description: 'กำหนดนโยบายการเงินและการลงทุน วางแผนกลยุทธ์ทางการเงิน',
          personaDescription:
            'Elegant suit with holo-data financial analysis floating in air',
        },
        {
          level: 99,
          requiredCharacterLevel: 99,
          title: 'ปรมาจารย์ด้านการเงิน',
          description:
            'เชี่ยวชาญด้านการเงินและภาษีระดับสูง สามารถคาดการณ์แนวโน้มทางเศรษฐกิจ',
          personaDescription:
            'Holographic accounting floating around, hand-controlled, expert aura',
        },
      ],
    },
    {
      name: 'นักขาย',
      description:
        'ผู้ที่มีความสามารถในการนำเสนอสินค้า เจรจาต่อรอง และปิดการขาย',
      imageUrl: `https://${bucket}.${region}.digitaloceanspaces.com/sales.png`,
      jobLevels: [
        {
          level: 1,
          requiredCharacterLevel: 1,
          title: 'พนักงานขายฝึกหัด',
          description: 'เรียนรู้สินค้าและบริการ ฝึกฝนทักษะการนำเสนอและการขาย',
          personaDescription:
            'Faded polo shirt with crumpled proposals, worried face',
        },
        {
          level: 10,
          requiredCharacterLevel: 10,
          title: 'พนักงานขาย',
          description:
            'สามารถนำเสนอสินค้า ตอบคำถามลูกค้า และทำยอดขายได้ตามเป้า',
          personaDescription:
            'Wearing shirt + tie, holding tablet showing products',
        },
        {
          level: 35,
          requiredCharacterLevel: 35,
          title: 'นักขายมืออาชีพ',
          description:
            'เจรจาต่อรองเก่ง ปิดการขายได้เก่ง สร้างความสัมพันธ์กับลูกค้าได้ดี',
          personaDescription:
            'Holding smart device with graphs, presenting confidently',
        },
        {
          level: 60,
          requiredCharacterLevel: 60,
          title: 'ผู้จัดการฝ่ายขาย',
          description: 'วางแผนกลยุทธ์การขาย บริหารทีมขาย และพัฒนาศักยภาพทีม',
          personaDescription:
            'Modern business suit with AR goggles, floating product images',
        },
        {
          level: 80,
          requiredCharacterLevel: 80,
          title: 'ผู้อำนวยการฝ่ายขาย',
          description:
            'กำหนดนโยบายและเป้าหมายการขายระดับองค์กร สร้างพันธมิตรทางธุรกิจ',
          personaDescription:
            'Luxury suit with team leader badge, selling through smart charts',
        },
        {
          level: 99,
          requiredCharacterLevel: 99,
          title: 'ราชาแห่งการขาย',
          description:
            'ปรมาจารย์ด้านการขาย ผู้สร้างปรากฏการณ์ยอดขายและพลิกโฉมวงการ',
          personaDescription:
            'Surrounded by hologram customers and multi-dimensional products, leadership aura',
        },
      ],
    },
    {
      name: 'ดีไซน์เนอร์',
      description:
        'ผู้ที่มีความสามารถในการออกแบบ สร้างสรรค์งานศิลปะ และพัฒนาแนวคิดใหม่ๆ',
      imageUrl: `https://${bucket}.${region}.digitaloceanspaces.com/designer.png`,
      jobLevels: [
        {
          level: 1,
          requiredCharacterLevel: 1,
          title: 'นักออกแบบหัดใหม่',
          description: 'เรียนรู้หลักการออกแบบพื้นฐาน และการใช้เครื่องมือออกแบบ',
          personaDescription: 'Wrinkled t-shirt with ink-stained sketchbook',
        },
        {
          level: 10,
          requiredCharacterLevel: 10,
          title: 'นักออกแบบ',
          description: 'สามารถสร้างงานออกแบบตามโจทย์ได้ มีสไตล์เป็นของตัวเอง',
          personaDescription:
            'Slightly stylish attire, holding iPad with stylus',
        },
        {
          level: 35,
          requiredCharacterLevel: 35,
          title: 'ดีไซน์เนอร์มืออาชีพ',
          description:
            'ออกแบบงานที่มีเอกลักษณ์ สร้างสรรค์ไอเดียใหม่ๆ ที่โดดเด่น',
          personaDescription: 'Cool jacket holding tablet with UI design work',
        },
        {
          level: 60,
          requiredCharacterLevel: 60,
          title: 'ครีเอทีฟไดเรกเตอร์',
          description: 'กำหนดทิศทางการออกแบบ นำเทรนด์ สร้างอัตลักษณ์ที่ชัดเจน',
          personaDescription:
            'AR glasses with UI screens placed around, showing 3D work',
        },
        {
          level: 80,
          requiredCharacterLevel: 80,
          title: 'ผู้อำนวยการฝ่ายครีเอทีฟ',
          description:
            'บริหารทีมครีเอทีฟ กำหนดวิสัยทัศน์ และสร้างแบรนด์ที่แข็งแกร่ง',
          personaDescription:
            'Custom designer outfit with rotating presentation screens in motion',
        },
        {
          level: 99,
          requiredCharacterLevel: 99,
          title: 'ปรมาจารย์แห่งการออกแบบ',
          description:
            'ผู้กำหนดเทรนด์การออกแบบระดับโลก สร้างสรรค์นวัตกรรมที่เปลี่ยนแปลงวงการ',
          personaDescription:
            'Legendary designer with work floating as installation art, iconic pose',
        },
      ],
    },
    {
      name: 'โปรแกรมเมอร์',
      description:
        'ผู้ที่มีความสามารถในการเขียนโปรแกรม พัฒนาซอฟต์แวร์ และแก้ไขปัญหาทางเทคนิค',
      imageUrl: `https://${bucket}.${region}.digitaloceanspaces.com/programmer.png`,
      jobLevels: [
        {
          level: 1,
          requiredCharacterLevel: 1,
          title: 'โปรแกรมเมอร์ฝึกหัด',
          description: 'เรียนรู้ภาษาโปรแกรมพื้นฐาน เขียนโค้ดง่ายๆ ได้',
          personaDescription:
            'Worn hoodie holding old laptop, screen showing errors',
        },
        {
          level: 10,
          requiredCharacterLevel: 10,
          title: 'จูเนียร์โปรแกรมเมอร์',
          description: 'เขียนโค้ดได้หลายภาษา แก้บั๊กและพัฒนาฟีเจอร์ใหม่ได้',
          personaDescription: 'Wearing new hoodie, coding on mid-spec laptop',
        },
        {
          level: 35,
          requiredCharacterLevel: 35,
          title: 'ซีเนียร์โปรแกรมเมอร์',
          description:
            'ออกแบบระบบขนาดใหญ่ แก้ปัญหาซับซ้อน พัฒนาแอปพลิเคชันเต็มรูปแบบได้',
          personaDescription:
            'Techwear shirt with laptop and slight hologram tools',
        },
        {
          level: 60,
          requiredCharacterLevel: 60,
          title: 'โปรแกรมเมอร์ผู้เชี่ยวชาญ',
          description:
            'เชี่ยวชาญการพัฒนาซอฟต์แวร์ขั้นสูง วางโครงสร้างที่ซับซ้อนได้',
          personaDescription:
            'Multiple holographic screens overlapping, floating keyboard',
        },
        {
          level: 80,
          requiredCharacterLevel: 80,
          title: 'สถาปนิกซอฟต์แวร์',
          description:
            'ออกแบบสถาปัตยกรรมซอฟต์แวร์ กำหนดมาตรฐานและแนวทางการพัฒนา',
          personaDescription:
            'Custom developer suit with hacker pro style code',
        },
        {
          level: 99,
          requiredCharacterLevel: 99,
          title: 'เทพแห่งโค้ด',
          description:
            'ปรมาจารย์การเขียนโปรแกรม สร้างนวัตกรรมและเทคโนโลยีที่เปลี่ยนแปลงโลก',
          personaDescription:
            'Living in cybernetic code world with data streams flowing around',
        },
      ],
    },
    {
      name: 'ช่าง',
      description:
        'ผู้ที่มีความสามารถในการสร้าง ซ่อมแซม และบำรุงรักษาโครงสร้างและเครื่องจักร',
      imageUrl: `https://${bucket}.${region}.digitaloceanspaces.com/mechanic.png`,
      jobLevels: [
        {
          level: 1,
          requiredCharacterLevel: 1,
          title: 'ช่างฝึกหัด',
          description: 'เรียนรู้การใช้เครื่องมือพื้นฐาน และทำงานซ่อมแซมง่ายๆ',
          personaDescription:
            'Torn/stained mechanic suit holding bent screwdriver, unsure posture',
        },
        {
          level: 10,
          requiredCharacterLevel: 10,
          title: 'ช่างทั่วไป',
          description:
            'ซ่อมแซมและบำรุงรักษาอุปกรณ์ทั่วไปได้ แก้ปัญหาเบื้องต้นได้',
          personaDescription:
            'Cleaner mechanic suit, portable tools, eager posture',
        },
        {
          level: 35,
          requiredCharacterLevel: 35,
          title: 'ช่างชำนาญการ',
          description: 'แก้ไขปัญหาซับซ้อนได้ ซ่อมแซมระบบที่มีความซับซ้อนสูงได้',
          personaDescription:
            'Wearing utility shirt with toolbelt using laser measuring',
        },
        {
          level: 60,
          requiredCharacterLevel: 60,
          title: 'หัวหน้าช่าง',
          description: 'ควบคุมทีมช่าง วางแผนการซ่อมบำรุง และพัฒนาระบบใหม่ๆ',
          personaDescription:
            'Mechanical arm/AR engineering glasses, repair drone floating nearby',
        },
        {
          level: 80,
          requiredCharacterLevel: 80,
          title: 'วิศวกรอาวุโส',
          description:
            'ออกแบบและพัฒนาระบบวิศวกรรมขั้นสูง แก้ปัญหาที่ซับซ้อนมาก',
          personaDescription:
            'Half-body exosuit with part control system, high-level mechanic pose',
        },
        {
          level: 99,
          requiredCharacterLevel: 99,
          title: 'อัจฉริยะด้านวิศวกรรม',
          description:
            'สร้างนวัตกรรมและสิ่งประดิษฐ์ที่ปฏิวัติวงการ พัฒนาเทคโนโลยีล้ำสมัย',
          personaDescription:
            'Futuristic mechanic armor with AI mechanical arms, energy flowing around, elegant posture',
        },
      ],
    },
  ]

  const createdJobClasses = []

  for (const jobClass of jobClassData) {
    const createdJobClass = await prisma.jobClass.create({
      data: {
        name: jobClass.name,
        description: jobClass.description,
        imageUrl: jobClass.imageUrl,
      },
    })

    // Create JobLevel for each JobClass with personaDescription and personaTraits
    for (const level of jobClass.jobLevels) {
      await prisma.jobLevel.create({
        data: {
          level: level.level,
          requiredCharacterLevel: level.requiredCharacterLevel,
          title: level.title,
          description: level.description,
          personaDescription: level.personaDescription,
          jobClassId: createdJobClass.id,
        },
      })
    }

    createdJobClasses.push(createdJobClass)
  }

  return createdJobClasses
}

// ========== ฟังก์ชันสร้าง User ==========
async function createUsers() {
  const users = []

  // สร้าง User 10 คน
  for (let i = 0; i < 10; i++) {
    const gender = faker.person.sex() as 'male' | 'female'
    const firstName = faker.person.firstName(gender)
    const lastName = faker.person.lastName(gender)
    const username = faker.internet
      .userName({ firstName, lastName })
      .toLowerCase()

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }),
        username: username,
        password: faker.internet.password({ length: 10 }),
        name: `${firstName} ${lastName}`,
        avatar: faker.image.avatar(),
        bio: faker.person.bio(),
        // level: faker.number.int({ min: 1, max: 50 }),
        // xp: faker.number.int({ min: 100, max: 5000 }),
      },
    })

    users.push(user)
  }

  return users
}

// ========== ฟังก์ชันสร้าง Character ==========

function generatePortraits(level: number): {
  portraits: Record<string, string>
  currentUrl: string
} {
  const baseUrl = `https://${bucket}.${region}.digitaloceanspaces.com`

  const milestones = [1, 10, 35, 60, 80, 99]
  const portraits: Record<string, string> = {}

  for (const milestone of milestones) {
    portraits[milestone.toString()] = `${baseUrl}/${milestone}.png`
  }

  // กำหนด currentUrl เป็นภาพ milestone ล่าสุดที่ level ถึงหรือเกิน
  const unlockedMilestone = [...milestones]
    .reverse()
    .find((milestone) => level >= milestone)

  const currentUrl =
    unlockedMilestone !== undefined
      ? portraits[unlockedMilestone.toString()]
      : portraits['1']

  return { portraits, currentUrl }
}

export async function createCharacters(users: any[], jobClasses: any[]) {
  const characters = []

  for (const user of users) {
    const jobClass = faker.helpers.arrayElement(jobClasses)

    const jobLevels = await prisma.jobLevel.findMany({
      where: { jobClassId: jobClass.id },
      orderBy: { level: 'asc' },
    })

    let level = faker.number.int({ min: 1, max: 50 })

    let selectedJobLevel = jobLevels[0]
    for (const jobLevel of jobLevels) {
      if (level >= jobLevel.requiredCharacterLevel) {
        selectedJobLevel = jobLevel
      } else {
        break
      }
    }

    const baseStats = 10
    let statAGI = baseStats
    let statSTR = baseStats
    let statDEX = baseStats
    let statVIT = baseStats
    let statINT = baseStats

    let personaTraits = ''

    switch (jobClass.name) {
      case 'นักการตลาด':
        statAGI += faker.number.int({ min: 5, max: 15 })
        statINT += faker.number.int({ min: 5, max: 10 })
        personaTraits =
          'bright confident eyes, styled hair, charismatic smile, and energetic posture'
        break
      case 'นักบัญชี':
        statINT += faker.number.int({ min: 10, max: 20 })
        statDEX += faker.number.int({ min: 3, max: 8 })
        personaTraits =
          'focused eyes behind glasses, neat hair, serious expression, and organized appearance'
        break
      case 'นักขาย':
        statAGI += faker.number.int({ min: 8, max: 15 })
        statSTR += faker.number.int({ min: 3, max: 8 })
        personaTraits =
          'friendly eyes, approachable smile, neat appearance, and persuasive charm'
        break
      case 'ดีไซน์เนอร์':
        statDEX += faker.number.int({ min: 10, max: 20 })
        statINT += faker.number.int({ min: 5, max: 10 })
        personaTraits =
          'creative eyes, artistic hairstyle, unique fashion sense, and innovative aura'
        break
      case 'โปรแกรมเมอร์':
        statINT += faker.number.int({ min: 15, max: 25 })
        statVIT += faker.number.int({ min: 3, max: 8 })
        personaTraits =
          'intelligent eyes, casual hair, focused expression, and tech-savvy appearance'
        break
      case 'ช่าง':
        statSTR += faker.number.int({ min: 10, max: 20 })
        statDEX += faker.number.int({ min: 5, max: 15 })
        personaTraits =
          'practical eyes, short hair, determined face, and strong build'
        break
    }

    const { portraits, currentUrl } = generatePortraits(level)

    const character = await prisma.character.create({
      data: {
        name: `${user.name} (${jobClass.name})`,
        level: level,
        currentXP: faker.number.int({ min: 0, max: 900 }),
        nextLevelXP: 1000,
        totalXP: level * 1000 + faker.number.int({ min: 0, max: 900 }),
        statPoints: faker.number.int({ min: 0, max: 10 }),
        statAGI,
        statSTR,
        statDEX,
        statVIT,
        statINT,
        currentPortraitUrl: currentUrl,
        personaTraits,
        userId: user.id,
        jobClassId: jobClass.id,
        jobLevelId: selectedJobLevel.id,
        generatedPortraits: portraits,
      },
    })

    characters.push(character)
  }

  return characters
}

// ========== ฟังก์ชันสร้าง Achievement ==========
async function createAchievements() {
  const achievementData = [
    {
      name: 'เริ่มต้นการเดินทาง',
      description: 'เริ่มต้นชีวิตการทำงานครั้งแรก',
      icon: '🌟',
    },
    { name: 'นักสู้หน้าใหม่', description: 'ทำเควสครบ 10 ครั้ง', icon: '🔥' },
    {
      name: 'ปราชญ์แห่งความรู้',
      description: 'ได้รับคะแนน INT เต็ม 5 ดาวในเควส',
      icon: '📚',
    },
    {
      name: 'นักวางแผนชั้นเซียน',
      description: 'วางแผนและดำเนินการตามแผนได้สำเร็จ',
      icon: '📝',
    },
    {
      name: 'ราชาแห่งการขาย',
      description: 'ปิดการขายได้เกินเป้า 200%',
      icon: '👑',
    },
    {
      name: 'เทพแห่งการออกแบบ',
      description: 'สร้างสรรค์งานออกแบบที่ได้รับการยกย่อง',
      icon: '✨',
    },
    {
      name: 'โปรแกรมเมอร์ผู้พิชิต',
      description: 'แก้บั๊กที่ซับซ้อนได้สำเร็จ',
      icon: '💻',
    },
    {
      name: 'นักบัญชีมือทอง',
      description: 'บริหารการเงินได้อย่างมีประสิทธิภาพ',
      icon: '💰',
    },
    {
      name: 'ช่างผู้เชี่ยวชาญ',
      description: 'ซ่อมแซมอุปกรณ์ที่เสียหายรุนแรงได้สำเร็จ',
      icon: '🔧',
    },
    {
      name: 'ผู้บุกเบิก',
      description: 'เป็นคนแรกที่ทำเควสพิเศษสำเร็จ',
      icon: '🚀',
    },
  ]

  const achievements = []

  for (const achievement of achievementData) {
    const created = await prisma.achievement.create({
      data: achievement,
    })

    achievements.push(created)
  }

  return achievements
}

// ========== ฟังก์ชันมอบ Achievement ให้กับ Character ==========
async function assignAchievements(
  characters: any[],
  achievements: any[],
  users: any[]
) {
  const characterAchievements = []

  for (const character of characters) {
    // สุ่มจำนวน Achievement ที่จะมอบให้ (1-3 รายการ)
    const numAchievements = faker.number.int({ min: 1, max: 3 })

    // สุ่มเลือก Achievement
    const selectedAchievements = faker.helpers.arrayElements(
      achievements,
      numAchievements
    )

    for (const achievement of selectedAchievements) {
      const earnedOn = faker.date.past({ years: 1 })

      const charAchievement = await prisma.characterAchievement.create({
        data: {
          characterId: character.id,
          achievementId: achievement.id,
          userId: character.userId,
          earnedOn,
        },
      })

      characterAchievements.push(charAchievement)
    }
  }

  return characterAchievements
}

// ========== ฟังก์ชันสร้าง Party ==========
// async function createParties(users: any[]) {
//   // สร้าง Party 3 ทีม
//   const partyData = [
//     {
//       name: 'ทีมนักการตลาดรุ่นใหม่',
//       description: 'กลุ่มคนรุ่นใหม่ไฟแรงที่จะพลิกโฉมวงการการตลาด',
//       imageUrl: 'https://source.unsplash.com/featured/?team,marketing',
//     },
//     {
//       name: 'ทีมพัฒนาซอฟต์แวร์',
//       description: 'ทีมโปรแกรมเมอร์ที่จะสร้างแอปที่ดีที่สุด',
//       imageUrl: 'https://source.unsplash.com/featured/?team,programming',
//     },
//     {
//       name: 'ทีมดีไซน์เนอร์สร้างสรรค์',
//       description: 'รวมตัวดีไซน์เนอร์มากความสามารถ',
//       imageUrl: 'https://source.unsplash.com/featured/?team,design',
//     },
//   ]

//   const parties = []

//   for (const partyInfo of partyData) {
//     const party = await prisma.party.create({
//       data: partyInfo,
//     })

//     // สุ่มเลือกสมาชิก 3-4 คน
//     const partySize = faker.number.int({ min: 3, max: 4 })
//     const partyMembers = faker.helpers.arrayElements(users, partySize)

//     // เพิ่มสมาชิกในทีม
//     for (let i = 0; i < partyMembers.length; i++) {
//       await prisma.partyMember.create({
//         data: {
//           partyId: party.id,
//           userId: partyMembers[i].id,
//           role: i === 0 ? 'leader' : 'member',
//         },
//       })
//     }

//     parties.push(party)
//   }

//   return parties
// }

// ========== ฟังก์ชันสร้าง Quest ==========
async function createQuests() {
  const questData = [
    // เควสประจำวัน
    {
      title: 'ตอบอีเมลลูกค้า',
      description: 'ตอบอีเมลของลูกค้า 5 ฉบับให้เรียบร้อย',
      type: 'daily',
      difficultyLevel: 1,
      xpReward: 100,
      imageUrl: 'https://source.unsplash.com/featured/?email',
      baseTokenReward: 10,
    },
    {
      title: 'จัดทำรายงานประจำวัน',
      description: 'จัดทำรายงานสรุปผลงานประจำวัน',
      type: 'daily',
      difficultyLevel: 2,
      xpReward: 150,
      imageUrl: 'https://source.unsplash.com/featured/?report',
      baseTokenReward: 15,
    },
    {
      title: 'อัพเดตความคืบหน้าโปรเจค',
      description: 'อัพเดตความคืบหน้าโปรเจคในระบบ',
      type: 'daily',
      difficultyLevel: 1,
      xpReward: 120,
      imageUrl: 'https://source.unsplash.com/featured/?update',
      baseTokenReward: 12,
    },
    {
      title: 'ประชุมทีม',
      description: 'เข้าร่วมประชุมทีมประจำวัน',
      type: 'daily',
      difficultyLevel: 1,
      xpReward: 100,
      imageUrl: 'https://source.unsplash.com/featured/?meeting',
      baseTokenReward: 10,
    },

    // เควสประจำสัปดาห์
    {
      title: 'จัดทำแผนการตลาด',
      description: 'วางแผนการตลาดสำหรับแคมเปญใหม่',
      type: 'weekly',
      difficultyLevel: 3,
      xpReward: 300,
      imageUrl: 'https://source.unsplash.com/featured/?marketing,plan',
      baseTokenReward: 30,
    },
    {
      title: 'พัฒนาฟีเจอร์ใหม่',
      description: 'พัฒนาฟีเจอร์ใหม่สำหรับแอปพลิเคชัน',
      type: 'weekly',
      difficultyLevel: 4,
      xpReward: 400,
      imageUrl: 'https://source.unsplash.com/featured/?coding',
      baseTokenReward: 40,
    },
    {
      title: 'ออกแบบโลโก้',
      description: 'ออกแบบโลโก้สำหรับโปรเจคใหม่',
      type: 'weekly',
      difficultyLevel: 3,
      xpReward: 350,
      imageUrl: 'https://source.unsplash.com/featured/?logo,design',
      baseTokenReward: 35,
    },
    {
      title: 'วิเคราะห์ข้อมูลลูกค้า',
      description: 'วิเคราะห์ข้อมูลลูกค้าเพื่อหาเทรนด์ใหม่',
      type: 'weekly',
      difficultyLevel: 3,
      xpReward: 350,
      imageUrl: 'https://source.unsplash.com/featured/?data,analysis',
      baseTokenReward: 35,
    },

    // เควสพิเศษ
    {
      title: 'ออกแบบแคมเปญใหญ่ประจำปี',
      description: 'ออกแบบและวางแผนแคมเปญใหญ่ประจำปี',
      type: 'special',
      difficultyLevel: 5,
      xpReward: 1000,
      imageUrl: 'https://source.unsplash.com/featured/?campaign',
      baseTokenReward: 100,
      maxTokenReward: 200,
    },
    {
      title: 'พัฒนาระบบหลังบ้านใหม่',
      description: 'พัฒนาระบบหลังบ้านใหม่ทั้งหมด',
      type: 'special',
      difficultyLevel: 5,
      xpReward: 1200,
      imageUrl: 'https://source.unsplash.com/featured/?backend,system',
      baseTokenReward: 120,
      maxTokenReward: 240,
    },
    {
      title: 'สร้างแบรนด์ใหม่',
      description: 'ออกแบบอัตลักษณ์แบรนด์ใหม่ทั้งหมด',
      type: 'special',
      difficultyLevel: 5,
      xpReward: 1100,
      imageUrl: 'https://source.unsplash.com/featured/?brand,identity',
      baseTokenReward: 110,
      maxTokenReward: 220,
    },
    {
      title: 'จัดงานเปิดตัวผลิตภัณฑ์',
      description: 'วางแผนและจัดงานเปิดตัวผลิตภัณฑ์ใหม่',
      type: 'special',
      difficultyLevel: 5,
      xpReward: 1000,
      imageUrl: 'https://source.unsplash.com/featured/?product,launch',
      baseTokenReward: 100,
      maxTokenReward: 200,
    },
  ]

  const quests = []

  for (const quest of questData) {
    const created = await prisma.quest.create({
      data: quest,
    })

    quests.push(created)
  }

  return quests
}

// ========== ฟังก์ชันมอบหมาย Quest ==========
async function assignQuests(characters: any[], quests: any[], users: any[]) {
  const assignedQuests = []

  for (const character of characters) {
    // สุ่มจำนวน Quest ที่จะมอบหมาย (1-3 เควส)
    const numQuests = faker.number.int({ min: 1, max: 3 })

    // สุ่มเลือก Quest
    const selectedQuests = faker.helpers.arrayElements(quests, numQuests)

    for (const quest of selectedQuests) {
      const assignedAt = faker.date.recent({ days: 7 })
      let expiresAt = null

      if (quest.type === 'daily') {
        expiresAt = new Date(assignedAt)
        expiresAt.setDate(assignedAt.getDate() + 1)
      } else if (quest.type === 'weekly') {
        expiresAt = new Date(assignedAt)
        expiresAt.setDate(assignedAt.getDate() + 7)
      } else if (quest.type === 'special') {
        expiresAt = new Date(assignedAt)
        expiresAt.setDate(assignedAt.getDate() + 30)
      }

      // สถานะแบบสุ่ม แต่ให้มีโอกาสเป็น active มากกว่า
      const statusOptions = ['active', 'completed', 'failed']
      const weightedStatus = [
        ...Array(5).fill('active'),
        'completed',
        'completed',
        'failed',
      ]
      const status = faker.helpers.arrayElement(weightedStatus) as
        | 'active'
        | 'completed'
        | 'failed'

      const assigned = await prisma.assignedQuest.create({
        data: {
          questId: quest.id,
          characterId: character.id,
          userId: character.userId,
          assignedAt,
          expiresAt,
          status,
        },
      })

      assignedQuests.push(assigned)
    }
  }

  return assignedQuests
}

// ========== ฟังก์ชัน submit Quest ==========
async function submitQuests(characters: any[], quests: any[]) {
  const questSubmissions = []

  // ดึงข้อมูล assigned quests ที่สถานะเป็น 'completed'
  const completedAssignments = await prisma.assignedQuest.findMany({
    where: { status: 'completed' },
    include: { quest: true, character: true },
  })

  for (const assignment of completedAssignments) {
    const mediaTypes = Object.values(EnumMediaType)
    const mediaType = faker.helpers.arrayElement(mediaTypes)

    let mediaUrl = null
    if (mediaType === 'image') {
      mediaUrl = `https://source.unsplash.com/featured/?work,${assignment.quest.type}`
    } else if (mediaType === 'video') {
      mediaUrl = 'https://example.com/video.mp4'
    }

    // สร้าง QuestSubmission
    const questSubmission = await prisma.questSubmission.create({
      data: {
        mediaType,
        mediaUrl,
        description: faker.lorem.paragraph({ min: 2, max: 4 }),
        // ใน MySQL, Prisma จะจัดการการแปลง array เป็น JSON string ให้อัตโนมัติ
        tags: [
          assignment.quest.title,
          assignment.quest.type,
          faker.word.adjective(),
        ],
        ratingAGI: faker.number.int({ min: 1, max: 5 }),
        ratingSTR: faker.number.int({ min: 1, max: 5 }),
        ratingDEX: faker.number.int({ min: 1, max: 5 }),
        ratingVIT: faker.number.int({ min: 1, max: 5 }),
        ratingINT: faker.number.int({ min: 1, max: 5 }),
        xpEarned: assignment.quest.xpReward,
        submittedAt: faker.date.recent({ days: 14 }),
        // เพิ่มการเชื่อมโยงกับ character
        character: {
          connect: { id: assignment.characterId },
        },
        // เพิ่มการเชื่อมโยงกับ quest
        quest: {
          connect: { id: assignment.questId },
        },
        // เพิ่มการเชื่อมโยงกับ assignedQuest
        assignedQuest: {
          connect: { id: assignment.id },
        },
      },
    })

    questSubmissions.push(questSubmission)
  }

  return questSubmissions
}

// ========== ฟังก์ชันสร้าง LevelHistory ==========
async function createLevelHistories(characters: any[]) {
  const levelHistories = []

  for (const character of characters) {
    // สร้างประวัติการเลเวลอัพ 1-3 ครั้ง
    const numHistories = faker.number.int({ min: 1, max: 3 })

    for (let i = 0; i < numHistories; i++) {
      const levelFrom = character.level - (i + 1)
      if (levelFrom <= 0) continue // ข้ามถ้าเลเวลก่อนหน้าน้อยกว่าหรือเท่ากับ 0

      const levelHistory = await prisma.levelHistory.create({
        data: {
          characterId: character.id,
          levelFrom,
          levelTo: levelFrom + 1,
          agiGained: faker.number.int({ min: 1, max: 3 }),
          strGained: faker.number.int({ min: 1, max: 3 }),
          dexGained: faker.number.int({ min: 1, max: 3 }),
          vitGained: faker.number.int({ min: 1, max: 3 }),
          intGained: faker.number.int({ min: 1, max: 3 }),
          reasoning: faker.lorem.paragraph({ min: 1, max: 3 }),
          recordedAt: faker.date.past({ years: 1, refDate: new Date() }),
        },
      })

      levelHistories.push(levelHistory)
    }
  }

  return levelHistories
}

// ========== ฟังก์ชันสร้าง FeedItem ==========
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
export async function createFeedItems(
  users: any[],
  questSubmissions: any[],
  levelHistories: any[],
  characterAchievements: any[]
) {
  const feedItems = []

  // ========== 1. FeedItem จากการส่ง QuestSubmission ==========
  for (const submission of questSubmissions) {
    const user = await prisma.user.findUnique({
      where: { id: await getUserIdFromCharacterId(submission.characterId) },
    })

    if (!user) continue

    const feedItem = await prisma.feedItem.create({
      data: {
        content: `${user.name} ได้ทำเควส "${
          (await prisma.quest.findUnique({ where: { id: submission.questId } }))
            ?.title
        }" สำเร็จและได้รับ ${submission.xpEarned} XP!`,
        type: 'quest_completion',
        mediaType: submission.mediaType,
        mediaUrl: submission.mediaUrl,
        userId: user.id,
        questSubmissionId: submission.id,
      },
    })

    feedItems.push(feedItem)
  }

  // ========== 2. FeedItem จากการเลเวลอัพ ==========
  for (const levelHistory of levelHistories) {
    const user = await prisma.user.findUnique({
      where: { id: await getUserIdFromCharacterId(levelHistory.characterId) },
    })

    if (!user) continue

    const character = await prisma.character.findUnique({
      where: { id: levelHistory.characterId },
      include: { jobClass: true },
    })

    if (!character) continue

    const feedItem = await prisma.feedItem.create({
      data: {
        content: `🎉 ${user.name} (${character.jobClass.name}) ได้เลเวลอัพจาก Lv.${levelHistory.levelFrom} เป็น Lv.${levelHistory.levelTo}! 💪 STR +${levelHistory.strGained} 🧠 INT +${levelHistory.intGained} 🏃 AGI +${levelHistory.agiGained} 🎯 DEX +${levelHistory.dexGained} ❤️ VIT +${levelHistory.vitGained}`,
        type: 'level_up',
        mediaType: 'text',
        userId: user.id,
        levelHistoryId: levelHistory.id,
      },
    })

    feedItems.push(feedItem)
  }

  // ========== 3. FeedItem จากการได้รับ Achievement ==========
  for (const charAchievement of characterAchievements) {
    const achievement = await prisma.achievement.findUnique({
      where: { id: charAchievement.achievementId },
    })

    if (!achievement) continue

    const feedItem = await prisma.feedItem.create({
      data: {
        content: `${achievement.icon} ยินดีด้วย! ${
          (
            await prisma.user.findUnique({
              where: { id: charAchievement.userId },
            })
          )?.name
        } ได้รับความสำเร็จ "${achievement.name}" - ${achievement.description}`,
        type: 'achievement',
        mediaType: 'text',
        userId: charAchievement.userId,
        achievementId: charAchievement.id,
      },
    })

    feedItems.push(feedItem)
  }

  // ========== 4. FeedItem ประเภทโพสต์ทั่วไป ==========
  const postTypes = [
    { type: 'post', content: () => faker.lorem.paragraph({ min: 1, max: 4 }) },
    {
      type: 'post',
      content: () =>
        `ขอเเชร์เทคนิค: ${faker.lorem.paragraph({ min: 2, max: 5 })}`,
    },
    {
      type: 'post',
      content: () =>
        `ปัญหาที่เจอวันนี้: ${faker.lorem.paragraph({ min: 1, max: 3 })}`,
    },
    {
      type: 'post',
      content: () =>
        `"${faker.lorem.sentence({
          min: 5,
          max: 10,
        })}" - ${faker.person.fullName()}`,
    },
    {
      type: 'post',
      content: () =>
        `ชอบประโยคนี้มาก: "${faker.lorem.sentence({ min: 5, max: 10 })}"`,
    },
    {
      type: 'post',
      content: () =>
        `วันนี้ทำงานเสร็จเร็วมาก! ${faker.lorem.sentence({ min: 3, max: 8 })}`,
    },
    {
      type: 'post',
      content: () =>
        `เพิ่งเรียนรู้เทคนิคใหม่: ${faker.lorem.paragraph({ min: 1, max: 2 })}`,
    },
  ]

  for (let i = 0; i < 10; i++) {
    const user = faker.helpers.arrayElement(users)
    const postType = faker.helpers.arrayElement(postTypes)
    const useImage = faker.datatype.boolean({ probability: 0.3 })

    const feedItem = await prisma.feedItem.create({
      data: {
        content: postType.content(),
        type: postType.type,
        mediaType: useImage ? 'image' : 'text',
        mediaUrl: useImage
          ? `https://source.unsplash.com/featured/?${faker.word.adjective()},${faker.word.noun()}`
          : null,
        userId: user.id,
      },
    })

    feedItems.push(feedItem)
  }

  // คละลำดับ feedItems ก่อนส่งกลับ
  return shuffleArray(feedItems)
}

// ========== ฟังก์ชันสร้าง Story ==========
async function createStories(users: any[]) {
  const stories = []

  // สร้าง Story สำหรับแต่ละ User
  for (const user of users) {
    // สร้าง 0-2 stories ต่อ user
    const numStories = faker.number.int({ min: 0, max: 2 })

    for (let i = 0; i < numStories; i++) {
      const mediaTypes = Object.values(EnumMediaType)
      const mediaType = faker.helpers.arrayElement(mediaTypes)

      let mediaUrl = null
      let text = null

      if (mediaType === 'text') {
        text = faker.lorem.paragraph({ min: 1, max: 2 })
      } else if (mediaType === 'image') {
        mediaUrl = `https://source.unsplash.com/featured/?story,${faker.word.adjective()}`
      } else if (mediaType === 'video') {
        mediaUrl = 'https://example.com/story-video.mp4'
      }

      // สร้าง expiresAt (24 ชั่วโมงนับจากตอนนี้)
      const createdAt = faker.date.recent({ days: 1 })
      const expiresAt = new Date(createdAt)
      expiresAt.setHours(expiresAt.getHours() + 24)

      const story = await prisma.story.create({
        data: {
          content: faker.lorem.sentence({ min: 3, max: 8 }),
          type: mediaType,
          mediaUrl,
          text,
          expiresAt,
          createdAt,
          userId: user.id,
        },
      })

      stories.push(story)
    }
  }

  return stories
}

// ========== ฟังก์ชันสร้าง Like ==========
async function createLikes(users: any[], feedItems: any[]) {
  const likes = []

  for (const feedItem of feedItems) {
    // สุ่มจำนวน Like (0-8 likes)
    const numLikes = faker.number.int({ min: 0, max: 8 })

    // เลือก user ที่จะกด Like (ไม่รวม user ที่โพสต์)
    const otherUsers = users.filter((user) => user.id !== feedItem.userId)
    const likers = faker.helpers.arrayElements(
      otherUsers,
      Math.min(numLikes, otherUsers.length)
    )

    for (const liker of likers) {
      // เช็คว่ามีการกดไลค์ไปแล้วหรือไม่
      const existingLike = await prisma.like.findFirst({
        where: {
          feedItemId: feedItem.id,
          userId: liker.id,
        },
      })

      if (!existingLike) {
        const like = await prisma.like.create({
          data: {
            feedItemId: feedItem.id,
            userId: liker.id,
          },
        })

        likes.push(like)
      }
    }
  }

  return likes
}

// ========== ฟังก์ชันสร้าง Comment ==========
async function createComments(users: any[], feedItems: any[]) {
  const comments = []

  for (const feedItem of feedItems) {
    // สุ่มจำนวน Comment (0-5 comments)
    const numComments = faker.number.int({ min: 0, max: 5 })

    for (let i = 0; i < numComments; i++) {
      // สุ่มผู้แสดงความคิดเห็น (อาจเป็นคนเดียวกับคนโพสต์ก็ได้)
      const commenter = faker.helpers.arrayElement(users)

      const comment = await prisma.comment.create({
        data: {
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          feedItemId: feedItem.id,
          userId: commenter.id,
        },
      })

      comments.push(comment)
    }
  }

  return comments
}

// ========== ฟังก์ชันสร้าง ReplyComment ==========
async function createReplyComments(users: any[], comments: any[]) {
  const replyComments = []

  for (const comment of comments) {
    // สุ่มว่าจะมีการตอบกลับหรือไม่ (30% จะมีการตอบกลับ)
    const hasReply = faker.datatype.boolean({ probability: 0.3 })

    if (hasReply) {
      // สุ่มจำนวนการตอบกลับ (1-2 replies)
      const numReplies = faker.number.int({ min: 1, max: 2 })

      for (let i = 0; i < numReplies; i++) {
        // สุ่มผู้ตอบกลับ
        const replier = faker.helpers.arrayElement(users)

        const replyComment = await prisma.replyComment.create({
          data: {
            content: faker.lorem.sentences({ min: 1, max: 2 }),
            commentId: comment.id,
            userId: replier.id,
          },
        })

        replyComments.push(replyComment)
      }
    }
  }

  return replyComments
}

// ========== ฟังก์ชันสร้าง StoryView ==========
async function createStoryViews(users: any[], stories: any[]) {
  const storyViews = []

  for (const story of stories) {
    // สุ่มจำนวนผู้ชม (1-8 views)
    const numViews = faker.number.int({ min: 1, max: 8 })

    // เลือก user ที่จะดู Story (ไม่รวม user ที่โพสต์)
    const otherUsers = users.filter((user) => user.id !== story.userId)
    const viewers = faker.helpers.arrayElements(
      otherUsers,
      Math.min(numViews, otherUsers.length)
    )

    for (const viewer of viewers) {
      // เช็คว่ามี StoryView อยู่แล้วหรือไม่
      const existingView = await prisma.storyView.findFirst({
        where: {
          storyId: story.id,
          userId: viewer.id,
        },
      })

      if (!existingView) {
        const storyView = await prisma.storyView.create({
          data: {
            storyId: story.id,
            userId: viewer.id,
          },
        })

        storyViews.push(storyView)
      }
    }
  }

  return storyViews
}

// ========== ฟังก์ชันสร้าง UserToken ==========
async function createUserTokens(users: any[]) {
  const userTokens = []

  for (const user of users) {
    const currentTokens = faker.number.int({ min: 50, max: 2000 })
    const totalEarned = currentTokens + faker.number.int({ min: 0, max: 1000 })

    const userToken = await prisma.userToken.create({
      data: {
        userId: user.id,
        currentTokens,
        totalEarnedTokens: totalEarned,
        totalSpentTokens: totalEarned - currentTokens,
      },
    })

    userTokens.push(userToken)
  }

  return userTokens
}

// ========== ฟังก์ชันช่วยเหลือ ==========
async function getUserIdFromCharacterId(characterId: number): Promise<number> {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { userId: true },
  })

  return character?.userId || 0
}

// ========== ฟังก์ชันสร้าง TokenMultiplierEvent ==========
async function createTokenMultiplierEvents() {
  const events = []

  const eventData = [
    {
      name: 'Weekend Token Boost',
      description: 'รับ token เพิ่ม 50% สำหรับทุกเควสในวันหยุดสุดสัปดาห์',
      multiplier: 1.5,
      questTypes: ['daily', 'weekly', 'special'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 วัน
      isActive: true,
    },
    {
      name: 'Special Quest Double Token',
      description: 'รับ token เป็น 2 เท่าสำหรับเควสพิเศษเท่านั้น',
      multiplier: 2.0,
      questTypes: ['special'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 วัน
      isActive: true,
    },
    {
      name: 'New Player Bonus',
      description: 'ผู้เล่นใหม่รับ token เพิ่ม 30% จากทุกเควส',
      multiplier: 1.3,
      questTypes: ['daily', 'weekly'],
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // เริ่ม 30 วันที่แล้ว
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // อีก 30 วัน
      isActive: true,
    },
  ]

  for (const data of eventData) {
    const event = await prisma.tokenMultiplierEvent.create({
      data: data,
    })
    events.push(event)
  }

  return events
}

// ========== ฟังก์ชันสร้าง TokenShopItem ==========
async function createTokenShopItems() {
  const items = []

  const shopItems = [
    {
      name: 'XP Boost 50%',
      description: 'เพิ่ม XP ที่ได้รับ 50% เป็นเวลา 24 ชั่วโมง',
      category: 'boost',
      itemType: 'xp_boost' as const,
      price: 100,
      imageUrl: 'https://source.unsplash.com/featured/?boost,experience',
      metadata: { duration: 86400, multiplier: 1.5 },
      stock: null, // ไม่จำกัด
      isActive: true,
      minLevel: 5,
    },
    {
      name: 'Token Boost 2x',
      description: 'รับ token เป็น 2 เท่าเป็นเวลา 3 วัน',
      category: 'boost',
      itemType: 'token_boost' as const,
      price: 300,
      imageUrl: 'https://source.unsplash.com/featured/?coins,gold',
      metadata: { duration: 259200, multiplier: 2.0 },
      stock: null,
      isActive: true,
      minLevel: 10,
    },
    {
      name: 'Stat Reset Scroll',
      description: 'รีเซ็ตค่า stat ทั้งหมดและแจกคะแนนใหม่',
      category: 'utility',
      itemType: 'stat_reset' as const,
      price: 500,
      imageUrl: 'https://source.unsplash.com/featured/?scroll,reset',
      metadata: {},
      stock: null,
      isActive: true,
      minLevel: 20,
    },
    {
      name: 'Portrait Pack - Legendary',
      description: 'ปลดล็อกภาพตัวละครระดับ Legendary',
      category: 'cosmetic',
      itemType: 'portrait_unlock' as const,
      price: 1000,
      imageUrl: 'https://source.unsplash.com/featured/?portrait,legendary',
      metadata: { portraitIds: ['legendary_1', 'legendary_2', 'legendary_3'] },
      stock: 50,
      isActive: true,
      minLevel: 50,
    },
    {
      name: 'Quest Skip Ticket',
      description: 'ข้ามเควสที่ไม่ต้องการทำและรับรางวัลทันที',
      category: 'utility',
      itemType: 'quest_skip' as const,
      price: 150,
      imageUrl: 'https://source.unsplash.com/featured/?ticket,skip',
      metadata: {},
      stock: null,
      isActive: true,
      maxPurchasePerUser: 5,
    },
  ]

  for (const item of shopItems) {
    const created = await prisma.tokenShopItem.create({
      data: item,
    })
    items.push(created)
  }

  return items
}

// ========== ฟังก์ชันสร้าง QuestStreak ==========
async function createQuestStreaks(users: any[]) {
  const streaks = []

  for (const user of users) {
    const lastCompleted = faker.date.recent({
      days: faker.number.int({ min: 0, max: 2 }),
    })
    const currentStreak = faker.number.int({ min: 0, max: 30 })

    const streak = await prisma.questStreak.create({
      data: {
        userId: user.id,
        currentStreak: currentStreak,
        longestStreak: currentStreak + faker.number.int({ min: 0, max: 20 }),
        lastCompletedDate: lastCompleted,
        weeklyQuests: faker.number.int({ min: 0, max: 20 }),
        monthlyQuests: faker.number.int({ min: 0, max: 100 }),
      },
    })

    streaks.push(streak)
  }

  return streaks
}

// ========== ฟังก์ชันสร้าง TokenTransaction (ประวัติการใช้ token) ==========
async function createTokenTransactions(users: any[]) {
  const transactions = []

  for (const user of users) {
    const userToken = await prisma.userToken.findUnique({
      where: { userId: user.id },
    })

    if (!userToken) continue

    // สร้างประวัติการได้รับ/ใช้ token 3-10 รายการ
    const numTransactions = faker.number.int({ min: 3, max: 10 })
    let currentBalance = 0

    for (let i = 0; i < numTransactions; i++) {
      const isEarning = faker.datatype.boolean({ probability: 0.7 }) // 70% เป็นการได้รับ
      const amount = isEarning
        ? faker.number.int({ min: 10, max: 200 })
        : -faker.number.int({ min: 50, max: 300 })

      const types = isEarning
        ? [
            'quest_completion',
            'streak_bonus',
            'level_up_reward',
            'achievement_reward',
          ]
        : ['shop_purchase']

      const type = faker.helpers.arrayElement(types) as any

      currentBalance += amount

      const transaction = await prisma.tokenTransaction.create({
        data: {
          userId: user.id,
          amount: amount,
          type: type,
          description: getTransactionDescription(type, amount),
          balanceBefore: currentBalance - amount,
          balanceAfter: currentBalance,
          createdAt: faker.date.recent({ days: 30 }),
        },
      })

      transactions.push(transaction)
    }
  }

  return transactions
}

// ฟังก์ชันช่วยสร้างคำอธิบาย transaction
function getTransactionDescription(type: string, amount: number): string {
  const descriptions: Record<string, string> = {
    quest_completion: `ได้รับ ${Math.abs(amount)} tokens จากการทำเควสสำเร็จ`,
    streak_bonus: `โบนัส ${Math.abs(amount)} tokens จากการทำเควสติดต่อกัน`,
    level_up_reward: `รางวัล ${Math.abs(amount)} tokens จากการเลเวลอัพ`,
    achievement_reward: `รางวัล ${Math.abs(amount)} tokens จากความสำเร็จ`,
    shop_purchase: `ซื้อสินค้าในร้านค้า ใช้ ${Math.abs(amount)} tokens`,
  }

  return (
    descriptions[type] || `Token transaction: ${amount > 0 ? '+' : ''}${amount}`
  )
}

async function createRewardItems() {
  const rewardItems = [
    {
      name: 'Gift Card',
      subtitle: '$10 Value',
      description: 'บัตรของขวัญมูลค่า $10 สำหรับใช้ซื้อสินค้าออนไลน์',
      category: 'voucher',
      itemType: 'gift_card',
      icon: 'Gift',
      imageUrl: '/images/gift-card.png',
      color: 'from-orange-400 to-red-500',
      tokenCost: 500,
      gachaCost: 50,
      stock: null,
      isActive: true,
      rarity: 'common' as const,
      gachaProbability: 0.4,
      metadata: {
        value: 10,
        currency: 'USD',
      },
    },
    {
      name: 'Day Off',
      subtitle: 'Paid Leave',
      description: 'วันหยุดพิเศษ 1 วัน (Paid Leave)',
      category: 'leave',
      itemType: 'day_off',
      icon: 'Sun',
      color: 'from-yellow-400 to-orange-500',
      tokenCost: 1000,
      gachaCost: 50,
      stock: null,
      isActive: true,
      rarity: 'uncommon' as const,
      gachaProbability: 0.3,
      metadata: {
        days: 1,
        type: 'paid',
      },
    },
    {
      name: 'Smartwatch',
      subtitle: 'Apple Watch',
      description: 'Apple Watch Series 9 สีดำ',
      category: 'gadget',
      itemType: 'smartwatch',
      icon: 'Watch',
      imageUrl: '/images/smartwatch.png',
      color: 'from-gray-700 to-gray-900',
      tokenCost: 20000,
      gachaCost: 50,
      stock: 5,
      isActive: true,
      rarity: 'rare' as const,
      gachaProbability: 0.05,
      metadata: {
        brand: 'Apple',
        model: 'Series 9',
        color: 'Black',
      },
    },
    {
      name: 'Electric Scooter',
      subtitle: 'E-Scooter',
      description: 'สกูตเตอร์ไฟฟ้า Xiaomi Mi Electric Scooter Pro 2',
      category: 'vehicle',
      itemType: 'scooter',
      icon: 'Zap',
      imageUrl: '/images/electric-scooter.png',
      color: 'from-purple-500 to-indigo-600',
      tokenCost: 15000,
      gachaCost: 50,
      stock: 3,
      isActive: true,
      rarity: 'epic' as const,
      gachaProbability: 0.02,
      metadata: {
        brand: 'Xiaomi',
        model: 'Mi Electric Scooter Pro 2',
        maxSpeed: 25,
        range: 45,
      },
    },
  ]

  const createdRewards = []

  for (const reward of rewardItems) {
    const created = await prisma.rewardItem.create({
      data: reward,
    })
    createdRewards.push(created)
  }

  return createdRewards
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // ปิดการเชื่อมต่อกับ Prisma Client
    await prisma.$disconnect()
  })
