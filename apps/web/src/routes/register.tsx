import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Input } from "@packages/ui";
import { authApi } from "@/lib/auth-api";
import { RegisterSchema } from "@packages/shared";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    const validation = RegisterSchema.safeParse({ email, password });
    if (!validation.success) {
      setError("Email dan password harus valid");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register(validation.data);
      if (response.code === 201) {
        setSuccess(true);
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 2000);
      } else {
        setError(response.message || "Registrasi gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Registrasi berhasil! Silakan cek email untuk verifikasi.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold text-center">Daftar</h2>
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
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Konfirmasi Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Ulangi password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Daftar"}
          </Button>
          <div className="text-center text-sm">
            <a
              href="/login"
              className="text-blue-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate({ to: "/login" });
              }}
            >
              Sudah punya akun? Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
