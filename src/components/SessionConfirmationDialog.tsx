import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Clock, Lock } from "lucide-react";
import { confirmSession, reportSessionIssue } from "@/lib/escrowClient";
import { toast } from "sonner";
import type { TutoringSession } from "@/types";

interface SessionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: TutoringSession;
  userRole: "student" | "tutor";
  userWallet: string;
  onConfirmed: () => void;
}

export const SessionConfirmationDialog = ({
  open,
  onOpenChange,
  session,
  userRole,
  userWallet,
  onConfirmed,
}: SessionConfirmationDialogProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [issueReason, setIssueReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const isAlreadyConfirmed =
    userRole === "student"
      ? session.confirmedByStudent
      : session.confirmedByTutor;

  const otherPartyConfirmed =
    userRole === "student"
      ? session.confirmedByTutor
      : session.confirmedByStudent;

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      const result = await confirmSession(session.id, userWallet, userRole);

      if (result.success) {
        toast.success(result.message);
        onConfirmed();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to confirm session");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReportIssue = async () => {
    if (issueReason.trim().length < 10) {
      toast.error("Please describe the issue (at least 10 characters)");
      return;
    }

    setIsReporting(true);

    try {
      const result = await reportSessionIssue(
        session.id,
        userWallet,
        issueReason
      );

      if (result.success) {
        toast.success(result.message);
        onConfirmed();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to report issue");
    } finally {
      setIsReporting(false);
    }
  };

  const getDeadlineDisplay = () => {
    if (!session.confirmationDeadline) return null;
    const deadline = new Date(session.confirmationDeadline);
    const now = new Date();
    const hoursLeft = Math.max(
      0,
      Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
    );
    return `${hoursLeft}h remaining`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Confirm Session Completion
          </DialogTitle>
          <DialogDescription>
            Confirm that the session was completed successfully to release payment from escrow.
          </DialogDescription>
        </DialogHeader>

        {!showReportIssue ? (
          <div className="space-y-4">
            <Alert className="border-primary/20 bg-primary/5">
              <Lock className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>Escrow Protection:</strong> ${session.amount} is held in escrow until
                confirmation. {otherPartyConfirmed && "Other party has confirmed."}
              </AlertDescription>
            </Alert>

            {isAlreadyConfirmed ? (
              <Alert className="border-badge-green/20 bg-badge-green/5">
                <CheckCircle2 className="h-4 w-4 text-badge-green" />
                <AlertDescription>
                  <strong>You've confirmed this session.</strong>
                  {!otherPartyConfirmed && session.confirmationDeadline && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      Auto-release in {getDeadlineDisplay()}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Session Details</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Amount: ${session.amount}</p>
                    <p>Duration: {session.duration} minutes</p>
                    <p>
                      Scheduled:{" "}
                      {new Date(session.scheduledTime).toLocaleString()}
                    </p>
                    {otherPartyConfirmed && (
                      <p className="text-badge-green font-medium">
                        ✓ Other party confirmed
                      </p>
                    )}
                  </div>
                </div>

                {session.confirmationDeadline && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      If you don't confirm, payment will auto-release in{" "}
                      <strong>{getDeadlineDisplay()}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="w-full"
                    size="lg"
                  >
                    {isConfirming ? "Confirming..." : "✓ Confirm Session Completed"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowReportIssue(true)}
                    className="w-full"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription>
                Reporting an issue will freeze the escrow pending review.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="issue">Describe the issue</Label>
              <Textarea
                id="issue"
                placeholder="Please explain what went wrong with this session..."
                value={issueReason}
                onChange={(e) => setIssueReason(e.target.value)}
                rows={5}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {issueReason.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowReportIssue(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReportIssue}
                disabled={isReporting}
                className="flex-1"
              >
                {isReporting ? "Reporting..." : "Submit Issue"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
