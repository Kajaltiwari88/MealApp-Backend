import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("DB connected ✅");
  } catch (error) {
    console.error("DB connection error ❌", error);
  }
};