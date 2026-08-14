import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-8xl font-extrabold tracking-tighter text-primary">
          404
        </h1>

        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Page not found
        </h2>

        <p className="mx-auto max-w-125 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved, deleted, or never existed.
        </p>

        <div className="pt-6">
          <Button
            size="lg"
            nativeButton={false}
            render={
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
