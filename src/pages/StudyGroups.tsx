import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockStudyGroups } from "@/lib/mockData";
import { Users, Calendar, MapPin, Plus } from "lucide-react";

const StudyGroups = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
            <p className="text-muted-foreground">
              Join collaborative study sessions with your peers
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStudyGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.groupName}</CardTitle>
                    <CardDescription>
                      {group.course.department} {group.course.courseNumber}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      group.groupType === "exam-focused"
                        ? "default"
                        : group.groupType === "serious"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {group.groupType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{group.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {group.currentMembers}/{group.maxMembers} members
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{group.meetingTimes[0]}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{group.meetingLocation}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Led by <span className="font-medium text-foreground">{group.leader.name}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">View Details</Button>
                  <Button variant="outline" className="flex-1">
                    Request to Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;
