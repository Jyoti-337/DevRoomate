import mongoose from 'mongoose';

/**
 * Global cache across hot-reloads in development / warm lambdas in serverless.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("[MONGODB_ERROR] MONGODB_URI is not defined in process.env!");
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }

  const readyState = mongoose.connection.readyState;

  // 1 = connected: Return existing active connection
  if (cached.conn && readyState === 1) {
    return cached.conn;
  }

  // 2 = connecting: Await in-flight promise if present
  if (readyState === 2 && cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err: any) {
      console.error("[MONGODB_CONNECT_RETRY_FAIL]", err?.name, err?.message);
      cached.promise = null;
      cached.conn = null;
      throw err;
    }
  }

  // 0 = disconnected or 3 = disconnecting: Reset cache & re-establish connection
  if (readyState === 0 || readyState === 3 || !cached.promise) {
    cached.conn = null;
    cached.promise = null;

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // 15 seconds for serverless cold starts & Atlas discovery
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 0,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("[MONGODB_CONNECT_SUCCESS] Connected to MongoDB Atlas");
        return mongooseInstance;
      })
      .catch((err: any) => {
        if (err?.name === 'MongooseServerSelectionError' || err?.message?.includes('whitelisted')) {
          console.error("[ATLAS_IP_WHITELIST_ERROR] Atlas connection rejected! Ensure 0.0.0.0/0 (Allow Access from Anywhere) is ACTIVE in Atlas -> Security -> Network Access.");
        } else {
          console.error("[MONGODB_CONNECT_FAIL]", err?.name, err?.message, err?.code);
        }
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e: any) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
}

export default connectToDatabase;
