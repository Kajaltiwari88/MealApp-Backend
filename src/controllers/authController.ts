import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import jwt from "jsonwebtoken";
import { generateOtp } from "../utils/helpers";
import { sendEmail } from "../utils/sendEmail";
import { redis } from "../config/redis";


export const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists!" });

    const passHashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await redis.set(
      `signup:${email}`,
      JSON.stringify({
        fullName,
        email,
        password: passHashed,
        otp: hashedOtp,
        otpExpiry: Date.now() + 60 * 1000,
      }),
      {
        EX: 600,
      },
    );
    const value = await redis.get(`signup:${email}`);
    console.log("REDIS VALUE:", value);

    try {
      await sendEmail(email, otp);
    } catch (emailError) {
      res.status(500).json({
        message: "Could not send otp!",
      });
    }
    res.status(201).json({
      message: "Signup successful. OTP sent to email.",
      email,
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed!",
      error,
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const data = await redis.get(`signup:${email}`);

    if (!data) {
      return res.status(400).json({
        message: "OTP expired. Please signup again.",
      });
    }

    const pendingUser = JSON.parse(data);

    if (Date.now() > pendingUser?.otpExpiry) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }
    const otpMatched = await bcrypt.compare(otp, pendingUser?.otp);

    if (!otpMatched) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const exists = await User.findOne({
      email,
    });

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      fullName: pendingUser?.fullName,
      email: pendingUser?.email,
      password: pendingUser?.password,
    });
    const accessToken = generateAccessToken(user._id.toString());

    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;

    await user.save();
    await redis.del(`signup:${email}`);

    return res.status(201).json({
      message: "Email verified successfully, Logged In!",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Verification failed",
      error,
    });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const key = `signup:${email.trim().toLowerCase()}`;

    const data = await redis.get(key);

    if (!data) {
      return res.status(400).json({
        message: "Signup session expired. Please signup again.",
      });
    }

    const pendingUser = JSON.parse(data);

    const otp = generateOtp();
    const hashOTP = await bcrypt.hash(otp, 10);
    pendingUser.otp = hashOTP;
    pendingUser.otpExpiry = Date.now() + 60 * 1000;

    await redis.set(`signup:${email}`, JSON.stringify(pendingUser), {
      EX: 600,
    });

    await sendEmail(email, otp);

    return res.status(200).json({
      message: "OTP resent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to resend OTP.",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found!" });

    const passMatch = await bcrypt.compare(password, user?.password);
    if (!passMatch)
      return res.status(400).json({ message: "Invalid Password!" });

    const accessToken = generateAccessToken(user._id.toString());

    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;

    await user.save();

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user?._id,
        fullName: user?.fullName,
        email: user?.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET as string,
    );

    const user = await User.findById(decoded?.id);
    if (!user || user?.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const accessToken = generateAccessToken(user._id.toString());

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: "Expired token" });
  }
};

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
};
