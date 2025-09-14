import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get token from header
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const userId = decoded.userId

    const client = await clientPromise
    const db = client.db()
    const users = db.collection("users")

    // Get user profile
    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }, // ไม่ส่ง password กลับ
    )

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { name, grade, branch, phone, address } = body

    const client = await clientPromise
    const db = client.db()
    const users = db.collection("users")

    // Update user profile
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          name,
          grade,
          branch,
          phone,
          address,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 })
    }

    // Get updated user data
    const updatedUser = await users.findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })

    return NextResponse.json({
      message: "อัปเดตโปรไฟล์สำเร็จ",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์" }, { status: 500 })
  }
}
