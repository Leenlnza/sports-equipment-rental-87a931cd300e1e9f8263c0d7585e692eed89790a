const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function dropOldDatabases() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("🔗 Connected to MongoDB")

    // รายชื่อฐานข้อมูลที่จะลบ
    const databasesToDrop = ["lcc_sport", "sports_equipment", "test"]

    for (const dbName of databasesToDrop) {
      try {
        const db = client.db(dbName)
        await db.dropDatabase()
        console.log(`🗑️  Dropped database: ${dbName}`)
      } catch (error) {
        console.log(`ℹ️  Database ${dbName} doesn't exist or already dropped`)
      }
    }

    console.log("✅ Old databases cleaned up!")
  } catch (error) {
    console.error("❌ Error dropping databases:", error)
  } finally {
    await client.close()
    console.log("🔌 Disconnected from MongoDB")
  }
}

dropOldDatabases()
