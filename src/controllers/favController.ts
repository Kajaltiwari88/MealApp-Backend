import { Request, Response } from "express";
import Favorite from "../models/favorite";

export const addfavorite = async (req: Request, res: Response) => {
  try {
    const userId = (res.locals as { userId: string }).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unautorized",
      });
    }

    const { mealId, mealName, mealImage, category } = req.body;

    const alreadyExists = await Favorite.findOne({
      user: userId,
      mealId,
    });

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Recipe already saved.",
      });
    }

    const fav = await Favorite.create({
      user: userId,
      mealId,
      mealName,
      mealImage,
      category,
    });

    return res.status(201).json({
      success: true,
      message: "Recipe saved successfully.",
      data: fav,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (res.locals as { userId: string }).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unautorized",
      });
    }

    const fav = await Favorite.findOne({
      user: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: fav,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const removeFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (res.locals as { userId: string }).userId;

    const { mealId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unautorized",
      });
    }
    await Favorite.findOneAndDelete({
      user: userId,
      mealId,
    });

    return res.status(200).json({
      success: true,
      message: "Recipe removed from favorities successfully!",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
