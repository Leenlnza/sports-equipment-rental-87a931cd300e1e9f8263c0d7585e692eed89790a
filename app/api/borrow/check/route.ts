import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { jwtVerify } from "jose"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const token = authHeader.split(" ")[1]
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    let userId: string
    try {
      const { payload } = await jwtVerify(token, secret)
      if (!payload.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      userId = payload.userId as string
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("lcc_sports_new")
    const borrowRecords = db.collection("borrow_records")

    // นับจำนวนอุปกรณ์ที่ผู้ใช้ยืม (status = "borrowed")
    const borrowedCount = await borrowRecords.countDocuments({
      userId,
      status: "borrowed",
    })

    return NextResponse.json({ borrowedCount })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
