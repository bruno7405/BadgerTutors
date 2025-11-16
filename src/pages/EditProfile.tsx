import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  major: z.string().min(2, "Major is required").max(100),
  graduation_year: z.number().min(2020).max(2035),
  department: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number").optional().or(z.literal("")),
  location: z.string().max(200).optional(),
  hourly_rate: z.number().min(0).max(500).optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EditProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    major: "",
    graduation_year: new Date().getFullYear(),
    department: "",
    bio: "",
    phone: "",
    location: "",
    hourly_rate: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        major: user.major || "",
        graduation_year: user.graduationYear || new Date().getFullYear(),
        department: user.department || "",
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
        hourly_rate: user.hourlyRate || null,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      profileSchema.parse(formData);
      
      setLoading(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          major: formData.major,
          graduation_year: formData.graduation_year,
          department: formData.department || null,
          bio: formData.bio || null,
          phone: formData.phone || null,
          location: formData.location || null,
          hourly_rate: formData.hourly_rate,
        })
        .eq("id", user?.id);

      if (error) throw error;

      await refreshUser();
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to update profile");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your personal and academic information
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Your name, contact details, and academic info
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Immutable)</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major *</Label>
                    <Input
                      id="major"
                      value={formData.major}
                      onChange={(e) => handleInputChange("major", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation_year">Graduation Year *</Label>
                    <Input
                      id="graduation_year"
                      type="number"
                      value={formData.graduation_year}
                      onChange={(e) => handleInputChange("graduation_year", parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      placeholder="e.g., COMP SCI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="Madison, WI"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.bio?.length || 0}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {user.isTutor && (
              <Card>
                <CardHeader>
                  <CardTitle>Tutor Information</CardTitle>
                  <CardDescription>
                    Settings specific to your tutoring services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="500"
                      value={formData.hourly_rate || ""}
                      onChange={(e) => handleInputChange("hourly_rate", e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="25.00"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Immutable Fields</CardTitle>
                <CardDescription>
                  These fields cannot be changed for security reasons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {user.studentId && (
                    <div className="space-y-2">
                      <Label>Student ID</Label>
                      <Input value={user.studentId} disabled className="bg-muted" />
                    </div>
                  )}
                  {user.walletPublicKey && (
                    <div className="space-y-2">
                      <Label>Wallet Key</Label>
                      <Input
                        value={`${user.walletPublicKey.slice(0, 8)}...${user.walletPublicKey.slice(-8)}`}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
