import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { CATEGORIES } from "@/lib/papers";

export default function AboutPage() {
  return (
    <>
      <Masthead />
      <CategoryNav />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <article className="grid grid-cols-12 gap-6 md:gap-10">
          <header className="col-span-12 pb-8 sm:pb-10 border-b border-rule">
            <div className="kicker mb-3">About the lab</div>
            <h1
              className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[20ch]"
              style={{ fontSize: "clamp(2rem, 6vw, 4.6rem)" }}
            >
              A research lab, <span className="text-accent">built in public</span>.
            </h1>
            <p className="mt-5 sm:mt-7 max-w-[60ch] text-[16px] sm:text-[19px] leading-[1.55] text-ink-soft font-display italic">
              GIKSN Research is a community-first lab working on AI, Deeptech,
              Hardware, and Distributed Systems. We write, we build, and we
              publish the arguments as well as the conclusions.
            </p>
          </header>

          <div className="col-span-12 md:col-span-8 pt-6 md:pt-8 prose-body">
            <p className="dropcap">
              Most research either sits behind a paywall, behind a slide deck,
              or behind a private Discord. The reasoning that led to a result
              is almost never legible from the outside, so the alternatives
              never get argued in public. GIKSN exists to keep that record.
            </p>
            <p>
              A paper here can be small. It can be a draft someone abandoned
              halfway. It can be a survey of a subfield that turns out to be
              already crowded. The format is borrowed from technical RFCs; the
              tone is closer to a working notebook.
            </p>

            <h2>Why the lab exists</h2>
            <p>
              AI and Deeptech get most of our cycles because that is where the
              lab thinks the next decade of leverage is. Hardware and
              Distributed Systems are the substrate everything else runs on,
              so we treat them as research targets in their own right, not
              plumbing. Cross-sector work is the point. Compute means little
              without the models on top of it, and the models mean little
              without the systems that let them run.
            </p>
            <p>
              We bootstrap through the community. Funding comes after maturity
              and tangible output, not before. The site is the front door and
              the record. Telegram is the room where day-to-day work happens.
            </p>

            <h2>Who reads here</h2>
            <p>
              Three audiences, on purpose:
            </p>
            <ul>
              <li>
                <strong className="font-display">Researchers</strong> looking
                for a place to write down half-formed ideas without waiting for
                a conference deadline.
              </li>
              <li>
                <strong className="font-display">Builders</strong> who want to
                see the reasoning behind the tools and protocols the lab is
                shipping.
              </li>
              <li>
                <strong className="font-display">The wider community</strong>
                {" "}reading quietly. Feedback is welcome. Applications to
                contribute are the path in.
              </li>
            </ul>

            <h2>What lives here</h2>
            <p>
              Four sectors plus a wire for lab updates. Every paper has an
              abstract, a body, a status, and a discussion thread. Authors are
              credited. Editors do not rewrite voice.
            </p>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.code}>
                  <strong className="font-display">{c.full} ({c.code}).</strong>{" "}
                  {c.blurb}
                </li>
              ))}
            </ul>

            <h2>How statuses move</h2>
            <p>
              Status describes where the research is, not the editorial state
              of the document. Five stages:
            </p>
            <ul>
              <li>
                <strong className="font-display">Exploration.</strong>{" "}
                Sketching. Open questions, no strong claims yet.
              </li>
              <li>
                <strong className="font-display">Draft.</strong> Being written.
                The argument has a shape but is still being edited.
              </li>
              <li>
                <strong className="font-display">Preprint.</strong> Public and
                open for critique. The lab is asking to be argued with.
              </li>
              <li>
                <strong className="font-display">Published.</strong> Final
                version. The lab stands by it.
              </li>
              <li>
                <strong className="font-display">Landmark.</strong>{" "}
                Foundational. Cited widely, referenced by later work.
              </li>
              <li>
                <strong className="font-display">Product.</strong>{" "}
                Shipped and available. Used for entries that describe a
                tool or protocol the lab has built and released.
              </li>
            </ul>
            <p>
              Status can move backward when reality demands it. That is the
              archive doing its job.
            </p>

            <h2>Contribution is gated</h2>
            <p>
              Anyone can read. Anyone can apply. Not everyone gets to work on
              the research. The wall exists because the work requires people
              who can actually understand it and continue it. Accepted
              applicants get contributor accounts on the platform and access
              tokens for the private Telegram channels.
            </p>
            <p>
              The public Telegram channel is open. The private channels are
              where working groups coordinate. Both are linked from the
              community page once it lands.
            </p>

            <h2>Editing and credit</h2>
            <p>
              Authors keep editorial control of their own papers. Editors
              copy-edit for clarity and fix typos. Discussion is preserved
              verbatim, except where moderation removes a comment. In that
              case a placeholder is left in the thread with a one-line reason.
            </p>
            <blockquote>
              The record matters more than the verdict. We keep rejected
              directions because we want to remember what we considered.
            </blockquote>
          </div>

          <aside className="col-span-12 md:col-span-4 pt-2 md:pt-8 md:border-l md:border-rule md:pl-8">
            <div className="kicker mb-3">Three principles</div>
            <ol className="space-y-5">
              {[
                {
                  n: "01",
                  t: "Openness",
                  b: "Research, tools, and reasoning published where anyone can read them.",
                },
                {
                  n: "02",
                  t: "Rigor",
                  b: "Cite specifics, name failure modes, argue with substance not vibes.",
                },
                {
                  n: "03",
                  t: "Collaboration",
                  b: "Contribution is vetted, not because the door is closed but because the work is real.",
                },
              ].map((r) => (
                <li key={r.n}>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-mono text-[11px] text-accent tracking-[0.16em]">
                      {r.n}
                    </span>
                    <span className="font-display font-semibold text-[1.05rem] tracking-[-0.01em]">
                      {r.t}
                    </span>
                  </div>
                  <p className="text-[14px] text-ink-soft leading-[1.6] pl-7">
                    {r.b}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-10 divider-dashed" />
            <div className="mt-8">
              <Link
                href="/submit"
                className="inline-block bg-accent text-paper px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors"
              >
                Submit a paper →
              </Link>
            </div>
          </aside>
        </article>
      </main>
      <Footer />
    </>
  );
}
