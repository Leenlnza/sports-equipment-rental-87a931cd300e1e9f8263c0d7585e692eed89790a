const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = "lcc_sports_new"

async function createNewDatabase() {
  const client = new MongoClient(uri)

  try {
    console.log("🔗 Connecting to MongoDB...")
    await client.connect()
    console.log("✅ Connected successfully!")

    const db = client.db(dbName)
    console.log(`📊 Working with database: ${dbName}`)

    // ลบข้อมูลเก่าก่อน (ถ้ามี)
    console.log("🗑️  Clearing old data...")
    try {
      await db.collection("equipment").deleteMany({})
      await db.collection("users").deleteMany({})
      await db.collection("borrow_records").deleteMany({})
      console.log("✅ Old data cleared")
    } catch (error) {
      console.log("ℹ️  No old data to clear")
    }

    // สร้าง Collections และ Indexes
    console.log("📁 Creating collections and indexes...")

    const users = db.collection("users")
    await users.createIndex({ email: 1 }, { unique: true })
    console.log("✅ Users collection ready")

    const equipment = db.collection("equipment")
    await equipment.createIndex({ name: 1, category: 1 })
    console.log("✅ Equipment collection ready")

    const borrowRecords = db.collection("borrow_records")
    await borrowRecords.createIndex({ userId: 1, status: 1 })
    await borrowRecords.createIndex({ equipmentId: 1 })
    console.log("✅ Borrow records collection ready")

    // เพิ่มข้อมูลอุปกรณ์
    console.log("🏀 Adding equipment data...")

    const equipmentData = [
      {
        name: "ลูกบาสเกตบอล",
        category: "บาสเกตบอล",
        description: "ลูกบาสเกตบอลมาตรฐาน สำหรับการเล่นและฝึกซ้อม",
        total: 15,
        available: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ห่วงบาสเกตบอล",
        category: "บาสเกตบอล",
        description: "ห่วงบาสเกตบอลแบบพกพา สำหรับฝึกซ้อม",
        total: 4,
        available: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ลูกวอลเลย์บอล",
        category: "วอลเลย์บอล",
        description: "ลูกวอลเลย์บอลสำหรับการแข่งขันและฝึกซ้อม",
        total: 12,
        available: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ตาข่ายวอลเลย์บอล",
        category: "วอลเลย์บอล",
        description: "ตาข่ายวอลเลย์บอลมาตรฐาน พร้อมเสาตั้ง",
        total: 2,
        available: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ลูกฟุตบอล",
        category: "ฟุตบอล",
        description: "ลูกฟุตบอลมาตรฐาน FIFA สำหรับการเล่นและฝึกซ้อม",
        total: 20,
        available: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ประตูฟุตบอล",
        category: "ฟุตบอล",
        description: "ประตูฟุตบอลแบบพกพา สำหรับฝึกซ้อม",
        total: 4,
        available: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ลูกเกลี้ยง",
        category: "เปตอง",
        description: "ลูกเกลี้ยงสำหรับเล่นเปตอง ผิวเรียบ",
        total: 20,
        available: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ลูกลาย",
        category: "เปตอง",
        description: "ลูกลายสำหรับเล่นเปตอง มีลายบนผิวลูก",
        total: 15,
        available: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ลูกเป้า",
        category: "เปตอง",
        description: "ลูกเป้าสำหรับเล่นเปตอง ขนาดเล็ก",
        total: 10,
        available: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const result = await equipment.insertMany(equipmentData)
    console.log(`✅ Inserted ${result.insertedCount} equipment items`)

    // สร้างผู้ใช้ทดสอบ
    console.log("👤 Creating test user...")

    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash("123456", 12)

    const testUser = {
      name: "ผู้ใช้ทดสอบ",
      email: "test@lcc.ac.th",
      password: hashedPassword,
      grade: "pvs1",
      branch: "accounting",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      await users.insertOne(testUser)
      console.log("✅ Test user created (test@lcc.ac.th / 123456)")
    } catch (error) {
      if (error.code === 11000) {
        console.log("ℹ️  Test user already exists")
      } else {
        console.error("❌ Error creating test user:", error.message)
      }
    }

    // ตรวจสอบผลลัพธ์
    console.log("\n🔍 Verifying database...")
    const equipmentCount = await equipment.countDocuments()
    const userCount = await users.countDocuments()

    console.log(`📊 Equipment items: ${equipmentCount}`)
    console.log(`👤 Users: ${userCount}`)

    if (equipmentCount > 0) {
      console.log("\n🎉 Database created successfully!")
      console.log(`📊 Database: ${dbName}`)
      console.log(`🔗 URI: ${uri}`)
      console.log(`🏀 Equipment: ${equipmentCount} items`)
      console.log(`👤 Users: ${userCount} users`)
    } else {
      console.log("\n❌ Database creation failed - no equipment found")
    }
  } catch (error) {
    console.error("❌ Error creating database:", error)
  } finally {
    await client.close()
    console.log("\n🔌 Disconnected from MongoDB")
  }
}

createNewDatabase()
