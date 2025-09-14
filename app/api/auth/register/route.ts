import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Register API called")

    const body = await request.json()
    console.log("📝 Registration data:", { ...body, password: "***" })

    const { name, email, password, grade, branch } = body

    // Validate required fields
    if (!name || !email || !password || !grade || !branch) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    console.log("🔗 Connecting to MongoDB...")
    const client = await clientPromise
    const db = client.db("lcc_sports_new")
    const users = db.collection("users")

    console.log("📊 Database connected:", db.databaseName)

    // Check if user already exists
    console.log("🔍 Checking if user exists...")
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      console.log("❌ User already exists")
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 })
    }

    // Hash password
    console.log("🔐 Hashing password...")
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      grade,
      branch,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("💾 Inserting user into database...")
    const result = await users.insertOne(newUser)
    console.log("✅ User created with ID:", result.insertedId)

    // Verify insertion
    const insertedUser = await users.findOne({ _id: result.insertedId })
    console.log("✅ User verified in database:", insertedUser ? "Found" : "Not found")

    return NextResponse.json({
      message: "สมัครสมาชิกสำเร็จ",
      userId: result.insertedId,
    })
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการสมัครสมาชิก",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
