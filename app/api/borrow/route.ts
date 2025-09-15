import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { jwtVerify } from "jose"
import { ObjectId } from "mongodb"

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

    const records = await borrowRecords
      .find({ userId })
      .sort({ borrowedAt: -1 })
      .toArray()

    return NextResponse.json(records)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { equipmentId } = body

    if (!equipmentId) 
      return NextResponse.json({ error: "EquipmentId required" }, { status: 400 })

    // แปลง string เป็น ObjectId
    let objectId: ObjectId
    try {
      objectId = new ObjectId(equipmentId)
    } catch {
      return NextResponse.json({ error: "EquipmentId ไม่ถูกต้อง" }, { status: 400 })
    }

    // ตรวจสอบ token
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
    const borrowedCount = await borrowRecords.countDocuments({
      userId,
      status: "borrowed",
    })
    if (borrowedCount >= 2) {
      return NextResponse.json({ error: "คุณยืมอุปกรณ์ได้ไม่เกิน 2 ชิ้น" }, { status: 400 })
    }

    // ตรวจสอบอุปกรณ์ว่ามีอยู่และพร้อมใช้งาน
    const equipment = await equipments.findOne({ _id: objectId })
    if (!equipment || equipment.available <= 0) {
      return NextResponse.json({ error: "อุปกรณ์ไม่พร้อมใช้งาน" }, { status: 400 })
    }

    // สร้าง borrow record
    await borrowRecords.insertOne({
      userId,
      equipmentId: objectId,
      status: "borrowed",
      borrowedAt: new Date(),
    })

    // ลดจำนวน available ของอุปกรณ์
    await equipments.updateOne(
      { _id: objectId },
      { $inc: { available: -1 } }
    )

    return NextResponse.json({ message: "ยืมอุปกรณ์เรียบร้อยแล้ว" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
