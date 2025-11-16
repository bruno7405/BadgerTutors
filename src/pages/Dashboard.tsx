import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import {
  Search,
  Users,
  BookOpen,
  Wallet,
  Star,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your BadgerTutors account
          </p>
        </div>

        {/* Alerts Section */}
        <div className="space-y-4 mb-8">
          {!isConnected && (
            <Alert className="border-badge-yellow/20 bg-badge-yellow/5">
              <Wallet className="h-4 w-4 text-badge-yellow" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Connect your Solana wallet to receive or send payments securely.</span>
                  <Button variant="outline" size="sm" asChild className="ml-4">
                    <Link to="/profile">Connect Wallet</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!user?.studentId && (
            <Alert className="border-primary/20 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Complete your profile by registering with the BadgerTutors Registry.</span>
                  <Button variant="outline" size="sm" asChild className="ml-4">
                    <Link to="/profile">Complete Profile</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.rating > 0 ? user.rating.toFixed(1) : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {user?.ratingCount || 0} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Study Groups
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Active groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Wallet Status
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? "Connected" : "Not Connected"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Search className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Find Tutors</CardTitle>
              <CardDescription>
                Search for tutors across CS, Math, and other departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/search">Start Searching</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Study Groups</CardTitle>
              <CardDescription>
                Join or create study groups for your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/study-groups">Browse Groups</Link>
              </Button>
            </CardContent>
          </Card>

          {!user?.isTutor && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Become a Tutor</CardTitle>
                <CardDescription>
                  Share your knowledge and earn money tutoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/profile">Set Up Tutoring</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <User className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Update your information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/profile">View Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
