const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf8');
  envText.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI missing in .env");
  process.exit(1);
}

// Inline Mongoose models to verify directly
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  techStack: [String],
  availability: String,
  bio: String,
});

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String, default: '' },
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  seen: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

async function runVerification() {
  console.log("--- STARTING E2E VERIFICATION SCRIPT ---");

  // Step 1: Verify Mongoose DB Connection
  console.log("1. Connecting to MongoDB...");
  const opts = {
    bufferCommands: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
  };
  await mongoose.connect(MONGODB_URI, opts);
  console.log("✅ MongoDB Connected! readyState =", mongoose.connection.readyState);

  // Step 2: Clean or prepare 2 test users
  console.log("\n2. Setting up test users...");
  const timestamp = Date.now();
  const user1Data = {
    name: "Sender User",
    username: `sender_${timestamp}`,
    email: `sender_${timestamp}@test.com`,
    password: await bcrypt.hash("password123", 10),
  };
  const user2Data = {
    name: "Receiver User",
    username: `receiver_${timestamp}`,
    email: `receiver_${timestamp}@test.com`,
    password: await bcrypt.hash("password123", 10),
  };

  const user1 = await User.create(user1Data);
  const user2 = await User.create(user2Data);

  console.log("✅ User 1 Created:", user1._id.toString(), user1.name);
  console.log("✅ User 2 Created:", user2._id.toString(), user2.name);

  // Step 3: Create Chat Thread
  console.log("\n3. Creating Chat Thread between User 1 & User 2...");
  const chat = await Chat.create({
    participants: [user1._id, user2._id],
    lastMessage: 'Hello from sender!',
  });
  console.log("✅ Chat Created:", chat._id.toString());

  // Step 4: Send Messages (User 1 -> User 2 and User 2 -> User 1)
  console.log("\n4. Sending messages...");
  const msg1 = await Message.create({
    chatId: chat._id,
    senderId: user1._id,
    content: "hello",
    seen: false,
  });

  const msg2 = await Message.create({
    chatId: chat._id,
    senderId: user2._id,
    content: "yooo",
    seen: false,
  });

  console.log("✅ Message 1 sent by User 1:", msg1._id.toString(), msg1.content);
  console.log("✅ Message 2 sent by User 2:", msg2._id.toString(), msg2.content);

  // Step 5: Simulate API serialization & frontend isMe evaluation for USER 1 perspective
  console.log("\n5. Testing alignment evaluation from USER 1 perspective...");
  const rawMessages = await Message.find({ chatId: chat._id }).populate('senderId').lean();

  const formattedMessages = rawMessages.map((msg) => {
    const extractedSenderId = msg.senderId?._id
      ? msg.senderId._id.toString()
      : typeof msg.senderId === 'object' && msg.senderId !== null
      ? (msg.senderId.id ? String(msg.senderId.id) : String(msg.senderId._id || msg.senderId))
      : String(msg.senderId);

    return {
      id: msg._id.toString(),
      chatId: msg.chatId.toString(),
      senderId: extractedSenderId,
      sender: {
        id: extractedSenderId,
        name: msg.senderId?.name || 'User',
      },
      content: msg.content,
    };
  });

  const user1SessionId = user1._id.toString();
  console.log("User 1 Session ID:", user1SessionId);

  formattedMessages.forEach((msg) => {
    const currentUserId = user1SessionId ? String(user1SessionId) : null;
    const rawSender = msg.senderId || msg.sender?.id;
    const msgSenderId =
      typeof rawSender === "object" && rawSender !== null
        ? String(rawSender._id || rawSender.id || "")
        : String(rawSender || "");

    const isMe = Boolean(currentUserId && msgSenderId && currentUserId === msgSenderId);

    console.log(`- Message "${msg.content}" (Sender ID: ${msgSenderId}): isMe = ${isMe} -> Alignment: ${isMe ? "RIGHT (Sent)" : "LEFT (Received)"}`);

    if (msg.content === "hello" && !isMe) {
      throw new Error(`FAILED! Message 'hello' sent by User 1 should evaluate to isMe=true from User 1's view!`);
    }
    if (msg.content === "yooo" && isMe) {
      throw new Error(`FAILED! Message 'yooo' sent by User 2 should evaluate to isMe=false from User 1's view!`);
    }
  });
  console.log("✅ USER 1 alignment test PASSED!");

  // Step 6: Simulate API serialization & frontend isMe evaluation for USER 2 perspective
  console.log("\n6. Testing alignment evaluation from USER 2 perspective...");
  const user2SessionId = user2._id.toString();
  console.log("User 2 Session ID:", user2SessionId);

  formattedMessages.forEach((msg) => {
    const currentUserId = user2SessionId ? String(user2SessionId) : null;
    const rawSender = msg.senderId || msg.sender?.id;
    const msgSenderId =
      typeof rawSender === "object" && rawSender !== null
        ? String(rawSender._id || rawSender.id || "")
        : String(rawSender || "");

    const isMe = Boolean(currentUserId && msgSenderId && currentUserId === msgSenderId);

    console.log(`- Message "${msg.content}" (Sender ID: ${msgSenderId}): isMe = ${isMe} -> Alignment: ${isMe ? "RIGHT (Sent)" : "LEFT (Received)"}`);

    if (msg.content === "hello" && isMe) {
      throw new Error(`FAILED! Message 'hello' sent by User 1 should evaluate to isMe=false from User 2's view!`);
    }
    if (msg.content === "yooo" && !isMe) {
      throw new Error(`FAILED! Message 'yooo' sent by User 2 should evaluate to isMe=true from User 2's view!`);
    }
  });
  console.log("✅ USER 2 alignment test PASSED!");

  // Cleanup test documents
  await User.deleteMany({ _id: { $in: [user1._id, user2._id] } });
  await Chat.deleteOne({ _id: chat._id });
  await Message.deleteMany({ chatId: chat._id });
  await mongoose.disconnect();

  console.log("\n🎉 ALL E2E BACKEND & ALIGNMENT LOGIC VERIFICATIONS PASSED SUCCESSFULLY!");
}

runVerification().catch((err) => {
  console.error("❌ VERIFICATION ERROR:", err);
  process.exit(1);
});
