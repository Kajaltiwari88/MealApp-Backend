import mongoose from "mongoose";
import { IUser } from "../types";

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    refreshToken: String,
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", userSchema);
