const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const client = new MongoClient(uri)

async function seedEquipment() {
  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("sports_equipment")
    const equipment = db.collection("equipment")

    // Clear existing equipment
    await equipment.deleteMany({})

    // Seed equipment data
    const equipmentData = [
      {
        name: "ลูกบาสเกตบอล",
        category: "บาสเกตบอล",
        description: "ลูกบาสเกตบอลมาตรฐาน สำหรับการเล่นและฝึกซ้อม",
        total: 10,
        available: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ลูกวอลเลย์บอล",
        category: "วอลเลย์บอล",
        description: "ลูกวอลเลย์บอลสำหรับการแข่งขันและฝึกซ้อม",
        total: 8,
        available: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ลูกฟุตบอล",
        category: "ฟุตบอล",
        description: "ลูกฟุตบอลมาตรฐาน FIFA สำหรับการเล่นและฝึกซ้อม",
        total: 8,
        available: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ลูกเกลี้ยง",
        category: "เปตอง",
        description: "ลูกเกลี้ยงสำหรับเล่นเปตอง ผิวเรียบ",
        total: 15,
        available: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ลูกลาย",
        category: "เปตอง",
        description: "ลูกลายสำหรับเล่นเปตอง มีลายบนผิวลูก",
        total: 10,
        available: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const result = await equipment.insertMany(equipmentData)
    console.log(`Inserted ${result.insertedCount} equipment items`)
  } catch (error) {
    console.error("Error seeding equipment:", error)
  } finally {
    await client.close()
  }
}

seedEquipment()
