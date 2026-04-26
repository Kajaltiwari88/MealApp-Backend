import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { IUser } from "../models/User";

const accessSecret: Secret = process.env.ACCESS_SECRET as string;
const refreshSecret: Secret = process.env.REFRESH_SECRET as string;

export const generateAccessToken = (user: IUser): string => {
  const options: SignOptions = {
    expiresIn: process.env.ACCESS_EXPIRY as SignOptions["expiresIn"]
  };

  return jwt.sign({ id: user._id }, accessSecret, options);
};

export const generateRefreshToken = (user: IUser): string => {
  const options: SignOptions = {
    expiresIn: process.env.REFRESH_EXPIRY as SignOptions["expiresIn"]
  };

  return jwt.sign({ id: user._id }, refreshSecret, options);
};