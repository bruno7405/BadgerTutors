import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ReviewDialog } from "./ReviewDialog";
import { canSubmitReview } from "@/lib/solanaClient";
import { Star, Lock } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface TutorReviewButtonProps {
  tutorId: string;
  onReviewSubmitted?: () => void;
}

export const TutorReviewButton = ({
  tutorId,
  onReviewSubmitted,
}: TutorReviewButtonProps) => {
  const { walletAddress } = useWallet();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [ineligibilityReason, setIneligibilityReason] = useState<string>("");

  useEffect(() => {
    checkEligibility();
  }, [walletAddress, tutorId]);

  const checkEligibility = async () => {
    if (!walletAddress) {
      setCanReview(false);
      setIneligibilityReason("Connect your wallet to leave a review");
      return;
    }

    setCheckingEligibility(true);

    try {
      const result = await canSubmitReview(walletAddress, tutorId);
      setCanReview(result.canReview);
      if (!result.canReview) {
        setIneligibilityReason(result.reason || "Cannot review this tutor");
      }
    } catch (error) {
      setCanReview(false);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleButtonClick = () => {
    if (!canReview) {
      toast.error(ineligibilityReason);
      return;
    }
    setDialogOpen(true);
  };

  const handleReviewSubmitted = () => {
    setCanReview(false);
    checkEligibility();
    onReviewSubmitted?.();
  };

  // Get a mock session ID for the completed session
  const getSessionId = () => {
    if (!walletAddress) return "";
    const sessions = JSON.parse(
      localStorage.getItem("badger-tutors-sessions") || "[]"
    );
    const completedSession = sessions.find(
      (s: any) =>
        s.studentWallet === walletAddress &&
        s.tutorId === tutorId &&
        s.status === "completed"
    );
    return completedSession?.id || "";
  };

  return (
    <>
      <Button
        variant={canReview ? "default" : "outline"}
        size="sm"
        onClick={handleButtonClick}
        disabled={checkingEligibility}
        className="gap-2"
      >
        {canReview ? (
          <>
            <Star className="h-4 w-4" />
            Leave Review
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            {checkingEligibility ? "Checking..." : "Review"}
          </>
        )}
      </Button>

      {canReview && walletAddress && (
        <ReviewDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tutorId={tutorId}
          studentWallet={walletAddress}
          sessionId={getSessionId()}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
};
