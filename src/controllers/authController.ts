import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists!" });

    const passHashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        email,
        password: passHashed
    })

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    res.json({ accessToken, refreshToken })
}

export const login = async (req: Request, res: Response) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Email!" });

    const passMatch = await bcrypt.compare(password, user?.password);
    if (!passMatch) return res.status(400).json({ msg: "Invalid Password!" })

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    res.json({ accessToken, refreshToken })
}

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body

    try {
        const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string)

        const user = await User.findById(decoded?.id);
        if (!user || user?.refreshToken !== refreshToken) {
            return res.status(403).json({ msg: "Invalid token" });
        }

        const accessToken = generateAccessToken(user);

        res.json({ accessToken });

    } catch (error) {
        res.status(403).json({ msg: "Expired token" });

    }
}

export const logout = async (req: Request, res: Response) => {
  const { userId } = req.body;

  await User.findByIdAndUpdate(userId, { refreshToken: null });

  res.json({ msg: "Logged out!" });
};