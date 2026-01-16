import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Input } from "@packages/ui";
import { authApi } from "@/lib/auth-api";
import { useAuth } from "@/contexts/auth-context";
import { VerifyOtpSchema } from "@packages/shared";

export const Route = createFileRoute("/verify-otp")({
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const navigate = useNavigate();
  const { otpToken, setTokens, clearOtpToken } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpToken) {
      setError("Sesi OTP tidak valid. Silakan login ulang.");
      navigate({ to: "/login" });
      return;
    }

    const validation = VerifyOtpSchema.safeParse({ otp });
    if (!validation.success) {
      setError("OTP harus 6 digit");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOtp(validation.data, otpToken);
      if (response.code === 200 && response.data) {
        setTokens(
          response.data.token.access_token,
          response.data.token.refresh_token,
          {
            id: response.data.id,
            email: response.data.email,
          }
        );
        clearOtpToken();
        navigate({ to: "/" });
      } else {
        setError(response.message || "Verifikasi OTP gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat verifikasi OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpToken) {
      setError("Sesi OTP tidak valid");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resendOtp(otpToken);
      if (response.code === 200) {
        setError(null);
      } else {
        setError(response.message || "Gagal mengirim ulang OTP");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim ulang OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold text-center">Verifikasi OTP</h2>
          <p className="text-center text-sm text-gray-600 mt-2">
            Masukkan kode OTP yang dikirim ke email Anda
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-2">
              Kode OTP
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-sm text-blue-600 hover:underline"
              disabled={loading}
            >
              Kirim ulang OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
