"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { submitApplication } from "@/actions/applications";
import { TurnstileField } from "@/components/forms/turnstile-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { researchDomains } from "@/lib/site";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm";

export function ApplyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  function toggleDomain(domain: string) {
    setSelectedDomains((current) =>
      current.includes(domain)
        ? current.filter((d) => d !== domain)
        : [...current, domain]
    );
  }

  function handleSubmit(formData: FormData) {
    if (selectedDomains.length === 0) {
      toast.error("Select at least one research domain.");
      return;
    }

    selectedDomains.forEach((domain) => formData.append("domains", domain));

    startTransition(async () => {
      const result = await submitApplication(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSubmitted(true);
      formRef.current?.reset();
      setSelectedDomains([]);
      toast.success("Application submitted — we'll review it manually.");
    });
  }

  if (submitted) {
    return (
      <div className="card-elevated rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold">Application received</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thank you for applying. We review submissions manually and respond via
          email. Only a small number of contributors are onboarded at a time.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Submit another
          </Button>
          <Button render={<Link href="/join" />} variant="ghost">
            Back to Join
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      encType="multipart/form-data"
      className="space-y-6"
    >
      {/* Honeypot — hidden from users */}
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
          <label htmlFor="apply-name" className="text-sm text-muted-foreground">
            Full name
          </label>
          <Input
            id="apply-name"
            name="name"
            required
            minLength={2}
            className="mt-1"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="apply-email" className="text-sm text-muted-foreground">
            Email
          </label>
          <Input
            id="apply-email"
            name="email"
            type="email"
            required
            className="mt-1"
            autoComplete="email"
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm text-muted-foreground">
          Domains of interest <span className="text-destructive">*</span>
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {researchDomains.map((domain) => {
            const checked = selectedDomains.includes(domain.title);
            return (
              <label
                key={domain.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
                  checked
                    ? "border-foreground/30 bg-foreground/5"
                    : "border-border hover:border-foreground/20"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleDomain(domain.title)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium">{domain.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {domain.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="apply-background" className="text-sm text-muted-foreground">
          Relevant background &amp; expertise
        </label>
        <textarea
          id="apply-background"
          name="background"
          required
          minLength={50}
          rows={5}
          className={fieldClass}
          placeholder="Research areas, engineering experience, publications, systems you've built…"
        />
        <p className="mt-1 text-xs text-muted-foreground">Minimum 50 characters.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="apply-github" className="text-sm text-muted-foreground">
            GitHub <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <Input
            id="apply-github"
            name="github"
            type="url"
            placeholder="https://github.com/…"
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="apply-scholar" className="text-sm text-muted-foreground">
            Google Scholar <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <Input
            id="apply-scholar"
            name="scholar"
            type="url"
            placeholder="https://scholar.google.com/…"
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="apply-x" className="text-sm text-muted-foreground">
            X / Twitter <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <Input
            id="apply-x"
            name="x"
            type="url"
            placeholder="https://x.com/…"
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="apply-portfolio" className="text-sm text-muted-foreground">
            Portfolio / site <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <Input
            id="apply-portfolio"
            name="portfolio"
            type="url"
            placeholder="https://…"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="apply-cv" className="text-sm text-muted-foreground">
          CV / resume <span className="text-muted-foreground/60">(optional, PDF, max 5 MB)</span>
        </label>
        <input
          id="apply-cv"
          name="cv"
          type="file"
          accept="application/pdf,.pdf"
          className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground"
        />
      </div>

      <div>
        <label htmlFor="apply-motivation" className="text-sm text-muted-foreground">
          Why GIKSN? What do you want to work on?
        </label>
        <textarea
          id="apply-motivation"
          name="motivation"
          required
          minLength={50}
          rows={4}
          className={fieldClass}
          placeholder="Specific problems, project ideas, or explainers you'd contribute to…"
        />
      </div>

      <div>
        <label htmlFor="apply-evidence" className="text-sm text-muted-foreground">
          Evidence of deep work
        </label>
        <textarea
          id="apply-evidence"
          name="evidence"
          required
          minLength={30}
          rows={4}
          className={fieldClass}
          placeholder="Links to writing, repos, talks, or a short explanation showing you understand the kind of research GIKSN does…"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This is the most important field — it separates serious contributors from generic interest.
        </p>
      </div>

      <div>
        <label htmlFor="apply-referral" className="text-sm text-muted-foreground">
          Referral <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <Input
          id="apply-referral"
          name="referral"
          placeholder="Who pointed you here?"
          className="mt-1"
        />
      </div>

      <TurnstileField />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Submitting…" : "Submit application"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We review manually. You will hear back via email. Protected by rate limiting and Turnstile.
      </p>
    </form>
  );
}