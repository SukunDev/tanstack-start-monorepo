import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Service } from "../service";
import { prisma } from "@packages/database";
import { emailLib } from "@packages/email";
import {
  ACCESS_TOKEN_EXPIRE,
  VERIFICATION_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE,
  SALT_ROUNDS,
  EMAIL_RATE_LIMIT_MINUTES,
} from "@packages/shared";
import crypto from "crypto";
import { secureRandomString } from "@/utils/secureRandomString";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

const APPS_URL = process.env.APP_URL!;
if (!APPS_URL) throw new Error("APPS_URL is not set");

class AuthService extends Service {
  private checkEmailRateLimit = async (
    userId: number,
    purpose: "LOGIN" | "VERIFY_EMAIL" | "RESET_PASSWORD"
  ): Promise<{ allowed: boolean; waitTime?: number }> => {
    const recentEmail = await prisma.userVerification.findFirst({
      where: {
        userId,
        purpose,
        createdAt: {
          gte: new Date(Date.now() - EMAIL_RATE_LIMIT_MINUTES * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentEmail) {
      const timeSinceLastEmail = Date.now() - recentEmail.createdAt.getTime();
      const waitTime = Math.ceil(
        (EMAIL_RATE_LIMIT_MINUTES * 60 * 1000 - timeSinceLastEmail) / 1000
      );
      return { allowed: false, waitTime };
    }

    return { allowed: true };
  };

  register = async (email: string, password: string) => {
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return this.response({
        code: 400,
        data: null,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = secureRandomString(48);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.userVerification.create({
      data: {
        userId: user.id,
        codeHash: tokenHash,
        purpose: "VERIFY_EMAIL",
        expiresAt: new Date(
          Date.now() + VERIFICATION_EXPIRE_MINUTES * 60 * 1000
        ),
      },
    });

    await emailLib.sendVerifyEmail(
      email,
      `${APPS_URL}/verify-email?token=${token}`
    );

    return this.response({
      code: 201,
      data: { id: user.id, email: user.email },
      message: "Registration successful. Please verify your email.",
    });
  };

  verifyEmail = async (token: string) => {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const verification = await prisma.userVerification.findFirst({
      where: {
        codeHash: tokenHash,
        purpose: "VERIFY_EMAIL",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    if (!verification) {
      return this.response({
        code: 400,
        data: null,
        message: "Invalid or expired verification token",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verification.userId },
        data: { emailVerifiedAt: new Date() },
      });

      await tx.userVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      });
    });

    return this.response({
      code: 200,
      data: null,
      message: "Email verified successfully",
    });
  };

  resendEmailVerification = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return this.response({
        code: 404,
        data: null,
        message: "User not found",
      });
    }

    if (user.emailVerifiedAt !== null) {
      return this.response({
        code: 400,
        data: null,
        message: "Email already verified",
      });
    }

    const rateLimit = await this.checkEmailRateLimit(user.id, "VERIFY_EMAIL");
    if (!rateLimit.allowed) {
      return this.response({
        code: 429,
        data: { waitTime: rateLimit.waitTime },
        message: `Please wait ${rateLimit.waitTime} seconds before requesting another verification email`,
      });
    }

    await prisma.userVerification.updateMany({
      where: {
        userId: user.id,
        purpose: "VERIFY_EMAIL",
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    const token = secureRandomString(48);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.userVerification.create({
      data: {
        userId: user.id,
        codeHash: tokenHash,
        purpose: "VERIFY_EMAIL",
        expiresAt: new Date(
          Date.now() + VERIFICATION_EXPIRE_MINUTES * 60 * 1000
        ),
      },
    });

    await emailLib.sendVerifyEmail(
      email,
      `${APPS_URL}/verify-email?token=${token}`
    );

    return this.response({
      code: 200,
      data: null,
      message: "Verification email has been resent",
    });
  };

  login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return this.response({
        code: 401,
        data: null,
        message: "Invalid credentials",
      });
    }

    if (user.emailVerifiedAt === null) {
      return this.response({
        code: 400,
        data: null,
        message: "Please verify your email before logging in",
      });
    }

    const isDev = process.env.NODE_ENV !== "production";
    const otp = isDev
      ? "000000"
      : Math.floor(100000 + Math.random() * 900000).toString();

    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);

    await prisma.$transaction(async (tx) => {
      await tx.userVerification.updateMany({
        where: {
          userId: user.id,
          purpose: "LOGIN",
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });

      await tx.userVerification.create({
        data: {
          userId: user.id,
          codeHash: otpHash,
          expiresAt: new Date(
            Date.now() + VERIFICATION_EXPIRE_MINUTES * 60 * 1000
          ),
          purpose: "LOGIN",
        },
      });
    });

    const otpToken = jwt.sign(
      { type: "otp_verification", id: user.id },
      JWT_SECRET,
      { expiresIn: `${VERIFICATION_EXPIRE_MINUTES}m` }
    );

    await emailLib.sendOTPEmail(email, otp);

    return this.response({
      code: 200,
      data: { token: { verify_otp_token: otpToken } },
      message: "OTP sent to your email",
    });
  };

  verifyOtp = async (otp: string, userId: number, otpToken: string) => {
    let payload: jwt.JwtPayload;

    try {
      payload = jwt.verify(otpToken, JWT_SECRET) as jwt.JwtPayload;
    } catch {
      return this.response({
        code: 401,
        data: null,
        message: "Invalid or expired OTP token",
      });
    }

    if (payload.type !== "otp_verification" || payload.id !== userId) {
      return this.response({
        code: 403,
        data: null,
        message: "Unauthorized OTP verification",
      });
    }
    const userOtp = await prisma.userVerification.findFirst({
      where: {
        userId: userId,
        purpose: "LOGIN",
        usedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!userOtp) {
      return this.response({
        code: 400,
        data: null,
        message: "OTP not found",
      });
    }

    if (userOtp.expiresAt < new Date()) {
      return this.response({
        code: 410,
        data: null,
        message: "OTP expired",
      });
    }

    const valid = await bcrypt.compare(otp, userOtp.codeHash);
    if (!valid) {
      return this.response({
        code: 403,
        data: null,
        message: "Invalid OTP",
      });
    }

    await prisma.userVerification.update({
      where: { id: userOtp.id },
      data: { usedAt: new Date() },
    });

    const accessToken = jwt.sign(
      { type: "access_token", id: userId },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRE }
    );

    const refreshToken = jwt.sign(
      { type: "refresh_token", id: userId },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRE }
    );

    const user = await prisma.user.findUnique({ where: { id: userId } });

    return this.response({
      code: 200,
      data: {
        id: user!.id,
        email: user!.email,
        token: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      },
      message: "Login successful",
    });
  };

  resendOtp = async (userId: number, otpToken: string) => {
    let payload: jwt.JwtPayload;

    try {
      payload = jwt.verify(otpToken, JWT_SECRET) as jwt.JwtPayload;
    } catch {
      return this.response({
        code: 401,
        data: null,
        message: "Invalid or expired OTP token",
      });
    }

    if (payload.type !== "otp_verification" || payload.id !== userId) {
      return this.response({
        code: 403,
        data: null,
        message: "Unauthorized OTP resend",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return this.response({
        code: 404,
        data: null,
        message: "User not found",
      });
    }

    const rateLimit = await this.checkEmailRateLimit(user.id, "LOGIN");
    if (!rateLimit.allowed) {
      return this.response({
        code: 429,
        data: { waitTime: rateLimit.waitTime },
        message: `Please wait ${rateLimit.waitTime} seconds before requesting another OTP`,
      });
    }

    const isDev = process.env.NODE_ENV !== "production";
    const otp = isDev
      ? "000001"
      : Math.floor(100000 + Math.random() * 900000).toString();

    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);

    await prisma.$transaction(async (tx) => {
      await tx.userVerification.updateMany({
        where: {
          userId: user.id,
          purpose: "LOGIN",
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });

      await tx.userVerification.create({
        data: {
          userId: user.id,
          codeHash: otpHash,
          expiresAt: new Date(
            Date.now() + VERIFICATION_EXPIRE_MINUTES * 60 * 1000
          ),
          purpose: "LOGIN",
        },
      });
    });

    const otpTokens = jwt.sign(
      { type: "otp_verification", id: user.id },
      JWT_SECRET,
      { expiresIn: `${VERIFICATION_EXPIRE_MINUTES}m` }
    );

    await emailLib.sendOTPEmail(user.email, otp);

    return this.response({
      code: 200,
      data: { token: { verify_otp_token: otpTokens } },
      message: "OTP has been resent to your email",
    });
  };

  refreshToken = async (refreshToken: string) => {
    let payload: jwt.JwtPayload;

    try {
      payload = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;
    } catch {
      return this.response({
        code: 401,
        data: null,
        message: "Invalid or expired refresh token",
      });
    }

    if (payload.type !== "refresh_token") {
      return this.response({
        code: 403,
        data: null,
        message: "Invalid token type",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return this.response({
        code: 404,
        data: null,
        message: "User not found",
      });
    }

    const newAccessToken = jwt.sign(
      { type: "access_token", id: user.id },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRE }
    );

    const newRefreshToken = jwt.sign(
      { type: "refresh_token", id: user.id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRE }
    );

    return this.response({
      code: 200,
      data: {
        token: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      },
      message: "Token refreshed",
    });
  };

  forgotPassword = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return this.response({
        code: 200,
        data: null,
        message: "If the email exists, reset instructions have been sent",
      });
    }

    const rateLimit = await this.checkEmailRateLimit(user.id, "RESET_PASSWORD");
    if (!rateLimit.allowed) {
      return this.response({
        code: 429,
        data: { waitTime: rateLimit.waitTime },
        message: `Please wait ${rateLimit.waitTime} seconds before requesting another password reset`,
      });
    }

    const token = secureRandomString(48);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.$transaction(async (tx) => {
      await tx.userVerification.updateMany({
        where: {
          userId: user.id,
          purpose: "RESET_PASSWORD",
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });

      await tx.userVerification.create({
        data: {
          userId: user.id,
          codeHash: tokenHash,
          purpose: "RESET_PASSWORD",
          expiresAt: new Date(
            Date.now() + VERIFICATION_EXPIRE_MINUTES * 60 * 1000
          ),
        },
      });
    });

    await emailLib.sendForgotPasswordEmail(
      email,
      `${APPS_URL}/reset-password?token=${token}`
    );

    return this.response({
      code: 200,
      data: null,
      message: "Reset instructions have been sent",
    });
  };

  resetPassword = async (token: string, newPassword: string) => {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const verification = await prisma.userVerification.findFirst({
      where: {
        codeHash: tokenHash,
        purpose: "RESET_PASSWORD",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    if (!verification) {
      return this.response({
        code: 401,
        data: null,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verification.userId },
        data: { password: hashedPassword },
      });

      await tx.userVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      });
    });

    return this.response({
      code: 200,
      data: null,
      message: "Password reset successful",
    });
  };
}

export default new AuthService();
