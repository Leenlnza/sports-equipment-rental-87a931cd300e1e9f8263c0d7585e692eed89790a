import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Login API called")

    const body = await request.json()
    console.log("📝 Login attempt for:", body.email)

    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 })
    }

    console.log("🔗 Connecting to MongoDB...")
    const client = await clientPromise
    const db = client.db("lcc_sports_new")
    const users = db.collection("users")

    console.log("📊 Database connected:", db.databaseName)

    // Find user
    console.log("🔍 Looking for user...")
    const user = await users.findOne({ email })
    console.log("👤 User found:", user ? "Yes" : "No")

    if (!user) {
      console.log("❌ User not found")
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
    }

    // Check password
    console.log("🔐 Checking password...")
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("🔐 Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("❌ Invalid password")
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
    }

    // Create JWT token
    console.log("🎫 Creating JWT token...")
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    console.log("✅ Login successful")

    return NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
