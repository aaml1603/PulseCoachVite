import React from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import WorkoutBuilder from "@/components/dashboard/WorkoutBuilder";

export default function WorkoutBuilderPage() {
  return (
    <DashboardLayout>
      <WorkoutBuilder />
    </DashboardLayout>
  );
}
