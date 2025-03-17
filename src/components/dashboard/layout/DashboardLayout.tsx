import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex dark:bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopNavigation>
          <ThemeToggle />
        </TopNavigation>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
