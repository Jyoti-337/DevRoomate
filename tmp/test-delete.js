const mongoose = require('mongoose');

async function testDelete() {
  await mongoose.connect('mongodb://127.0.0.1:27017/devroommate');
  
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ name: String, username: String, email: String }));
  const Ping = mongoose.models.Ping || mongoose.model('Ping', new mongoose.Schema({ senderId: mongoose.Schema.Types.ObjectId, receiverId: mongoose.Schema.Types.ObjectId, status: String }));
  const Chat = mongoose.models.Chat || mongoose.model('Chat', new mongoose.Schema({ participants: [mongoose.Schema.Types.ObjectId] }));
  const Message = mongoose.models.Message || mongoose.model('Message', new mongoose.Schema({ senderId: mongoose.Schema.Types.ObjectId, content: String }));

  // Create a temporary user to delete
  const tempUser = await User.create({ name: 'Temp Delete User', username: 'tempdelete123', email: 'tempdelete@example.com' });
  const otherUser = await User.findOne({ email: { $ne: 'tempdelete@example.com' } });

  // Create dummy ping, chat, and message for this temp user
  const tempPing = await Ping.create({ senderId: tempUser._id, receiverId: otherUser._id, status: 'pending' });
  const tempChat = await Chat.create({ participants: [tempUser._id, otherUser._id] });
  const tempMsg = await Message.create({ senderId: tempUser._id, content: 'Test msg to delete' });

  console.log('BEFORE_DELETE:', {
    userExists: !!(await User.findById(tempUser._id)),
    pingExists: !!(await Ping.findById(tempPing._id)),
    chatExists: !!(await Chat.findById(tempChat._id)),
    msgExists: !!(await Message.findById(tempMsg._id))
  });

  // Perform cascade deletion
  const userId = tempUser._id;
  await Promise.all([
    User.findByIdAndDelete(userId),
    Ping.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
    Chat.deleteMany({ participants: userId }),
    Message.deleteMany({ senderId: userId })
  ]);

  console.log('AFTER_DELETE:', {
    userExists: !!(await User.findById(tempUser._id)),
    pingExists: !!(await Ping.findById(tempPing._id)),
    chatExists: !!(await Chat.findById(tempChat._id)),
    msgExists: !!(await Message.findById(tempMsg._id))
  });

  process.exit(0);
}

testDelete().catch(console.error);
