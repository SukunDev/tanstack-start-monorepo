import { apiClient } from "./api-client";
import type {
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  RefreshTokenInput,
  VerifyEmailInput,
  ResendEmailVerificationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@packages/shared";

export interface LoginResponse {
  token: {
    verify_otp_token: string;
  };
}

export interface VerifyOtpResponse {
  id: number;
  email: string;
  token: {
    access_token: string;
    refresh_token: string;
  };
}

export interface RefreshTokenResponse {
  token: {
    access_token: string;
    refresh_token: string;
  };
}

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post("/auth/register", data),

  verifyEmail: (data: VerifyEmailInput) =>
    apiClient.post("/auth/verify-email", data),

  resendEmailVerification: (data: ResendEmailVerificationInput) =>
    apiClient.post("/auth/resend-email-verification", data),

  login: (data: LoginInput) =>
    apiClient.post<LoginResponse>("/auth/login", data),

  verifyOtp: (data: VerifyOtpInput, otpToken: string) =>
    apiClient.post<VerifyOtpResponse>("/auth/verify-otp", data, otpToken),

  resendOtp: (otpToken: string) =>
    apiClient.post("/auth/resend-otp", undefined, otpToken),

  refreshToken: (data: RefreshTokenInput) =>
    apiClient.post<RefreshTokenResponse>("/auth/refresh", data),

  forgotPassword: (data: ForgotPasswordInput) =>
    apiClient.post("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordInput) =>
    apiClient.post("/auth/reset-password", data),
};

