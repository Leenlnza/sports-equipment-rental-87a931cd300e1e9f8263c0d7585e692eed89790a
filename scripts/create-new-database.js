const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = "lcc_sports_new" // ชื่อฐานข้อมูลใหม่

async function createNewDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("🔗 Connected to MongoDB")

    const db = client.db(dbName)

    // สร้าง Collections
    console.log("📁 Creating collections...")

    // 1. สร้าง users collection
    const users = db.collection("users")
    await users.createIndex({ email: 1 }, { unique: true })
    console.log("✅ Created users collection with email index")

    // 2. สร้าง equipment collection
    const equipment = db.collection("equipment")
    await equipment.createIndex({ name: 1, category: 1 })
    console.log("✅ Created equipment collection with name/category index")

    // 3. สร้าง borrow_records collection
    const borrowRecords = db.collection("borrow_records")
    await borrowRecords.createIndex({ userId: 1, status: 1 })
    await borrowRecords.createIndex({ equipmentId: 1 })
    console.log("✅ Created borrow_records collection with indexes")

    // เพิ่มข้อมูลอุปกรณ์เริ่มต้น
    console.log("🏀 Adding initial equipment data...")

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

    // สร้างผู้ใช้ admin (ตัวอย่าง)
    console.log("👤 Creating admin user...")

    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash("admin123", 12)

    const adminUser = {
      name: "ผู้ดูแลระบบ",
      email: "admin@lcc.ac.th",
      password: hashedPassword,
      grade: "admin",
      branch: "admin",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      await users.insertOne(adminUser)
      console.log("✅ Created admin user (admin@lcc.ac.th / admin123)")
    } catch (error) {
      if (error.code === 11000) {
        console.log("ℹ️  Admin user already exists")
      } else {
        console.error("❌ Error creating admin user:", error.message)
      }
    }

    console.log("\n🎉 Database created successfully!")
    console.log(`📊 Database name: ${dbName}`)
    console.log(`🔗 Connection string: ${uri}/${dbName}`)
    console.log("\n📋 Collections created:")
    console.log("   - users (with email index)")
    console.log("   - equipment (with name/category index)")
    console.log("   - borrow_records (with userId/status indexes)")
    console.log(`\n🏀 Equipment added: ${equipmentData.length} items`)
    console.log("👤 Admin user: admin@lcc.ac.th / admin123")
  } catch (error) {
    console.error("❌ Error creating database:", error)
  } finally {
    await client.close()
    console.log("🔌 Disconnected from MongoDB")
  }
}

createNewDatabase()
