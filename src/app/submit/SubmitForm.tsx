"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  CATEGORIES,
  KINDS,
  PAPER_CATEGORIES,
  type Category,
  type Kind,
} from "@/lib/papers";
import { parseBody } from "@/lib/parseBody";
import { BodyPreview, PreviewTabs } from "@/components/BodyPreview";
import { EditorialSelect } from "@/components/EditorialSelect";
import {
  CONTACT_PLATFORMS,
  buildContactUrl,
  type ContactPlatform,
} from "@/lib/contact";

const READING_WORDS_PER_MIN = 220;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / READING_WORDS_PER_MIN));
}

type Status = "idle" | "submitting" | "ok" | "error";

type SubmissionType = "paper" | "update";

const paperCategoryList = CATEGORIES.filter((c) =>
  (PAPER_CATEGORIES as readonly string[]).includes(c.code)
);

export function SubmitForm({
  initialType = "paper",
}: {
  initialType?: SubmissionType;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [submissionType, setSubmissionType] =
    useState<SubmissionType>(initialType);
  const [category, setCategory] = useState<Category>(
    initialType === "update" ? "UP" : paperCategoryList[0].code
  );
  const [kind, setKind] = useState<Kind>("Original");
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [contactPlatform, setContactPlatform] =
    useState<ContactPlatform>("twitter");
  const [contactValue, setContactValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [issues, setIssues] = useState<{ path: string; message: string }[]>([]);
  const [bodyMode, setBodyMode] = useState<"write" | "preview">("write");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    setIssues([]);

    const sections = parseBody(body);
    if (sections.length === 0) {
      setStatus("error");
      setErrorMsg("The body can't be empty.");
      return;
    }

    const trimmedContact = contactValue.trim().replace(/^@/, "");
    if (!trimmedContact) {
      setStatus("error");
      setErrorMsg("Add a contact handle so editors can reach you.");
      return;
    }
    if (
      contactPlatform === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact)
    ) {
      setStatus("error");
      setErrorMsg("That doesn't look like a valid email address.");
      return;
    }

    if (submissionType === "update" && !source.trim()) {
      setStatus("error");
      setErrorMsg("Name the source organization (the lab, group, or org announcing this).");
      return;
    }

    const payload =
      submissionType === "update"
        ? {
            category: "UP" as Category,
            slug: slugify(title),
            title: title.trim(),
            abstract: abstract.trim(),
            author: author.trim(),
            authorHandle: buildContactUrl(contactPlatform, trimmedContact),
            source: source.trim(),
            body: sections,
            readingMinutes: estimateReadingMinutes(body),
          }
        : {
            category,
            kind,
            slug: slugify(title),
            title: title.trim(),
            abstract: abstract.trim(),
            author: author.trim(),
            authorHandle: buildContactUrl(contactPlatform, trimmedContact),
            body: sections,
            readingMinutes: estimateReadingMinutes(body),
          };

    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong.");
        if (Array.isArray(data.issues)) {
          setIssues(
            data.issues.map((i: { path: (string | number)[]; message: string }) => ({
              path: i.path.join("."),
              message: i.message,
            }))
          );
        }
        return;
      }
      setStatus("ok");
      const paper = data.paper;
      startTransition(() => {
        router.push(
          `/${String(paper.category).toLowerCase()}/${paper.slug}`
        );
        router.refresh();
      });
    } catch (e) {
      setStatus("error");
      setErrorMsg(
        e instanceof Error ? e.message : "Network error. Try again in a moment."
      );
    }
  }

  const submitting = status === "submitting";

  const bodyPlaceholder =
    submissionType === "update"
      ? `One-paragraph lede stating what is being announced.\n\n## What it is\nThe factual description of the update.\n\n## Key dates and eligibility\nOpen / close dates, who can participate, how to sign up.\n\n## Why it matters now\nThe editorial context. What changed, why this matters this cycle.\n\n## Open questions\nWhat is unclear. What is contestable.\n\n## Reference\n[Official link](https://example.com)`
      : kind === "Original"
        ? `One-sentence framing of the research question.\n\n## Problem\nThe specific gap or failure mode this addresses.\n\n## Approach\nThe angle or method. Why this shape, not another.\n\n## Why now\nWhat changed in the last 12 months that makes this tractable.\n\n## Prior work\n- Existing attempts and what they left on the table\n- Related lines of research and how they relate\n\n## Open questions\nThe honest ones, not rhetorical.`
        : `The first paragraph names the subfield and the state of it.\n\n## The landscape\nWho is working on what, with citations where possible.\n\n## What is settled\nThe results the field has converged on.\n\n## What is open\nThe questions still worth spending compute on.\n\n## Where the lab thinks the leverage is\nA specific position, argued.`;

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* Step 00: Type */}
      <div>
        <div className="kicker mb-3">Step 00: What are you submitting?</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 border border-rule">
          {[
            {
              code: "paper" as const,
              label: "Paper",
              full: "Original research or a survey",
              blurb:
                "AI, Deeptech, Hardware, or Distributed Systems. Original work or a survey of a subfield the lab wants to reason about.",
            },
            {
              code: "update" as const,
              label: "Update",
              full: "An announcement or news",
              blurb:
                "A lab update. Cohort opening, release, program date, or another factual update from the lab or a partner org.",
            },
          ].map((opt, i) => (
            <label
              key={opt.code}
              className={`relative cursor-pointer p-4 hover:bg-accent-wash transition-colors ${
                i === 0 ? "border-b sm:border-b-0 sm:border-r border-rule" : ""
              }`}
            >
              <input
                type="radio"
                name="submissionType"
                value={opt.code}
                className="sr-only peer"
                checked={submissionType === opt.code}
                onChange={() => {
                  setSubmissionType(opt.code);
                  if (opt.code === "update") {
                    setCategory("UP");
                  } else {
                    setCategory(paperCategoryList[0].code);
                  }
                }}
              />
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent mb-2">
                {opt.label}
              </div>
              <div className="font-display font-semibold text-[14px] tracking-[-0.01em] text-ink leading-tight">
                {opt.full}
              </div>
              <p className="mt-2 text-[12px] text-ink-soft leading-[1.5]">
                {opt.blurb}
              </p>
              <div
                aria-hidden
                className="absolute inset-0 border-2 border-accent opacity-0 peer-checked:opacity-100 pointer-events-none"
              />
            </label>
          ))}
        </div>
      </div>

      {submissionType === "paper" ? (
        <>
          <div>
            <div className="kicker mb-3">Step 01: Sector</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-rule">
              {paperCategoryList.map((c, i) => (
                <label
                  key={c.code}
                  className={`relative cursor-pointer p-4 hover:bg-accent-wash transition-colors ${
                    i < paperCategoryList.length - 1
                      ? "border-b sm:border-b-0 sm:border-r border-rule"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={c.code}
                    className="sr-only peer"
                    checked={category === c.code}
                    onChange={() => setCategory(c.code)}
                  />
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent mb-2">
                    {c.code}
                  </div>
                  <div className="font-display font-semibold text-[14px] tracking-[-0.01em] text-ink leading-tight">
                    {c.full}
                  </div>
                  <div
                    aria-hidden
                    className="absolute inset-0 border-2 border-accent opacity-0 peer-checked:opacity-100 pointer-events-none"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
              <div className="kicker">Step 02: Kind</div>
              <span className="font-display italic text-ink-soft text-[13px] max-w-[42ch]">
                Original research or a survey of the existing landscape? Both
                are valid in any sector.
              </span>
            </div>
            <EditorialSelect
              value={kind}
              onChange={setKind}
              ariaLabel="Paper kind"
              options={KINDS.map((k) => ({
                value: k.code,
                label: k.label,
                hint: k.blurb,
              }))}
            />
          </div>
        </>
      ) : (
        <div>
          <div className="kicker mb-3">Step 01: Source organization</div>
          <input
            type="text"
            required
            minLength={2}
            maxLength={160}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="GIKSN Research, a partner lab, a program, etc."
            className="block w-full bg-paper border-b border-rule focus:border-accent outline-none py-3 text-[1.1rem] font-display"
          />
          <p className="mt-2 text-[12px] text-ink-faint italic">
            The org doing the announcing. Shown prominently on the update page.
          </p>
        </div>
      )}

      <div>
        <div className="kicker mb-3">Step 03: Title</div>
        <input
          type="text"
          required
          minLength={8}
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A specific verb. A specific noun. Skip the adjectives."
          className="block w-full bg-paper border-b border-rule focus:border-accent outline-none py-3 text-[1.4rem] font-display tracking-[-0.01em]"
        />
        <p className="mt-2 text-[12px] text-ink-faint italic">
          Slug will be: <span className="font-mono text-ink-soft">{title ? slugify(title) : "—"}</span>
        </p>
      </div>

      <div>
        <div className="kicker mb-3">Step 04: Abstract</div>
        <textarea
          rows={4}
          required
          minLength={40}
          maxLength={800}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Two or three sentences. State the problem and the proposed change. Don't sell it."
          className="block w-full bg-paper border border-rule focus:border-accent outline-none p-4 text-[15px] leading-[1.65] resize-y"
        />
      </div>

      <div>
        <div className="kicker mb-3">Step 05: Body</div>
        <PreviewTabs mode={bodyMode} onChange={setBodyMode} />
        {bodyMode === "write" ? (
          <textarea
            rows={14}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={bodyPlaceholder}
            className="block w-full bg-paper border border-rule focus:border-accent outline-none p-4 text-[15px] leading-[1.7] resize-y font-mono"
          />
        ) : (
          <BodyPreview body={body} />
        )}
        <p className="mt-2 text-[12px] text-ink-faint italic leading-[1.55]">
          <span className="block">
            Sections: <code className="font-mono not-italic">## Heading</code> ·
            Subheads: <code className="font-mono not-italic">### Title</code> ·
            Lists: <code className="font-mono not-italic">- item</code> ·
            Code: fenced <code className="font-mono not-italic">```lang</code> ·
            Tables: GFM pipe syntax ·
            Pullquote: <code className="font-mono not-italic">&gt; line</code>.
          </span>
          <span className="block mt-1">
            Inline: <code className="font-mono not-italic">**bold**</code>,{" "}
            <code className="font-mono not-italic">*italic*</code>,{" "}
            <code className="font-mono not-italic">`code`</code>,{" "}
            <code className="font-mono not-italic">[label](https://url)</code>.
            Use the Preview tab to check formatting before you submit.
          </span>
        </p>
      </div>

      <div className="space-y-6">
        <label className="block">
          <div className="kicker mb-2">Your name</div>
          <input
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="As you'd like to be credited"
            className="block w-full bg-paper border-b border-rule focus:border-accent outline-none py-2 text-[15px]"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] gap-6">
          <div>
            <div className="kicker mb-2">Contact via</div>
            <EditorialSelect
              value={contactPlatform}
              onChange={setContactPlatform}
              ariaLabel="Contact platform"
              options={CONTACT_PLATFORMS.map((p) => ({
                value: p.code,
                label: p.label,
                hint: p.hint,
              }))}
            />
          </div>
          <label className="block">
            <div className="kicker mb-2">
              {contactPlatform === "email" ? "Email address" : "Handle"}
            </div>
            <input
              type={contactPlatform === "email" ? "email" : "text"}
              required
              minLength={2}
              maxLength={120}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={
                CONTACT_PLATFORMS.find((p) => p.code === contactPlatform)
                  ?.placeholder ?? ""
              }
              className="block w-full bg-paper border-b border-rule focus:border-accent outline-none py-2 text-[15px]"
              autoComplete="off"
            />
            <p className="mt-2 text-[12px] text-ink-faint italic">
              {contactPlatform === "email"
                ? "Shown as a mailto link on your paper."
                : `Shown as a link to ${
                    contactPlatform === "twitter"
                      ? "x.com"
                      : contactPlatform === "github"
                      ? "github.com"
                      : "t.me"
                  }/${contactValue.trim().replace(/^@/, "") || "<handle>"}.`}
            </p>
          </label>
        </div>
      </div>

      {status === "error" && errorMsg && (
        <div className="border border-accent/60 bg-accent-wash p-4 text-[13px] text-ink">
          <div className="font-mono uppercase tracking-[0.14em] text-[11px] text-accent-deep mb-1">
            Submission rejected
          </div>
          <p>{errorMsg}</p>
          {issues.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-ink-soft">
              {issues.map((i, n) => (
                <li key={n}>
                  <span className="font-mono">{i.path}</span>: {i.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {status === "ok" && (
        <div className="border border-accent/60 bg-accent-wash p-4 text-[13px] text-ink">
          Submitted. Redirecting to the paper…
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-rule">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint max-w-[42ch]">
          Submitted as <em className="not-italic text-ink">Exploration</em>. An
          editor moves it through Draft → Preprint → Published as the research
          matures.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent !text-white px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit for review →"}
          </button>
        </div>
      </div>
    </form>
  );
}
