const { MongoClient } = require("mongodb")

// ใส่ MongoDB URI ของคุณตรงนี้
const uri = "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lcc_sports_new"
const dbName = "lcc_sports_new"

async function forceCreateDatabase() {
  if (!uri || uri.includes("username:password")) {
    console.error("❌ Please update the MongoDB URI in this script")
    console.log("🔧 Replace 'username:password@cluster0.xxxxx.mongodb.net' with your actual MongoDB Atlas URI")
    console.log("📋 You can find your URI in MongoDB Atlas > Connect > Connect your application")
    return
  }

  const client = new MongoClient(uri)

  try {
    console.log("🔗 Connecting to MongoDB Atlas...")
    await client.connect()
    console.log("✅ Connected successfully!")

    const db = client.db(dbName)
    console.log(`📊 Working with database: ${dbName}`)

    // สร้าง collection และเพิ่มข้อมูลทันที
    console.log("🏀 Creating equipment collection with data...")

    const equipment = db.collection("equipment")

    // ลบข้อมูลเก่า (ถ้ามี)
    await equipment.deleteMany({})

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

    // เพิ่มข้อมูลอุปกรณ์
    const equipmentResult = await equipment.insertMany(equipmentData)
    console.log(`✅ Inserted ${equipmentResult.insertedCount} equipment items`)

    // สร้าง users collection
    console.log("👤 Creating users collection...")
    const users = db.collection("users")

    // ลบข้อมูลเก่า
    await users.deleteMany({})

    // สร้าง index
    await users.createIndex({ email: 1 }, { unique: true })

    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash("123456", 12)

    const testUsers = [
      {
        name: "ผู้ใช้ทดสอบ",
        email: "test@lcc.ac.th",
        password: hashedPassword,
        grade: "pvs1",
        branch: "accounting",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ผู้ดูแลระบบ",
        email: "admin@lcc.ac.th",
        password: await bcrypt.hash("admin123", 12),
        grade: "admin",
        branch: "admin",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const userResult = await users.insertMany(testUsers)
    console.log(`✅ Inserted ${userResult.insertedCount} users`)

    // สร้าง borrow_records collection
    console.log("📋 Creating borrow_records collection...")
    const borrowRecords = db.collection("borrow_records")

    // สร้าง indexes
    await borrowRecords.createIndex({ userId: 1, status: 1 })
    await borrowRecords.createIndex({ equipmentId: 1 })

    // เพิ่มข้อมูลตัวอย่าง 1 รายการ
    const sampleBorrowRecord = {
      userId: userResult.insertedIds[0],
      equipmentId: equipmentResult.insertedIds[0],
      equipmentName: "ลูกบาสเกตบอล",
      borrowDate: new Date(),
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "returned",
      actualReturnDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await borrowRecords.insertOne(sampleBorrowRecord)
    console.log("✅ Created borrow_records collection with sample data")

    // ตรวจสอบผลลัพธ์
    console.log("\n🔍 Final verification...")
    const equipmentCount = await equipment.countDocuments()
    const userCount = await users.countDocuments()
    const borrowCount = await borrowRecords.countDocuments()

    console.log(`📊 Equipment items: ${equipmentCount}`)
    console.log(`👤 Users: ${userCount}`)
    console.log(`📋 Borrow records: ${borrowCount}`)

    console.log("\n🎉 Database created successfully!")
    console.log(`📊 Database: ${dbName}`)
    console.log(`🏀 Equipment: ${equipmentCount} items`)
    console.log(`👤 Users: ${userCount} users`)
    console.log(`📋 Records: ${borrowCount} records`)

    console.log("\n🔑 Test accounts:")
    console.log("   - test@lcc.ac.th / 123456")
    console.log("   - admin@lcc.ac.th / admin123")

    console.log("\n💡 Now refresh MongoDB Compass to see the database!")
  } catch (error) {
    console.error("❌ Error creating database:", error.message)

    if (error.message.includes("authentication failed")) {
      console.log("\n🔧 Fix: Check your MongoDB Atlas username/password")
    }
    if (error.message.includes("IP")) {
      console.log("\n🔧 Fix: Add your IP to MongoDB Atlas whitelist")
    }
    if (error.message.includes("ENOTFOUND")) {
      console.log("\n🔧 Fix: Check your internet connection and MongoDB Atlas cluster URL")
    }
  } finally {
    await client.close()
    console.log("\n🔌 Disconnected from MongoDB")
  }
}

forceCreateDatabase()
