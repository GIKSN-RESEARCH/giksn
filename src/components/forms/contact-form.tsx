"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { submitContactMessage } from "@/actions/contact";
import { TurnstileField } from "@/components/forms/turnstile-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitContactMessage(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setSubmitted(true);
      toast.success("Message sent — we'll get back to you.");
    });
  }

  if (submitted) {
    return (
      <div className="card-elevated rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold">Thanks for reaching out</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your message is in our inbox. We typically respond within a few business days.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm text-muted-foreground">
            Name
          </label>
          <Input
            id="contact-name"
            name="name"
            required
            className="mt-1"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm text-muted-foreground">
            Email
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            className="mt-1"
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="text-sm text-muted-foreground">
          Subject <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <Input id="contact-subject" name="subject" className="mt-1" />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm text-muted-foreground">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm"
          placeholder="Collaboration ideas, press inquiries, or general questions…"
        />
      </div>

      <TurnstileField />

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Sending…" : "Send message"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Protected by rate limiting and Cloudflare Turnstile. Do not include sensitive credentials.
      </p>
    </form>
  );
}