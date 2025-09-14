const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function testAPI() {
  if (!uri || uri.includes("username:password")) {
    console.error("❌ Please set MONGODB_URI in .env.local")
    return
  }

  const client = new MongoClient(uri)

  try {
    console.log("🔗 Testing MongoDB connection...")
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("lcc_sports_new")
    console.log("📊 Database:", db.databaseName)

    const users = db.collection("users")

    // Test 1: Check existing users
    console.log("\n📋 Test 1: Checking existing users...")
    const userCount = await users.countDocuments()
    console.log(`👥 Total users: ${userCount}`)

    if (userCount > 0) {
      const sampleUser = await users.findOne()
      console.log("👤 Sample user:", {
        name: sampleUser.name,
        email: sampleUser.email,
        grade: sampleUser.grade,
        branch: sampleUser.branch,
      })
    }

    // Test 2: Create test user
    console.log("\n📋 Test 2: Creating test user...")
    const testEmail = "test@lcc.ac.th"

    // Delete existing test user
    await users.deleteOne({ email: testEmail })

    const hashedPassword = await bcrypt.hash("123456", 12)
    const testUser = {
      name: "ผู้ใช้ทดสอบ",
      email: testEmail,
      password: hashedPassword,
      grade: "pvs1",
      branch: "accounting",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(testUser)
    console.log("✅ Test user created with ID:", result.insertedId)

    // Test 3: Verify user can be found
    console.log("\n📋 Test 3: Verifying user...")
    const foundUser = await users.findOne({ email: testEmail })
    console.log("👤 User found:", foundUser ? "Yes" : "No")

    if (foundUser) {
      console.log("📧 Email:", foundUser.email)
      console.log("👤 Name:", foundUser.name)
      console.log("🎓 Grade:", foundUser.grade)
      console.log("🏢 Branch:", foundUser.branch)
    }

    // Test 4: Test password verification
    console.log("\n📋 Test 4: Testing password verification...")
    if (foundUser) {
      const isPasswordValid = await bcrypt.compare("123456", foundUser.password)
      console.log("🔐 Password verification:", isPasswordValid ? "✅ Valid" : "❌ Invalid")
    }

    console.log("\n🎉 All tests completed!")
    console.log("🔑 Test account: test@lcc.ac.th / 123456")
  } catch (error) {
    console.error("❌ Test failed:", error)
  } finally {
    await client.close()
    console.log("🔌 Disconnected from MongoDB")
  }
}

testAPI()
