import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const client = await clientPromise
    const db = client.db("lcc_sports_new")
    const equipment = db.collection("equipment")

    let query = {}
    if (category && category !== "all") {
      query = { category }
    }

    const equipmentList = await equipment.find(query).toArray()

    return NextResponse.json(equipmentList)
  } catch (error) {
    console.error("Equipment fetch error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์" }, { status: 500 })
  }
}
