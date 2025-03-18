import { Suspense } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import Dashboard from "./components/pages/dashboard";
import Success from "./components/pages/success";
import Home from "./components/pages/home";
import ClientPortal from "./components/pages/client-portal";
import ClientMessaging from "./components/pages/client-messaging";
import Messaging from "./components/pages/messaging";
import WorkoutBuilder from "./components/pages/workout-builder";
import ProfilePage from "./components/pages/profile";
import ClientsPage from "./components/pages/clients";
import AboutPage from "./components/pages/about";
import PrivacyPolicy from "./components/pages/privacy";
import TermsOfService from "./components/pages/terms";
import CookiesPolicy from "./components/pages/cookies";
import HelpCenter from "./components/pages/help-center";
import Tutorials from "./components/pages/tutorials";
import { AuthProvider, useAuth } from "../supabase/auth";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/messaging"
          element={
            <PrivateRoute>
              <Messaging />
            </PrivateRoute>
          }
        />
        <Route
          path="/workout-builder"
          element={
            <PrivateRoute>
              <WorkoutBuilder />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <PrivateRoute>
              <ClientsPage />
            </PrivateRoute>
          }
        />
        <Route path="/client-portal/:clientId" element={<ClientPortal />} />
        <Route
          path="/client-messaging/:clientId"
          element={<ClientMessaging />}
        />
        <Route path="/success" element={<Success />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiesPolicy />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/tutorials" element={<Tutorials />} />
      </Routes>
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="fitness-coach-theme">
      <AuthProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <AppRoutes />
        </Suspense>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
