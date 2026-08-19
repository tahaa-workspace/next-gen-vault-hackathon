import mongoose from 'mongoose';
import { config } from './env.js';

let bucket = null;

export async function connectDB() {
  const conn = await mongoose.connect(config.mongoUri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  initBucket(conn.connection.db);
  return conn;
}

export function initBucket(db) {
  if (!bucket) {
    bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'vaultFiles',
    });
  }
  return bucket;
}

export function getBucket() {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized');
  }
  return bucket;
}
