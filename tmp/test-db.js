const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/MONGODB_URI=(.+)/);
const uri = match ? match[1].trim() : 'mongodb://127.0.0.1:27017/devroommate';

console.log('Connecting to:', uri);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 4000,
}).then((m) => {
  console.log('SUCCESS: Connected to MongoDB!');
  console.log('Host:', m.connection.host);
  console.log('Port:', m.connection.port);
  console.log('Database Name:', m.connection.name);
  console.log('ReadyState:', m.connection.readyState);
  process.exit(0);
}).catch((err) => {
  console.error('FAILURE:', err.message);
  process.exit(1);
});
