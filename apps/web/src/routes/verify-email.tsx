import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button, Input } from "@packages/ui";
import { authApi } from "@/lib/auth-api";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || "",
  }),
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/verify-email" });
  const [verificationToken, setVerificationToken] = useState(token || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (tokenToVerify: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authApi.verifyEmail({
        "verification-token": tokenToVerify,
      });
      if (response.code === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 2000);
      } else {
        setError(response.message || "Verifikasi gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat verifikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationToken) {
      setError("Token verifikasi diperlukan");
      return;
    }
    await handleVerify(verificationToken);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Email berhasil diverifikasi! Mengarahkan ke halaman login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold text-center">Verifikasi Email</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium mb-2"
            >
              Token Verifikasi
            </label>
            <Input
              id="token"
              type="text"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              required
              placeholder="Masukkan token verifikasi"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </Button>
        </form>
      </div>
    </div>
  );
}
