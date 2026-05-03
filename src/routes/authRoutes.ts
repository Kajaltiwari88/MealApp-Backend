import { Router } from "express";
import { login, logout, refreshToken, signup, verifyOtp } from "../controllers/authController";

const router =Router();

router.post("/signup",signup);
router.post("/verify-otp", verifyOtp);
router.post("/login",login);
router.post("refresh-token",refreshToken);
router.post("logout",logout);

export default router;