import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return NextResponse.json({
      status: 'error',
      reason: 'MONGODB_URI environment variable is missing or empty in process.env!'
    }, { status: 500 });
  }

  // Mask password for safe output
  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');

  try {
    const startTime = Date.now();
    
    // Test direct mongoose connection with 8s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      bufferCommands: false,
    });

    const pingTime = Date.now() - startTime;
    const dbState = mongoose.connection.readyState;
    
    // Count users to verify db read capability
    const userCount = await mongoose.connection.db?.collection('users').countDocuments();

    return NextResponse.json({
      status: 'success',
      maskedUri,
      pingTimeMs: pingTime,
      connectionReadyState: dbState, // 1 = connected
      atlasUserCount: userCount
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'connection_failed',
      maskedUri,
      errorName: error?.name,
      errorMessage: error?.message,
      errorCode: error?.code,
      cause: error?.cause ? String(error.cause) : null
    }, { status: 500 });
  }
}
