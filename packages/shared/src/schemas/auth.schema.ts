import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const VerifyOtpSchema = z.object({
  otp: z.string().length(6),
});

export const RefreshTokenSchema = z.object({
  "refresh-token": z.string(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string(),
});

export const ResetPasswordSchema = z.object({
  "verification-token": z.string(),
  "new-password": z.string(),
});

export const VerifyEmailSchema = z.object({
  "verification-token": z.string(),
});

export const ResendEmailVerificationSchema = z.object({
  email: z.string(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type ResendEmailVerificationInput = z.infer<
  typeof ResendEmailVerificationSchema
>;
