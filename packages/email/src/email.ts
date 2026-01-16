import nodemailer from "nodemailer";
import { otpTemplate } from "./templates/otp";
import dotenv from "dotenv";
import { verifyEmailTemplate } from "./templates/verify-email";
import { forgotPasswordTemplate } from "./templates/forgot-password";

dotenv.config();

if (!process.env.SMTP_HOST) {
  throw new Error("SMTP_HOST is missing (loaded from root .env)");
}
if (!process.env.SMTP_PORT) {
  throw new Error("SMTP_PORT is missing (loaded from root .env)");
}
if (!process.env.SMTP_USER) {
  throw new Error("SMTP_USER is missing (loaded from root .env)");
}
if (!process.env.SMTP_PASS) {
  throw new Error("SMTP_PASS is missing (loaded from root .env)");
}

class EmailLib {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOTPEmail(to: string, otp: string) {
    await this.transporter.sendMail({
      from: '"MonoRepo Boilerplate" <no-reply@monorepo-boilerplate.com>',
      to,
      subject: "Your OTP Code",
      html: otpTemplate(otp),
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });
  }

  async sendVerifyEmail(to: string, verifyUrl: string) {
    await this.transporter.sendMail({
      from: '"MonoRepo Boilerplate" <no-reply@monorepo-boilerplate.com>',
      to,
      subject: "Verify Your Email",
      html: verifyEmailTemplate(verifyUrl),
      text: `Verify your email: ${verifyUrl}`,
    });
  }

  async sendForgotPasswordEmail(to: string, resetUrl: string) {
    await this.transporter.sendMail({
      from: '"MonoRepo Boilerplate" <no-reply@monorepo-boilerplate.com>',
      to,
      subject: "Reset Your Password",
      html: forgotPasswordTemplate(resetUrl),
      text: `Reset your password: ${resetUrl}`,
    });
  }
}

export const emailLib = new EmailLib();
