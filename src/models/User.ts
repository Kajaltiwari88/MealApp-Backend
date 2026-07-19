import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  refreshToken?: string | null;
}

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
