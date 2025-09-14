const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function checkDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("🔗 Connected to MongoDB")

    // ดูฐานข้อมูลทั้งหมด
    const adminDb = client.db().admin()
    const databases = await adminDb.listDatabases()

    console.log("\n📊 Available databases:")
    databases.databases.forEach((db) => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`)
    })

    // ตรวจสอบฐานข้อมูลเป้าหมาย
    const dbName = "lcc_sports_new"
    const targetDb = client.db(dbName)

    console.log(`\n🎯 Checking database: ${dbName}`)

    // ดู collections
    const collections = await targetDb.listCollections().toArray()
    console.log(`📁 Collections (${collections.length}):`)

    for (const collection of collections) {
      const coll = targetDb.collection(collection.name)
      const count = await coll.countDocuments()
      console.log(`   - ${collection.name}: ${count} documents`)
    }

    // ตรวจสอบข้อมูลอุปกรณ์
    const equipment = targetDb.collection("equipment")
    const equipmentCount = await equipment.countDocuments()

    if (equipmentCount > 0) {
      console.log(`\n🏀 Equipment items: ${equipmentCount}`)
      const items = await equipment.find({}).toArray()
      items.forEach((item) => {
        console.log(`   - ${item.name} (${item.available}/${item.total})`)
      })
    } else {
      console.log("\n❌ No equipment found!")
    }

    // ตรวจสอบผู้ใช้
    const users = targetDb.collection("users")
    const userCount = await users.countDocuments()
    console.log(`\n👤 Users: ${userCount}`)
  } catch (error) {
    console.error("❌ Error checking database:", error)
  } finally {
    await client.close()
    console.log("\n🔌 Disconnected from MongoDB")
  }
}

checkDatabase()
