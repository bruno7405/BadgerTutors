import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Search, Shield, Wallet, BookOpen } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              UW-Madison Students Only
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              BadgerTutors
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Find tutors and study groups across Computer Science, Math, Data Science, Biology, Chemistry, Physics, and Engineering
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg">
                <Link to="/auth/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link to="/auth/login">Login</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Only @wisc.edu accounts allowed for security
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why BadgerTutors?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Verified Students Only</CardTitle>
                <CardDescription>
                  Exclusive to UW-Madison with @wisc.edu email verification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Advanced Filters</CardTitle>
                <CardDescription>
                  Search by major, course, professor, lecture time, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Wallet className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Connect your Solana wallet for secure, blockchain-based transactions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Expert Tutors</CardTitle>
                <CardDescription>
                  Find experienced peers who've excelled in your courses
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Study Groups</CardTitle>
                <CardDescription>
                  Join or create study groups for collaborative learning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multiple Departments</CardTitle>
                <CardDescription>
                  CS, Math, Statistics, Biology, Chemistry, Physics, Engineering
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Tutors Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Meet Our Tutors
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Sarah Chen</CardTitle>
                    <CardDescription>Computer Science • 2025</CardDescription>
                  </div>
                  <Badge className="bg-badge-green text-white">4.8 ★</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">CS 300</Badge>
                  <Badge variant="secondary">CS 400</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Experienced CS tutor specializing in data structures and algorithms
                </p>
                <p className="text-lg font-semibold text-primary">$30/hr</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Michael Rodriguez</CardTitle>
                    <CardDescription>Mathematics • 2026</CardDescription>
                  </div>
                  <Badge className="bg-badge-green text-white">4.9 ★</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">MATH 340</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Patient and thorough math tutor, great with linear algebra
                </p>
                <p className="text-lg font-semibold text-primary">$25/hr</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Jessica Park</CardTitle>
                    <CardDescription>Statistics • 2025</CardDescription>
                  </div>
                  <Badge className="bg-badge-green text-white">4.7 ★</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">STAT 240</Badge>
                  <Badge variant="secondary">STAT 340</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Stats and data science expert with real-world project experience
                </p>
                <p className="text-lg font-semibold text-primary">$28/hr</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-10">
            <Button size="lg" asChild>
              <Link to="/auth/register">Join BadgerTutors Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Secure & Exclusive</h3>
            <p className="text-muted-foreground">
              BadgerTutors is restricted to UW-Madison students and staff with a valid @wisc.edu email. 
              Other domains are rejected for security reasons. Connect your Solana wallet for secure, 
              decentralized payment processing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
