import { authController } from "@/controllers";
import { authMiddleware } from "@/middleware";
import express, { Router } from "express";

const authRoute: Router = express.Router();

authRoute.post("/register", authController.register);
authRoute.post("/verify-email", authController.verifyEmail);
authRoute.post(
  "/resend-email-verification",
  authController.resendEmailVerification
);
authRoute.post("/login", authController.login);
authRoute.post("/refresh", authController.refreshToken);
authRoute.post("/resend-otp", authMiddleware, authController.resendOtp);
authRoute.post("/verify-otp", authMiddleware, authController.verifyOtp);
authRoute.post("/forgot-password", authController.forgotPassword);
authRoute.post("/reset-password", authController.resetPassword);

export { authRoute };
