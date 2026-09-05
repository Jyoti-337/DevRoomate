const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/devroommate');
  
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ name: String, email: String }));
  const Chat = mongoose.models.Chat || mongoose.model('Chat', new mongoose.Schema({ participants: [mongoose.Schema.Types.ObjectId], lastMessage: String, updatedAt: Date }));
  const Message = mongoose.models.Message || mongoose.model('Message', new mongoose.Schema({ chatId: mongoose.Schema.Types.ObjectId, senderId: mongoose.Schema.Types.ObjectId, content: String, seen: Boolean }, { timestamps: true }));

  const users = await User.find().limit(2);
  if (users.length < 2) {
    console.log('Need at least 2 users');
    process.exit(0);
  }

  let chat = await Chat.findOne({ participants: { $all: [users[0]._id, users[1]._id] } });
  if (!chat) {
    chat = await Chat.create({ participants: [users[0]._id, users[1]._id], lastMessage: 'Test init', updatedAt: new Date() });
  }

  const msg = await Message.create({ chatId: chat._id, senderId: users[0]._id, content: 'Hello test message from script', seen: false });
  chat.lastMessage = msg.content;
  chat.updatedAt = new Date();
  await chat.save();

  console.log('MESSAGE_TEST_SUCCESS:', { chatId: chat._id, msgId: msg._id, content: msg.content });
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
