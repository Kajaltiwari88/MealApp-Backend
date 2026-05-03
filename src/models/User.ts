import mongoose, { Document } from "mongoose";


export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    isVerified: boolean;
    otp: string | null;
    otpExpiry: Date | null;
    refreshToken?: string | null;
}

const userSchema = new mongoose.Schema<IUser>({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isVerified: {
        type: Boolean,
        default: false,
    },

    otp: {
        type: String,
        default: null,
    },

    otpExpiry: {
        type: Date,
        default: null,
    },
    refreshToken: String
}, { timestamps: true })

export default mongoose.model<IUser>("User", userSchema);