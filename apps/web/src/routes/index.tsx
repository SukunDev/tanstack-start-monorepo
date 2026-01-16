import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@packages/ui";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Home</h1>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-600">
                Logged in as: {user?.email}
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
              >
                Logout
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p>Welcome to the protected home page!</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
