import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TutorProfile {
  id: string;
  name: string;
  major: string;
  graduation_year: number;
  department: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  hourly_rate: number | null;
  availability: string[];
  locations: string[];
  specializations: string[];
  is_verified: boolean;
}

export const useTutorProfiles = () => {
  return useQuery({
    queryKey: ["tutor-profiles"],
    queryFn: async () => {
      // Query the secure authenticated view
      // Note: This requires user authentication to prevent anonymous scraping
      const { data, error } = await supabase
        .from("tutor_profiles_public")
        .select("*")
        .order("is_verified", { ascending: false })
        .order("name");

      if (error) {
        // Check if it's an auth error
        if (error.message.includes("permission denied") || error.message.includes("JWT")) {
          throw new Error("Please log in to browse tutors");
        }
        throw error;
      }
      return data as TutorProfile[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on auth errors
  });
};
