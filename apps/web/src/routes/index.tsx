import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@packages/ui";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div>
      Home
      <div>
        <Button>Hai</Button>
      </div>
    </div>
  );
}
