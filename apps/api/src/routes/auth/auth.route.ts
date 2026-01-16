import { authController } from "@/controllers";
import { authMiddleware, rateLimiter } from "@/middleware";
import express, { Router } from "express";

const authRoute: Router = express.Router();

/**
 * Public – sensitive
 */
authRoute.post(
  "/register",
  rateLimiter({ windowMs: 10 * 60 * 1000, max: 3 }),
  authController.register
);

authRoute.post(
  "/verify-email",
  rateLimiter({ windowMs: 5 * 60 * 1000, max: 5 }),
  authController.verifyEmail
);

authRoute.post(
  "/resend-email-verification",
  rateLimiter({ windowMs: 5 * 60 * 1000, max: 3 }),
  authController.resendEmailVerification
);

authRoute.post(
  "/login",
  rateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many login attempts",
  }),
  authController.login
);

authRoute.post(
  "/refresh",
  rateLimiter({ windowMs: 60 * 1000, max: 30 }),
  authController.refreshToken
);

authRoute.post(
  "/logout",
  authMiddleware,
  rateLimiter({ windowMs: 10 * 60 * 1000, max: 3 }),
  authController.logout
);

/**
 * Authenticated – user based
 */
authRoute.post(
  "/resend-otp",
  authMiddleware,
  rateLimiter({ windowMs: 60 * 1000, max: 5 }),
  authController.resendOtp
);

authRoute.post(
  "/verify-otp",
  authMiddleware,
  rateLimiter({ windowMs: 60 * 1000, max: 10 }),
  authController.verifyOtp
);

/**
 * Password reset – brute force protection
 */
authRoute.post(
  "/forgot-password",
  rateLimiter({ windowMs: 10 * 60 * 1000, max: 3 }),
  authController.forgotPassword
);

authRoute.post(
  "/reset-password",
  rateLimiter({ windowMs: 10 * 60 * 1000, max: 3 }),
  authController.resetPassword
);

export { authRoute };
