import { MongoClient } from 'mongodb';

const uri = process.env.NEXT_PUBLIC_MONGODB_URL || "mongodb+srv://hiddenguy:8YXnTmTRwTlIrVZI@project1.rvwfnr9.mongodb.net/?retryWrites=true&w=majority&appName=Project1";

// MongoDB connection options with better timeout and retry settings
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  connectTimeoutMS: 10000,
  maxIdleTimeMS: 30000,
};

let client;
let clientPromise: Promise<MongoClient>;

// if (!process.env.NEXT_PUBLIC_MONGODB_URL) {
//   throw new Error("Please add your Mongo URI to .env");
// }

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, create a new client for each request to avoid connection issues
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Helper to get the correct DB
export async function getDb() {
  const client = await clientPromise;
  return client.db("premiere-stays"); // <-- use your main db name here
} 