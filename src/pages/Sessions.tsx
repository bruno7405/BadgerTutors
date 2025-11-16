import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionConfirmationDialog } from "@/components/SessionConfirmationDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { processAutoRelease } from "@/lib/escrowClient";
import type { TutoringSession } from "@/types";

const Sessions = () => {
  const { user } = useAuth();
  const { walletAddress } = useWallet();
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TutoringSession | null>(
    null
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    loadSessions();
    // Check for auto-release every minute
    const interval = setInterval(() => {
      processAutoRelease().then((result) => {
        if (result.processed > 0) {
          loadSessions();
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadSessions = () => {
    const storedSessions = JSON.parse(
      localStorage.getItem("badger-tutors-sessions") || "[]"
    );
    // Filter sessions for current user
    const userSessions = storedSessions.filter(
      (s: TutoringSession) =>
        s.studentWallet === walletAddress || s.tutorId === user?.id
    );
    setSessions(userSessions);
  };

  const getUserRole = (session: TutoringSession): "student" | "tutor" => {
    return session.studentWallet === walletAddress ? "student" : "tutor";
  };

  const needsConfirmation = (session: TutoringSession): boolean => {
    const role = getUserRole(session);
    const isConfirmed =
      role === "student"
        ? session.confirmedByStudent
        : session.confirmedByTutor;
    return (
      session.status === "awaiting-confirmation" &&
      !session.paymentReleased &&
      !isConfirmed
    );
  };

  const getStatusBadge = (session: TutoringSession) => {
    if (session.status === "completed") {
      return (
        <Badge className="bg-badge-green text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (session.status === "awaiting-confirmation") {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Awaiting Confirmation
        </Badge>
      );
    }
    if (session.status === "disputed") {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Disputed
        </Badge>
      );
    }
    return <Badge>{session.status}</Badge>;
  };

  const handleOpenConfirmation = (session: TutoringSession) => {
    setSelectedSession(session);
    setConfirmDialogOpen(true);
  };

  const awaitingSessions = sessions.filter(
    (s) => s.status === "awaiting-confirmation"
  );
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const scheduledSessions = sessions.filter((s) => s.status === "scheduled");

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Sessions</h1>
          <p className="text-muted-foreground">
            Manage your tutoring sessions and confirmations
          </p>
        </div>

        {awaitingSessions.length > 0 && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Clock className="h-4 w-4 text-primary" />
            <AlertDescription>
              <strong>{awaitingSessions.length} session(s)</strong> waiting for your
              confirmation. Sessions auto-release payment after 24 hours.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="awaiting" className="space-y-6">
          <TabsList>
            <TabsTrigger value="awaiting">
              Awaiting Confirmation ({awaitingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedSessions.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled ({scheduledSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="awaiting" className="space-y-4">
            {awaitingSessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No sessions awaiting confirmation
                  </p>
                </CardContent>
              </Card>
            ) : (
              awaitingSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {getUserRole(session) === "student"
                                ? "Session with Tutor"
                                : "Session with Student"}
                            </h3>
                            {getStatusBadge(session)}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.scheduledTime).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {session.duration} minutes
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            ${session.amount} (in escrow)
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            {session.escrowStatus === "locked" && "Payment locked in escrow"}
                          </div>
                        </div>

                        <div className="mt-3 space-y-1">
                          {session.confirmedByStudent && (
                            <p className="text-sm text-badge-green">
                              ✓ Student confirmed
                            </p>
                          )}
                          {session.confirmedByTutor && (
                            <p className="text-sm text-badge-green">
                              ✓ Tutor confirmed
                            </p>
                          )}
                          {session.confirmationDeadline && (
                            <p className="text-sm text-muted-foreground">
                              Auto-release:{" "}
                              {new Date(
                                session.confirmationDeadline
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {needsConfirmation(session) && (
                        <Button onClick={() => handleOpenConfirmation(session)}>
                          Confirm Session
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedSessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No completed sessions yet</p>
                </CardContent>
              </Card>
            ) : (
              completedSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {getUserRole(session) === "student"
                                ? "Session with Tutor"
                                : "Session with Student"}
                            </h3>
                            {getStatusBadge(session)}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.scheduledTime).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            ${session.amount} - Payment released
                          </div>
                          {session.autoReleaseTriggered && (
                            <p className="text-xs text-muted-foreground">
                              ⏰ Auto-released after 24h deadline
                            </p>
                          )}
                          {session.transactionHash && (
                            <p className="text-xs font-mono text-muted-foreground">
                              TX: {session.transactionHash.slice(0, 16)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledSessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No scheduled sessions</p>
                </CardContent>
              </Card>
            ) : (
              scheduledSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="space-y-2 text-sm">
                      <h3 className="text-lg font-semibold mb-2">Upcoming Session</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.scheduledTime).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        ${session.amount} (pending escrow)
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedSession && (
        <SessionConfirmationDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          session={selectedSession}
          userRole={getUserRole(selectedSession)}
          userWallet={walletAddress || ""}
          onConfirmed={loadSessions}
        />
      )}
    </div>
  );
};

export default Sessions;
