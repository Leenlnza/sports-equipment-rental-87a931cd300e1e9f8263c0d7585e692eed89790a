import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { jwtVerify } from "jose"
import { ObjectId } from "mongodb"

// GET: ดึงประวัติการยืมของผู้ใช้
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const token = authHeader.split(" ")[1]
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    let userId: string

    try {
      const { payload } = await jwtVerify(token, secret)
      if (!payload.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      userId = payload.userId as string
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("lcc_sports_new")
    const borrowRecords = db.collection("borrow_records")
    const equipments = db.collection("equipment")

    const records = await borrowRecords.find({ userId }).sort({ borrowedAt: -1 }).toArray()

    const mappedRecords = await Promise.all(
      records.map(async (r) => {
        let equipmentName = "ไม่ระบุชื่อ"
        if (r.equipmentId) {
          const eq = await equipments.findOne({ _id: new ObjectId(r.equipmentId) })
          if (eq?.name) equipmentName = eq.name
        }
        return {
          _id: r._id,
          equipmentName,
          borrowDate: r.borrowDate || r.borrowedAt,
          returnDate: r.returnDate,
          actualReturnDate: r.actualReturnDate,
          status: r.status,
        }
      })
    )

    return NextResponse.json(mappedRecords)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST: ยืมอุปกรณ์
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { equipmentId } = body

    if (!equipmentId) return NextResponse.json({ error: "EquipmentId required" }, { status: 400 })

    let objectId: ObjectId
    try {
      objectId = new ObjectId(equipmentId)
    } catch {
      return NextResponse.json({ error: "EquipmentId ไม่ถูกต้อง" }, { status: 400 })
    }

    const authHeader = req.headers.get("authorization")
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const token = authHeader.split(" ")[1]
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    let userId: string
    try {
      const { payload } = await jwtVerify(token, secret)
      if (!payload.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      userId = payload.userId as string
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("lcc_sports_new")
    const borrowRecords = db.collection("borrow_records")
    const equipments = db.collection("equipment")

    // เช็คจำนวนอุปกรณ์ที่ผู้ใช้ยืม
    const borrowedCount = await borrowRecords.countDocuments({ userId, status: "borrowed" })
    if (borrowedCount >= 2)
      return NextResponse.json({ error: "คุณยืมอุปกรณ์ได้ไม่เกิน 2 ชิ้น" }, { status: 400 })

    // ตรวจสอบอุปกรณ์
    const equipment = await equipments.findOne({ _id: objectId })
    if (!equipment || equipment.available <= 0)
      return NextResponse.json({ error: "อุปกรณ์ไม่พร้อมใช้งาน" }, { status: 400 })

    // กำหนดคืน 7 วันหลังยืม
    const now = new Date()
    const returnDate = new Date()
    returnDate.setDate(now.getDate() + 7)

    // สร้าง borrow record
    await borrowRecords.insertOne({
      userId,
      equipmentId: objectId,
      status: "borrowed",
      borrowedAt: now,
      borrowDate: now,
      returnDate, // ✅ เพิ่ม field กำหนดคืน
    })

    // ลดจำนวน available ของอุปกรณ์
    await equipments.updateOne({ _id: objectId }, { $inc: { available: -1 } })

    return NextResponse.json({ message: "ยืมอุปกรณ์เรียบร้อยแล้ว" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
