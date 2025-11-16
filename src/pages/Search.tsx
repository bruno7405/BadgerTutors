import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TutorReviewButton } from "@/components/TutorReviewButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search as SearchIcon, Star, DollarSign, MapPin, Clock, Loader2, Lock } from "lucide-react";
import { Department } from "@/types";
import { useTutorProfiles } from "@/hooks/useTutorProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const departments: Department[] = [
  "COMP SCI",
  "MATH",
  "STAT",
  "DS",
  "BIOLOGY",
  "CHEM",
  "PHYSICS",
  "M E",
  "E C E",
];

const majors = [
  "Computer Science",
  "Mathematics",
  "Statistics",
  "Data Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Mechanical Engineering",
  "Electrical & Computer Engineering",
];

const graduationYears = [2025, 2026, 2027, 2028, 2029];

const Search = () => {
  const { isAuthenticated } = useAuth();
  const { data: tutorProfiles, isLoading, error } = useTutorProfiles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);

  const toggleSelection = <T,>(
    item: T,
    current: T[],
    setter: (value: T[]) => void
  ) => {
    if (current.includes(item)) {
      setter(current.filter((i) => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Tutor</h1>
          <p className="text-muted-foreground">
            Search by course, professor, topic, or use our advanced filters
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Input */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Course, topic, professor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <Label>Department</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <Checkbox
                        id={dept}
                        checked={selectedDepartments.includes(dept)}
                        onCheckedChange={() =>
                          toggleSelection(dept, selectedDepartments, setSelectedDepartments)
                        }
                      />
                      <label
                        htmlFor={dept}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Major Filter */}
              <div className="space-y-2">
                <Label>Major</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major} value={major}>
                        {major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <Label>Graduation Year</Label>
                <div className="flex flex-wrap gap-2">
                  {graduationYears.map((year) => (
                    <Badge
                      key={year}
                      variant={selectedYears.includes(year) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        toggleSelection(year, selectedYears, setSelectedYears)
                      }
                    >
                      {year}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <Label>Format</Label>
                <div className="space-y-2">
                  {["Online", "In-person", "Hybrid"].map((mode) => (
                    <div key={mode} className="flex items-center space-x-2">
                      <Checkbox
                        id={mode}
                        checked={selectedModes.includes(mode)}
                        onCheckedChange={() =>
                          toggleSelection(mode, selectedModes, setSelectedModes)
                        }
                      />
                      <label htmlFor={mode} className="text-sm cursor-pointer">
                        {mode}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Max Hourly Rate: ${maxPrice}</Label>
                <Slider
                  value={[maxPrice]}
                  onValueChange={(value) => setMaxPrice(value[0])}
                  max={100}
                  min={10}
                  step={5}
                />
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2">
                <Label>Minimum Rating</Label>
                <Select
                  value={minRating.toString()}
                  onValueChange={(value) => setMinRating(parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3">3.0+ stars</SelectItem>
                    <SelectItem value="4">4.0+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full">
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="tutors">
              <TabsList className="mb-6">
                <TabsTrigger value="tutors">Tutors</TabsTrigger>
                <TabsTrigger value="groups">Study Groups</TabsTrigger>
              </TabsList>

              <TabsContent value="tutors" className="space-y-4">
                {!isAuthenticated && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-8 text-center">
                      <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
                      <p className="text-muted-foreground mb-4">
                        Please log in with your @wisc.edu account to browse tutor profiles.
                        This prevents unauthorized data scraping and protects our community.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button asChild>
                          <Link to="/auth/login">Log In</Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link to="/auth/register">Create Account</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isAuthenticated && isLoading && (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                
                {isAuthenticated && error && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-destructive mb-2">
                        {error.message.includes("log in") 
                          ? "Authentication required. Please log in to continue."
                          : "Failed to load tutors. Please try again later."}
                      </p>
                      {error.message.includes("log in") && (
                        <Button asChild className="mt-4">
                          <Link to="/auth/login">Log In</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {isAuthenticated && !isLoading && !error && tutorProfiles?.map((tutor) => (
                  <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold flex items-center gap-2">
                                {tutor.name}
                                {tutor.is_verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    ✓ Verified
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {tutor.major} • {tutor.graduation_year}
                              </p>
                            </div>
                          </div>

                          {tutor.bio && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {tutor.bio}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {tutor.hourly_rate && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${tutor.hourly_rate}/hr
                              </div>
                            )}
                            {tutor.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {tutor.location}
                              </div>
                            )}
                            {tutor.availability && tutor.availability.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {tutor.availability.length} slots available
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-2">
                          <TutorReviewButton tutorId={tutor.id} />
                          <Button className="flex-1 md:flex-none">Book Session</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {isAuthenticated && !isLoading && !error && tutorProfiles?.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No tutors found. Be the first to register as a tutor!
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="groups">
                <p className="text-center text-muted-foreground py-8">
                  Study groups coming soon!
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
