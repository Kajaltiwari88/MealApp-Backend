import { Document, Types } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  refreshToken?: string | null;
}

export interface IFavorite extends Document {
  user: Types.ObjectId;

  mealId: string;
  mealName: string;
  mealImage: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
