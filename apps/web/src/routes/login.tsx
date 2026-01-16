import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Input } from "@packages/ui";
import { authApi } from "@/lib/auth-api";
import { useAuth } from "@/contexts/auth-context";
import { LoginSchema } from "@packages/shared";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { setOtpToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError("Email dan password harus valid");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.login(validation.data);
      if (response.code === 200 && response.data) {
        setOtpToken(response.data.token.verify_otp_token);
        navigate({ to: "/verify-otp" });
      } else {
        setError(response.message || "Login gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold text-center">Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimal 8 karakter"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </Button>
          <div className="text-center text-sm">
            <a
              href="/register"
              className="text-blue-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate({ to: "/register" });
              }}
            >
              Belum punya akun? Daftar
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
