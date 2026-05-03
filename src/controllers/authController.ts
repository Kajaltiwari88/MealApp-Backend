import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import jwt from "jsonwebtoken";
import { generateOtp } from "../utils/helpers";
import { sendEmail } from "../utils/sendEmail";

export const signup = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists!" });

        const passHashed = await bcrypt.hash(password, 10);
        const otp = generateOtp();

        const user = await User.create({
            fullName,
            email,
            password: passHashed,
            isVerified: false,
            otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        })

        try {
            await sendEmail(email, otp);
        } catch (emailError) {
            console.log(
                "Email sending failed:",
                emailError
            );
        }
        res.status(201).json({
            message: "Signup successful. OTP sent to email.",
        });

    } catch (error) {
        res.status(500).json({
            message: "Signup failed!",
            error,
        });
    }
}

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        if (
            user.otpExpiry &&
            user.otpExpiry < new Date()
        ) {
            return res.status(400).json({
                message: "OTP expired",
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null as any;

        await user.save();

        res.status(200).json({
            message: "Email verified successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Verification failed",
            error,
        });
    }
}
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User Not Found!" });

        if (!user?.isVerified) {
            return res.status(400).json({
                message: "Please verify your email first",
            });
        }

        const passMatch = await bcrypt.compare(password, user?.password);
        if (!passMatch) return res.status(400).json({ message: "Invalid Password!" })


        const accessToken = generateAccessToken(
            user._id.toString()
        );

        const refreshToken = generateRefreshToken(
            user._id.toString()
        );

        user.refreshToken = refreshToken;

        await user.save();

        res.json({
            message: "Login successful", accessToken, refreshToken, user: {
                id: user?._id,
                fullName: user?.fullName,
                email: user?.email,
            },
        })

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error,
        });
    }
}

export const refreshToken = async (req: Request, res: Response) => {

    try {
        const { refreshToken } = req.body
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token missing",
            });
        }
        const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string)

        const user = await User.findById(decoded?.id);
        if (!user || user?.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid token" });
        }

        const accessToken = generateAccessToken(user._id.toString());

        res.json({ accessToken });

    } catch (error) {
        res.status(403).json({ message: "Expired token" });

    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        await User.findByIdAndUpdate(userId, { refreshToken: null });

        res.json({ message: "Logged out!" });

    } catch (error) {
        res.status(500).json({
            message: "Logout failed",
            error,
        });
    }
}