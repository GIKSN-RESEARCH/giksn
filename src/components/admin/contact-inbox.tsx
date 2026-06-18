"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { markContactHandled } from "@/actions/contact";
import { Button } from "@/components/ui/button";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  handled: boolean;
  createdAt: Date;
};

export function ContactInbox({ messages }: { messages: ContactMessage[] }) {
  const [isPending, startTransition] = useTransition();

  function toggleHandled(id: string, handled: boolean) {
    startTransition(async () => {
      const result = await markContactHandled(id, handled);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  if (messages.length === 0) {
    return <p className="text-muted-foreground">No contact messages yet.</p>;
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <article
          key={msg.id}
          className="rounded-xl border border-border p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{msg.name}</h2>
              <a
                href={`mailto:${msg.email}`}
                className="text-sm text-muted-foreground underline"
              >
                {msg.email}
              </a>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-widest ${
                msg.handled
                  ? "border-foreground/20 text-muted-foreground"
                  : "border-amber-500/40 text-amber-200"
              }`}
            >
              {msg.handled ? "Handled" : "New"}
            </span>
          </div>

          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Received</dt>
              <dd>{msg.createdAt.toLocaleString()}</dd>
            </div>
            {msg.subject ? (
              <div>
                <dt className="text-muted-foreground">Subject</dt>
                <dd>{msg.subject}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">Message</dt>
              <dd className="mt-1 whitespace-pre-wrap">{msg.message}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => toggleHandled(msg.id, !msg.handled)}
            >
              {msg.handled ? "Mark as new" : "Mark as handled"}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}