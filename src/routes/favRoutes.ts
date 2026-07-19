import { Router } from "express";
import {
  addfavorite,
  getFavorites,
  removeFavorites,
} from "../controllers/favController";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/add-favorites", verifyToken, addfavorite);

router.get("/get-favorites", verifyToken, getFavorites);

router.delete("/remove-favorites/:mealId", verifyToken, removeFavorites);

export default router;
