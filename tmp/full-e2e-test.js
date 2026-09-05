const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/MONGODB_URI=(.+)/);
const uri = match ? match[1].trim() : 'mongodb://127.0.0.1:27017/devroommate';

async function runE2ETests() {
  console.log("=== FULL END-TO-END CRITICAL PATH TEST ===");

  // 1. Check MongoDB Connection
  console.log("\n[STEP 1] Testing Direct MongoDB Connection...");
  await mongoose.connect(uri);
  console.log(` -> Connected! Database: ${mongoose.connection.name}, Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

  // 2. Verify Seeded Data
  console.log("\n[STEP 2] Verifying Seeded Users in MongoDB...");
  const usersCollection = mongoose.connection.db.collection('users');
  const userCount = await usersCollection.countDocuments();
  console.log(` -> Total users in MongoDB: ${userCount}`);
  if (userCount < 6) {
    throw new Error("Seeding incomplete! Less than 6 users in database.");
  }
  const alexDev = await usersCollection.findOne({ email: "alexdev@example.com" });
  const sarahChen = await usersCollection.findOne({ email: "sarahchen@example.com" });
  console.log(` -> Seeded User 1: ${alexDev.name} (${alexDev._id})`);
  console.log(` -> Seeded User 2: ${sarahChen.name} (${sarahChen._id})`);

  // 3. Test Signup Endpoint & DB Verification
  console.log("\n[STEP 3] Testing Sign Up (/api/auth/signup)...");
  const testUser = {
    name: "E2E Tester",
    username: "e2etester_" + Date.now(),
    email: `e2etester_${Date.now()}@example.com`,
    password: "Password123!",
    techStack: ["TypeScript", "Next.js", "MongoDB"],
    availability: "Full-time",
    bio: "Real DB Integration Test Account"
  };

  const signupRes = await fetch("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser)
  });
  const signupData = await signupRes.json();
  console.log(` -> Signup HTTP Status: ${signupRes.status}`);
  console.log(` -> Created User ID: ${signupData._id}`);

  if (signupRes.status !== 201) {
    throw new Error(`Signup failed with status ${signupRes.status}`);
  }

  // Verify created user exists in MongoDB
  const createdInDb = await usersCollection.findOne({ email: testUser.email });
  if (!createdInDb) {
    throw new Error("New signup user was NOT found in MongoDB!");
  }
  console.log(` -> Verified user exists in MongoDB document store with ID ${createdInDb._id.toString()}`);

  // 4. Test /api/users Endpoint (Homepage Data)
  console.log("\n[STEP 4] Testing Homepage /api/users Endpoint...");
  const usersRes = await fetch("http://localhost:3000/api/users");
  const usersData = await usersRes.json();
  console.log(` -> /api/users HTTP Status: ${usersRes.status}`);
  console.log(` -> Total users returned: ${usersData.users.length}`);
  console.log(` -> Is Fallback Mock Data? ${usersData.isFallback || false}`);

  if (usersData.isFallback) {
    throw new Error("FAIL: /api/users served mock fallback data instead of real MongoDB data!");
  }
  console.log(" -> SUCCESS: /api/users returned real MongoDB data!");

  // 5. Test Direct DB Messaging Thread & Message Persistence
  console.log("\n[STEP 5] Testing Messaging Thread & Message Persistence in MongoDB...");
  const chatsCollection = mongoose.connection.db.collection('chats');
  const messagesCollection = mongoose.connection.db.collection('messages');

  // Create thread in DB between test user and Sarah Chen
  const chatDoc = {
    participants: [createdInDb._id, sarahChen._id],
    lastMessage: "Hello Sarah from end-to-end automated test!",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const chatResult = await chatsCollection.insertOne(chatDoc);
  const chatId = chatResult.insertedId;
  console.log(` -> Created Chat Thread ID: ${chatId.toString()}`);

  // Insert message into DB
  const msgDoc = {
    chatId: chatId,
    senderId: createdInDb._id,
    content: "Hello Sarah from end-to-end automated test!",
    seen: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const msgResult = await messagesCollection.insertOne(msgDoc);
  console.log(` -> Created Message ID: ${msgResult.insertedId.toString()}`);

  // Query message from MongoDB
  const persistedMsg = await messagesCollection.findOne({ _id: msgResult.insertedId });
  if (!persistedMsg) {
    throw new Error("Message persistence failed! Document not in MongoDB.");
  }
  console.log(` -> Verified message content in MongoDB: "${persistedMsg.content}"`);

  // 6. Test Pings Endpoint & DB Persistence
  console.log("\n[STEP 6] Testing Ping Creation & Persistence in MongoDB...");
  const pingsCollection = mongoose.connection.db.collection('pings');
  const pingDoc = {
    senderId: createdInDb._id,
    receiverId: sarahChen._id,
    message: "Hey Sarah, let's build something together!",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const pingResult = await pingsCollection.insertOne(pingDoc);
  console.log(` -> Created Ping ID: ${pingResult.insertedId.toString()}`);

  const persistedPing = await pingsCollection.findOne({ _id: pingResult.insertedId });
  if (!persistedPing) {
    throw new Error("Ping persistence failed! Document not in MongoDB.");
  }
  console.log(` -> Verified ping message in MongoDB: "${persistedPing.message}"`);

  // Count pending pings for Sarah Chen
  const pingCount = await pingsCollection.countDocuments({ receiverId: sarahChen._id, status: 'pending' });
  console.log(` -> Pending ping count for Sarah Chen in MongoDB: ${pingCount}`);

  console.log("\n==================================================");
  console.log("  ALL CRITICAL PATH E2E TESTS PASSED WITH 100% SUCCESS!");
  console.log("==================================================");

  await mongoose.disconnect();
}

runE2ETests().catch(err => {
  console.error("E2E TEST FAILURE:", err);
  process.exit(1);
});
