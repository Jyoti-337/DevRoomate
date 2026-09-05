const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/MONGODB_URI=(.+)/);
const uri = match ? match[1].trim() : 'mongodb://127.0.0.1:27017/devroommate';

const testAccount = {
  name: "Integration Test User",
  username: "testuser_" + Date.now(),
  email: `test_${Date.now()}@example.com`,
  password: "Password123!",
  techStack: ["TypeScript", "Next.js", "MongoDB"],
  availability: "Full-time",
  bio: "Automated test account"
};

async function testSignupAndVerify() {
  console.log("1. Sending POST request to http://localhost:3000/api/auth/signup...");
  const res = await fetch("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testAccount)
  });

  const status = res.status;
  const data = await res.json();
  console.log(`HTTP Status: ${status}`);
  console.log("Response Body:", data);

  if (status !== 201) {
    throw new Error(`Signup failed with status ${status}`);
  }

  console.log("\n2. Verifying user exists directly in MongoDB...");
  await mongoose.connect(uri);
  const userInDb = await mongoose.connection.db.collection('users').findOne({ email: testAccount.email });

  if (!userInDb) {
    throw new Error("User was NOT found in MongoDB!");
  }

  console.log("SUCCESS! User found in MongoDB:");
  console.log(" - ID:", userInDb._id.toString());
  console.log(" - Name:", userInDb.name);
  console.log(" - Email:", userInDb.email);
  console.log(" - Username:", userInDb.username);

  await mongoose.disconnect();
}

testSignupAndVerify().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
