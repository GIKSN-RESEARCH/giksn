"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { reviewApplication } from "@/actions/applications";
import { Button } from "@/components/ui/button";

type Application = {
  id: string;
  name: string;
  email: string;
  status: string;
  reviewerNotes: string | null;
};

export function ApplicationReviewPanel({ application }: { application: Application }) {
  const [isPending, startTransition] = useTransition();

  function handleDecision(decision: "accept" | "reject" | "waitlist") {
    const notes = (
      document.getElementById(`notes-${application.id}`) as HTMLTextAreaElement | null
    )?.value;

    const confirmMessage =
      decision === "accept"
        ? `Accept ${application.name} and send invitation email?`
        : `${decision === "reject" ? "Reject" : "Waitlist"} ${application.name}?`;

    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      const result = await reviewApplication({
        id: application.id,
        decision,
        reviewerNotes: notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        decision === "accept"
          ? "Invitation sent."
          : `Application marked ${decision}.`
      );
    });
  }

  const reviewed = ["accepted", "rejected", "waitlisted", "under_review"].includes(
    application.status
  );

  return (
    <div className="mt-6 border-t border-border pt-4">
      <label
        htmlFor={`notes-${application.id}`}
        className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        Reviewer notes (private)
      </label>
      <textarea
        id={`notes-${application.id}`}
        defaultValue={application.reviewerNotes ?? ""}
        rows={3}
        className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm"
        placeholder="Internal notes — not sent to applicant"
        disabled={reviewed || isPending}
      />

      {!reviewed ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => handleDecision("accept")}
          >
            Accept & invite
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleDecision("waitlist")}
          >
            Waitlist
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => handleDecision("reject")}
          >
            Reject
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          Reviewed — status: {application.status}
        </p>
      )}
    </div>
  );
}