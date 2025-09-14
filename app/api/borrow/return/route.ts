import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    // Get token from header
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const userId = decoded.userId

    const body = await request.json()
    const { borrowRecordId } = body

    const client = await clientPromise
    const db = client.db("lcc_sports_new") // จะใช้ชื่อจาก MONGODB_URI อัตโนมัติ
    const equipment = db.collection("equipment")
    const borrowRecords = db.collection("borrow_records")

    console.log("Database name:", db.databaseName)
    console.log("Debug: borrowRecordId =", borrowRecordId)
    console.log("Debug: userId =", userId)

    console.log("Collection name:", borrowRecords.collectionName)
    const count = await borrowRecords.countDocuments()
    console.log("Total documents in collection:", count)


    // Find the borrow record
    const borrowRecord = await borrowRecords.findOne({
      _id: new ObjectId(borrowRecordId),
      userId: new ObjectId(userId),
      status: "borrowed",
    })

    console.log("Debug: borrowRecord =", borrowRecord)

    if (!borrowRecord) {
      return NextResponse.json({ error: "ไม่พบรายการยืมที่ต้องการคืน" }, { status: 404 })
    }

    // Update borrow record
    await borrowRecords.updateOne(
      { _id: new ObjectId(borrowRecordId) },
      {
        $set: {
          status: "returned",
          actualReturnDate: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    // Update equipment availability
    await equipment.updateOne(
      { _id: new ObjectId(borrowRecord.equipmentId) },
      {
        $inc: { available: 1 },
        $set: { updatedAt: new Date() },
      },
    )

    return NextResponse.json({
      message: "คืนอุปกรณ์สำเร็จ",
    })
  } catch (error) {
    console.error("Return error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการคืนอุปกรณ์" }, { status: 500 })
  }
}
