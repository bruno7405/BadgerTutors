import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { registerStudent } from "@/lib/solanaClient";
import { User, Wallet, BookOpen, Star, Shield, CheckCircle2, Edit } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWallet();
  const [studentId, setStudentId] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleWalletAction = async () => {
    if (isConnected) {
      disconnectWallet();
      toast.success("Wallet disconnected");
    } else {
      try {
        await connectWallet();
        toast.success("Wallet connected successfully");
      } catch (error) {
        toast.error("Failed to connect wallet");
      }
    }
  };

  const handleRegistryRegister = async () => {
    if (!studentId || studentId.length !== 10) {
      toast.error("Student ID must be exactly 10 digits");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsRegistering(true);

    try {
      const result = await registerStudent(
        studentId,
        user?.email || "",
        walletAddress || ""
      );

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to register with BadgerTutors Registry");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <Button onClick={() => navigate("/edit-profile")}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="wallet">Wallet & Registry</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            {user?.isTutor && <TabsTrigger value="tutoring">Tutoring</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={user?.name || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Major</Label>
                    <Input value={user?.major || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Graduation Year</Label>
                    <Input value={user?.graduationYear || ""} readOnly />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <p className="text-sm text-muted-foreground border border-input rounded-md p-3 min-h-[100px] bg-muted/30">
                    {user?.bio || "No bio added yet"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={user?.isTutor ? "default" : "secondary"}>
                    {user?.isTutor ? "Active Tutor" : "Student"}
                  </Badge>
                  {user?.rating > 0 && (
                    <Badge className="bg-badge-green text-white">
                      <Star className="h-3 w-3 mr-1" />
                      {user.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Solana Wallet
                  </CardTitle>
                  <CardDescription>
                    Connect your Solana wallet for secure payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isConnected ? (
                    <Alert className="border-badge-green/20 bg-badge-green/5">
                      <CheckCircle2 className="h-4 w-4 text-badge-green" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">Wallet connected</p>
                          <p className="font-mono text-sm">{walletAddress}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <Wallet className="h-4 w-4" />
                      <AlertDescription>
                        Connect your wallet to enable secure payments and registry registration
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={handleWalletAction} variant={isConnected ? "destructive" : "default"}>
                    {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    BadgerTutors Registry
                  </CardTitle>
                  <CardDescription>
                    Register with the on-chain student registry
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-primary/20 bg-primary/5">
                    <Shield className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm">
                      The BadgerTutors Registry uses Solana blockchain to securely verify student identities 
                      and enable trusted transactions between students.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID (10 digits)</Label>
                    <Input
                      id="studentId"
                      type="text"
                      maxLength={10}
                      placeholder="1234567890"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your 10-digit UW-Madison student ID
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ""} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <Input
                      value={walletAddress || "Not connected"}
                      readOnly
                      className="font-mono text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleRegistryRegister}
                    disabled={!isConnected || isRegistering}
                    className="w-full"
                  >
                    {isRegistering ? "Registering..." : "Register with BadgerTutors Registry"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  My Courses
                </CardTitle>
                <CardDescription>Manage courses you're taking or can tutor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user?.courses && user.courses.length > 0 ? (
                    <div className="space-y-3">
                      {user.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {course.department} {course.courseNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {course.courseTitle} • {course.professorName}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No courses added yet
                    </p>
                  )}

                  <Button variant="outline" className="w-full">
                    Add Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.isTutor && (
            <TabsContent value="tutoring">
              <Card>
                <CardHeader>
                  <CardTitle>Tutoring Settings</CardTitle>
                  <CardDescription>Configure your tutoring preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      value={user.hourlyRate || 25}
                      min={10}
                      max={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Short Description</Label>
                    <p className="text-sm text-muted-foreground">
                      Edit your tutoring description in the Edit Profile page
                    </p>
                  </div>

                  <Button>Save Tutoring Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
