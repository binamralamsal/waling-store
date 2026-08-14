import { Button } from "#/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/")({ component: App });

function App() {
  return (
    <main>
      <Button>asdfasdf</Button>
    </main>
  );
}
