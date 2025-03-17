import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { User, Upload, Loader2 } from "lucide-react";

interface CoachProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  specialties: string;
  avatar_url: string;
  years_experience: number;
  certifications: string;
  created_at: string;
  updated_at: string;
}

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    specialties: "",
    years_experience: "",
    certifications: "",
  });

  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Check if coach_profiles table exists, if not create it
      const { error: tableCheckError } = await supabase
        .from("coach_profiles")
        .select("id")
        .limit(1);

      if (tableCheckError && tableCheckError.code === "42P01") {
        // Table doesn't exist, create it via edge function or direct SQL
        // For this implementation, we'll assume the table exists or will be created via migration
        console.log("Coach profiles table doesn't exist yet");
      }

      // Get coach profile
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          bio: data.bio || "",
          specialties: data.specialties || "",
          years_experience: data.years_experience?.toString() || "",
          certifications: data.certifications || "",
        });
      } else {
        // No profile exists yet
        setProfile(null);
        // Pre-fill with user email if available
        setFormData({
          full_name: user?.email?.split("@")[0] || "",
          bio: "",
          specialties: "",
          years_experience: "",
          certifications: "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `coach-avatars/${fileName}`;

    try {
      setUploading(true);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);

      // Update profile with new avatar URL
      if (profile) {
        await supabase
          .from("coach_profiles")
          .update({ avatar_url: data.publicUrl })
          .eq("id", profile.id);
      }

      // Update local state
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: data.publicUrl } : null,
      );

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const profileData = {
        user_id: user.id,
        full_name: formData.full_name,
        bio: formData.bio,
        specialties: formData.specialties,
        years_experience: formData.years_experience
          ? parseInt(formData.years_experience)
          : null,
        certifications: formData.certifications,
        updated_at: new Date().toISOString(),
      };

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from("coach_profiles")
          .update(profileData)
          .eq("id", profile.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("coach_profiles")
          .insert([
            {
              ...profileData,
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;
        if (data) setProfile(data[0]);
      }

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "There was a problem updating your profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Coach Profile</CardTitle>
        <CardDescription>
          Update your profile information that will be visible to your clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-24 w-24 border-2 border-gray-200">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gray-100">
                <User className="h-12 w-12 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="relative"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </>
                )}
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                name="years_experience"
                type="number"
                value={formData.years_experience}
                onChange={handleInputChange}
                placeholder="e.g. 5"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell your clients about yourself and your coaching approach"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialties">Specialties</Label>
          <Input
            id="specialties"
            name="specialties"
            value={formData.specialties}
            onChange={handleInputChange}
            placeholder="e.g. Weight Loss, Strength Training, Nutrition"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="certifications">Certifications</Label>
          <Textarea
            id="certifications"
            name="certifications"
            value={formData.certifications}
            onChange={handleInputChange}
            placeholder="List your relevant certifications"
            className="min-h-[80px]"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveProfile} disabled={saving} className="ml-auto">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfile;
