import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../../supabase/auth";
import { ThemeToggle } from "../ui/theme-toggle";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            Fitness Coach
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`text-sm ${location.pathname === "/" ? "font-bold" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`text-sm ${location.pathname === "/about" ? "font-bold" : ""}`}
            >
              About
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm ${location.pathname === "/dashboard" ? "font-bold" : ""}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/clients"
                  className={`text-sm ${location.pathname === "/clients" ? "font-bold" : ""}`}
                >
                  Clients
                </Link>
                <Link
                  to="/workout-builder"
                  className={`text-sm ${location.pathname === "/workout-builder" ? "font-bold" : ""}`}
                >
                  Workouts
                </Link>
                <Link
                  to="/messaging"
                  className={`text-sm ${location.pathname === "/messaging" ? "font-bold" : ""}`}
                >
                  Messages
                </Link>
                <Link
                  to="/profile"
                  className={`text-sm ${location.pathname === "/profile" ? "font-bold" : ""}`}
                >
                  Profile
                </Link>
              </>
            ) : null}
            <Link
              to="/help-center"
              className={`text-sm ${location.pathname === "/help-center" ? "font-bold" : ""}`}
            >
              Help
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Fitness Coach</h3>
              <p className="text-sm text-muted-foreground">
                Your complete fitness coaching platform for managing clients and
                workouts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
                <li>
                  <Link to="/help-center">Help Center</Link>
                </li>
                <li>
                  <Link to="/tutorials">Tutorials</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/cookies">Cookies Policy</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-muted-foreground">
                support@fitnesscoach.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fitness Coach. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
