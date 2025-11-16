import mongoose from "mongoose";

let isConnected = false; 

export const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("❌ MongoDB connection string (MONGO_URI) is missing in .env.local");
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connection.readyState === 1;

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw new Error("Error connecting to MongoDB");
  }
};
