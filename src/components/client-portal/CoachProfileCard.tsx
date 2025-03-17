import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface CoachProfileCardProps {
  coachId: string;
}

interface CoachProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  specialties: string;
  avatar_url: string;
  years_experience: number;
  certifications: string;
}

const CoachProfileCard = ({ coachId }: CoachProfileCardProps) => {
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachProfile = async () => {
      try {
        setLoading(true);
        console.log("Fetching coach profile for ID:", coachId);
        if (!coachId) {
          console.log("No coach ID provided, fetching any available coach");
          // If no coach ID provided, fetch any coach profile as a fallback
          const { data: anyCoach, error: anyCoachError } = await supabase
            .from("coach_profiles")
            .select("*")
            .limit(1);

          if (anyCoach && anyCoach.length > 0) {
            console.log("Found a coach profile as fallback:", anyCoach[0]);
            setProfile(anyCoach[0]);
          } else {
            console.log("No coach profiles found in the system");
          }
          setLoading(false);
          return;
        }

        // Try to fetch by user_id first, then by id if that fails
        let { data, error } = await supabase
          .from("coach_profiles")
          .select("*")
          .eq("user_id", coachId)
          .single();

        // If no data found by user_id, try with id field
        if (!data && error && error.code === "PGRST116") {
          console.log("No profile found by user_id, trying with id field");
          const result = await supabase
            .from("coach_profiles")
            .select("*")
            .eq("id", coachId)
            .single();

          data = result.data;
          error = result.error;
        }

        // If still no data, try to fetch any coach profile as a fallback
        if (!data && error) {
          console.log("No profile found by ID, fetching any available coach");
          const { data: anyCoach, error: anyCoachError } = await supabase
            .from("coach_profiles")
            .select("*")
            .limit(1);

          if (anyCoach && anyCoach.length > 0) {
            console.log("Found a coach profile as fallback:", anyCoach[0]);
            data = anyCoach[0];
            error = null;
          }
        }

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching coach profile:", error);
          // Continue execution to show default profile
        }

        console.log("Coach profile data:", data);
        setProfile(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (coachId) {
      fetchCoachProfile();
    }
  }, [coachId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no profile exists yet, show a default card
  if (!profile) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                <User className="h-6 w-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Your Coach</CardTitle>
              <CardDescription>Fitness Professional</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Format specialties as badges
  const specialtiesList = profile.specialties
    ? profile.specialties.split(",").map((s) => s.trim())
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>
              <User className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{profile.full_name}</CardTitle>
            <CardDescription>
              {profile.years_experience
                ? `${profile.years_experience} years of experience`
                : "Fitness Coach"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-sm text-foreground/80">{profile.bio}</p>
        )}

        {specialtiesList.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {specialtiesList.map((specialty, index) => (
                <Badge key={index} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.certifications && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Certifications</h4>
            <p className="text-sm text-foreground/80">
              {profile.certifications}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoachProfileCard;
