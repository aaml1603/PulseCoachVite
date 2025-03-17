import React from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import UserProfile from "@/components/dashboard/UserProfile";
import { useAuth } from "../../../supabase/auth";
import { Navigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        <UserProfile />
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
