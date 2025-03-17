import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">FitCoach Pro</h1>
          <p className="text-muted-foreground mt-2">
            Elevate your coaching business with our comprehensive platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
