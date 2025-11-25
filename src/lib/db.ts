// src/lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

if (!global.__mongoose) {
  global.__mongoose = { conn: null, promise: null };
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in Vercel project settings"
    );
  }

  const cached = global.__mongoose!;
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    }) as Promise<typeof mongoose>;
  }

  cached.conn = await cached.promise;
  return cached.conn;
}