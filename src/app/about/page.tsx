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
      <main className="w-full mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <article className="grid grid-cols-12 gap-6 md:gap-10">
          <header className="col-span-12 pb-8 sm:pb-10 border-b border-rule">
            <div className="kicker mb-3">About the lab</div>
            <h1
              className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[20ch]"
              style={{ fontSize: "clamp(2rem, 6vw, 4.6rem)" }}
            >
              A research lab, <span className="text-accent">built in public</span>.
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-ink-soft">
              <span className="text-accent">GIKSN</span>
              <span aria-hidden className="text-ink-faint">
                ·
              </span>
              <span>General Intelligence Kinetic Systems Node</span>
            </div>
            <p className="mt-5 sm:mt-7 max-w-[62ch] text-[16px] sm:text-[19px] leading-[1.55] text-ink-soft font-display italic">
              GIKSN Research builds the AI stack from first principles in Rust: the inference engine underneath and the agent frameworks on top. Every layer ships as open source with a paper explaining how it works and where it falls short. Go implementations follow Rust.
            </p>
          </header>

          <div className="col-span-12 md:col-span-8 pt-6 md:pt-8 prose-body">
            <p className="dropcap">
              The work runs from GPU kernels to agents, in public.
            </p>

            <h2>What we mean by implementing the stack</h2>
            <p>
              Two halves. On the inference side: a Qwen3 forward pass on the CPU, then CUDA kernels, a paged KV cache, continuous batching, quantization, speculative decoding and an OpenAI-compatible server.
            </p>
            <p>
              On the agent side: messages and tools, chains, a stateful graph runtime with checkpoints and interrupts and an agent server.
            </p>
            <p>
              Each piece is tested against a reference implementation before it counts as done.
            </p>

            <h2>Why Rust, then Go</h2>
            <p>
              Production AI is long-running, concurrent and stateful. Rust gives static binaries, low memory per concurrent agent, types that catch malformed tool calls before a model does and a direct path to the GPU.
            </p>
            <p>
              Go follows for the backend teams who already run it.
            </p>

            <h2>Why rebuild what exists</h2>
            <p>
              vLLM, Candle, Rig and LangGraph already exist. Building them again is the fastest way to understand them, and the write-ups become the record.
            </p>
            <p>
              Where our version is slower or less complete, the paper says so.
            </p>
            <p>
              Agent memory and small-model research continue as a thread inside the AI sector.
            </p>

            <h2>What Rinne is doing in the middle of this</h2>
            <p>
              Rinne is the first tool the lab has shipped. It is an
              orchestrator you talk to from your terminal. You tell it
              what you want done. It plans the work into a graph, hands
              pieces of that graph to whichever coding-agent CLI or model
              API on your machine is best suited to the piece, and
              verifies each result before moving on. Nothing is hosted
              anywhere. Nothing phones home. Your API keys stay in your
              OS keychain.
            </p>
            <p>
              Rinne is not the memory research. It came out of the memory
              research. While building the substrate that would give a
              small model context, we needed a way to actually run agents
              on our own machines to see how they behaved. Existing
              options either wanted a subscription, wanted a hosted
              account, or wanted us to pick one model family. Rinne was
              the tool we built for ourselves. Then we decided it was
              worth releasing.
            </p>
            <p>
              Its paper lives in the AI sector. The next tools out of the
              lab will follow the same rule. They ship when they are
              useful. They land with a companion paper. The paper
              describes why we made the choices we made, including the
              ones we are not sure about.
            </p>

            <h2>The archive</h2>
            <p>
              Every paper has an abstract, a body, a category, an author
              line and a discussion thread underneath. The format borrows
              from technical RFCs. The tone is closer to a working
              notebook than a journal submission.
            </p>
            <p>
              A paper here can be small. It can be a survey that turns
              out to describe a crowded subfield. It can be a draft
              someone abandoned halfway when the experiment they meant to
              run got expensive. Rejected directions stay in the archive
              because half the value of writing anything down is that
              later you can point at it and say &ldquo;we already thought
              about this, here is why we did not do it.&rdquo;
            </p>

            <h2>How categories work</h2>
            <p>
              Category marks what kind of work a post is. Four kinds.
            </p>
            <ul>
              <li>
                <strong className="font-display">Research.</strong>{" "}
                Papers and technical work from the lab and contributors.
              </li>
              <li>
                <strong className="font-display">Writings.</strong> Essays,
                notes and commentary that sit outside a formal paper.
              </li>
              <li>
                <strong className="font-display">Products.</strong> Shipped
                tools and releases the lab has put into the world.
              </li>
              <li>
                <strong className="font-display">Programs.</strong> Cohorts,
                fellowships and community work.
              </li>
            </ul>
            <p>
              Category can change if a post grows into something else. If a
              writing turns into a research paper or a release graduates into
              a product page, update the category and leave a note so the
              trail is readable.
            </p>

            <h2>How the four sectors fit</h2>
            <p>
              The archive is organised across four sectors: AI, Deeptech, Hardware and Distributed Systems.
            </p>
            <p>
              AI covers agent frameworks, models and evals.
            </p>
            <p>
              Hardware covers GPU kernels, quantization and memory bandwidth. Distributed Systems covers serving: batching, paged KV cache, tensor parallelism and routing.
            </p>
            <p>
              Deeptech stays the longer-horizon survey track, and Updates carries announcements.
            </p>
            <p>
              Contributor writing is welcome in all four sectors and expected to be the majority in Deeptech, Hardware and Distributed Systems for the foreseeable future. Contribution is gated for reasons explained further down.
            </p>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.code}>
                  <strong className="font-display">
                    {c.full} ({c.code}).
                  </strong>{" "}
                  {c.blurb}
                </li>
              ))}
            </ul>

            <h2>Editorial process</h2>
            <p>
              Authors keep editorial control of their own papers. Editors
              copy-edit for clarity and fix typos. If we want to change
              the substance, we ask.
            </p>
            <p>
              Discussion threads are preserved verbatim. If a comment
              gets removed for moderation reasons, a placeholder stays in
              the thread with a one-line explanation of why. We do not
              quietly disappear things.
            </p>
            <p>
              Every author writes under their real name or a stable
              pseudonym they have used elsewhere. Anonymous throwaway
              accounts do not add much to a discussion thread and we do
              not have the moderation bandwidth to argue about it.
            </p>

            <h2>Community, alongside</h2>
            <p>
              This is the section where AI labs writing manifestos usually
              go wrong. So we wanted to write it carefully. The community
              is not the point of GIKSN. It is also not window dressing.
            </p>
            <p>
              What the community actually is: readers. People commenting
              under papers. A small number of vetted contributors who
              write papers of their own here because it is a good place
              for the work to sit. A public Telegram channel where anyone
              can join. A private one for accepted contributors where
              working groups coordinate.
            </p>
            <p>
              What the community is not: it is not the product. The lab
              does its own research first and the community forms around
              that research. If the research stopped, so would the
              community. We think that is the honest way around. We say
              it out loud because pretending otherwise is a common failure
              mode.
            </p>
            <p>
              Anyone can read every paper on the site without an account.
              Anyone can post a comment. Anyone can apply to contribute.
              The application asks for evidence that the applicant
              understands the kind of work being done, because sustained
              contribution requires it. That is the whole wall.
            </p>

            <h2>Getting in touch</h2>
            <p>
              For questions about a specific paper, use its discussion
              thread. That way anyone else with the same question can
              read the answer later.
            </p>
            <p>
              For questions about the lab in general:{" "}
              <a href="mailto:research@giksn.com" className="link-underline">
                research@giksn.com
              </a>
              .
            </p>
            <p>
              For anything urgent (takedown notices, security issues,
              legal correspondence) the same address works. Put
              &ldquo;urgent&rdquo; in the subject line and it gets
              triaged first.
            </p>
            <p>We read everything. Response times vary.</p>

            <blockquote>
              The record matters more than the verdict. Rejected
              directions stay because we want to remember what we
              considered.
            </blockquote>
          </div>

          <aside className="col-span-12 md:col-span-4 pt-2 md:pt-8 md:border-l md:border-rule md:pl-8">
            <div className="kicker mb-3">How the lab operates</div>
            <ol className="space-y-5">
              {[
                {
                  n: "01",
                  t: "Implement it ourselves first.",
                  b: "The lab builds each layer from first principles and tests it against a reference implementation.",
                },
                {
                  n: "02",
                  t: "Ship every layer as an open crate with a paper.",
                  b: "Each crate lands with the benchmarks and the paper explaining how it works and where it falls short.",
                },
                {
                  n: "03",
                  t: "Build community alongside.",
                  b: "Readers and vetted contributors form around the research. Not the point of the site. Not an afterthought either.",
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
            <div className="mt-8 kicker mb-3">The bet</div>
            <ul className="space-y-3 text-[14px] text-ink-soft leading-[1.55]">
              <li>
                Engineers who build every layer of the stack
              </li>
              <li>
                understand it better than those who only call it.
              </li>
              <li>
                Publishing each layer, with its benchmarks and its mistakes,
              </li>
              <li>
                is how a small lab earns a place in the record.
              </li>
            </ul>
            <div className="mt-10 divider-dashed" />
            <div className="mt-8">
              <Link
                href="/submit"
                className="inline-block bg-accent !text-white px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors"
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
