"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { redeemInvitation } from "@/actions/invitations";
import { Button } from "@/components/ui/button";

export function InviteRedeemForm({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRedeem() {
    startTransition(async () => {
      const result = await redeemInvitation(token);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Contributor account activated.");
      router.push(result.data.redirectTo);
    });
  }

  return (
    <Button onClick={handleRedeem} disabled={isPending} size="lg">
      {isPending ? "Activating…" : "Activate contributor account"}
    </Button>
  );
}