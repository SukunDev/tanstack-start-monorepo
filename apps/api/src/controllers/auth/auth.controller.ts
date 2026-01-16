import { AuthRequest } from "@/interfaces";
import { authService } from "@/services";
import {
  ForgotPasswordSchema,
  LoginSchema,
  RefreshTokenSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  VerifyOtpSchema,
  ResendEmailVerificationSchema,
} from "@packages/shared";
import { Request, Response } from "express";

class AuthController {
  register = async (req: Request, res: Response) => {
    const body = RegisterSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        code: 400,
        message: "Validation failed",
        errors: body.error.flatten().fieldErrors,
      });
    }
    const response = await authService.register(
      body.data.email,
      body.data.password
    );
    return res.status(response.code).json(response);
  };

  verifyEmail = async (req: Request, res: Response) => {
    const body = VerifyEmailSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        code: 400,
        message: "Validation failed",
        errors: body.error.flatten().fieldErrors,
      });
    }
    const response = await authService.verifyEmail(
      body.data["verification-token"]
    );
    return res.status(response.code).json(response);
  };

  resendEmailVerification = async (req: Request, res: Response) => {
    const body = ResendEmailVerificationSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        code: 400,
        message: "Validation failed",
        errors: body.error.flatten().fieldErrors,
      });
    }
    const response = await authService.resendEmailVerification(body.data.email);
    return res.status(response.code).json(response);
  };

  login = async (req: Request, res: Response) => {
    const body = LoginSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        code: 400,
        message: "Validation failed",
        errors: body.error.flatten().fieldErrors,
      });
    }
    const response = await authService.login(
      body.data.email,
      body.data.password
    );
    return res.status(response.code).json(response);
  };

  refreshToken = async (req: AuthRequest, res: Response) => {
    const body = RefreshTokenSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        code: 400,
        message: "Validation failed",
        errors: body.error.flatten().fieldErrors,
      });
    }
    const response = await authService.refreshToken(body.data["refresh-token"]);
    return res.status(response.code).json(response);
  };

  verifyOtp = async (req: AuthRequest, res: Response) => {
    const body = VerifyOtpSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        code: 400,
        message: "Validation failed",
        errors: body.error.flatten().fieldErrors,
      });
    }
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized",
        data: null,
      });
    }
    const userId = req.user?.id;
    const response = await authService.verifyOtp(body.data.otp, userId, token);
    return res.status(response.code).json(response);
  };

  resendOtp = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized",
        data: null,
      });
    }
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized",
        data: null,
      });
    }
    const response = await authService.resendOtp(userId, token);
    return res.status(response.code).json(response);
  };

  forgotPassword = async (req: Request, res: Response) => {
    const body = ForgotPasswordSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        code: 400,
        message: "Validation failed",
        errors: body.error.flatten().fieldErrors,
      });
    }
    const response = await authService.forgotPassword(body.data.email);
    return res.status(response.code).json(response);
  };

  resetPassword = async (req: Request, res: Response) => {
    const body = ResetPasswordSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        code: 400,
        message: "Validation failed",
        errors: body.error.flatten().fieldErrors,
      });
    }
    const response = await authService.resetPassword(
      body.data["verification-token"],
      body.data["new-password"]
    );
    return res.status(response.code).json(response);
  };
}

export default new AuthController();
