import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("DB connected ✅");
  } catch (error) {
    console.error("DB connection error ❌", error);
  }
};