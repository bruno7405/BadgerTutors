import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor" | "both";
  major: string;
  graduationYear: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profile) {
      const appUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.is_tutor ? "tutor" : "student",
        major: profile.major,
        graduationYear: profile.graduation_year,
        department: profile.department || "COMP SCI",
        courses: [],
        walletPublicKey: profile.wallet_public_key,
        rating: 0,
        ratingCount: 0,
        bio: profile.bio || "",
        hourlyRate: profile.hourly_rate,
        availability: Array.isArray(profile.availability) ? profile.availability as string[] : [],
        locations: Array.isArray(profile.locations) ? profile.locations as string[] : [],
        isTutor: profile.is_tutor,
        studentId: profile.student_id,
        phone: profile.phone,
        location: profile.location,
      };
      setUser(appUser);
    }
  };

  const refreshUser = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      await fetchUserProfile(currentSession.user);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          // Defer async operations to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(currentSession.user);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Validate @wisc.edu email
    if (!email.toLowerCase().endsWith("@wisc.edu")) {
      throw new Error(
        "Invalid account type. Only @wisc.edu emails are allowed for security reasons."
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Incorrect email or password. Please try again.");
      }
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    // Validate @wisc.edu email
    if (!data.email.toLowerCase().endsWith("@wisc.edu")) {
      throw new Error(
        "Invalid account type. Only @wisc.edu emails are allowed for security reasons."
      );
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: data.name,
          major: data.major,
          graduation_year: data.graduationYear,
          is_tutor: data.role === "tutor" || data.role === "both",
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        throw new Error("An account with this email already exists. Please log in instead.");
      }
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!session,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
