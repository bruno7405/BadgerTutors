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
import { Star, Shield, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitReview } from "@/lib/solanaClient";
import { toast } from "sonner";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorId: string;
  studentWallet: string;
  sessionId: string;
  onReviewSubmitted: () => void;
}

export const ReviewDialog = ({
  open,
  onOpenChange,
  tutorId,
  studentWallet,
  sessionId,
  onReviewSubmitted,
}: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (reviewText.trim().length < 10) {
      toast.error("Please write at least 10 characters for your review");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReview(
        studentWallet,
        tutorId,
        sessionId,
        rating,
        reviewText.trim()
      );

      if (result.success) {
        toast.success(result.message);
        onReviewSubmitted();
        onOpenChange(false);
        setRating(0);
        setReviewText("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Leave a Review
          </DialogTitle>
          <DialogDescription>
            Your review will be stored immutably on-chain and linked to your completed session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="border-primary/20 bg-primary/5">
            <Lock className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Anonymous & Permanent:</strong> Your review is cryptographically verified but anonymous. 
              You can only submit one review per tutor.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating} star{rating !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review (Anonymous)</Label>
            <Textarea
              id="review"
              placeholder="Share your experience with this tutor. Your review will help other students..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/500 characters
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Blockchain Verification</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Session completion verified</p>
              <p>✓ Payment release confirmed</p>
              <p>✓ One-time review enforced</p>
              <p>✓ Immutable on-chain storage</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? "Submitting to Blockchain..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
