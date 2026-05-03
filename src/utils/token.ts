import jwt, { Secret, SignOptions } from "jsonwebtoken";

const accessSecret: Secret = process.env.ACCESS_SECRET as string;
const refreshSecret: Secret = process.env.REFRESH_SECRET as string;

export const generateAccessToken = (
  userId: string
): string => {
  const options: SignOptions = {
    expiresIn:
      process.env.ACCESS_EXPIRY as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { userId },
    accessSecret,
    options
  );
};

export const generateRefreshToken = (
  userId: string
): string => {
  const options: SignOptions = {
    expiresIn:
      process.env.REFRESH_EXPIRY as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { userId },
    refreshSecret,
    options
  );
};