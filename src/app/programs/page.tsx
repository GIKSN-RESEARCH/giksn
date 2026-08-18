import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { categoryByCode, formatDate } from "@/lib/papers";
import { type Program } from "@/lib/programs";
import { listProgramsPublic } from "@/db/queries";

export const revalidate = 60;

export default async function ProgramsPage() {
  const programs = await listProgramsPublic();

  return (
    <>
      <Masthead />
      <CategoryNav active="PROGRAMS" />
      <main className="w-full mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <header className="pb-8 sm:pb-10 border-b border-rule">
          <div className="flex items-center gap-3 mb-3">
            <div className="kicker">The room</div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent border border-accent px-2 py-0.5">
              Programs
            </span>
          </div>
          <h1
            className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[22ch]"
            style={{ fontSize: "clamp(2rem, 5.4vw, 4rem)" }}
          >
            Cohorts, fellowships and{" "}
            <span className="text-accent">community</span>.
          </h1>
          <p className="mt-5 sm:mt-7 max-w-[60ch] text-[15px] sm:text-[18px] leading-[1.55] text-ink-soft font-display italic">
            Programs are how the lab works with people over time. Open calls,
            working groups and fellowships land here when they are live.
          </p>
        </header>

        <section className="pt-8 sm:pt-12">
          {programs.length === 0 ? (
            <p className="font-display italic text-ink-soft text-[16px] sm:text-[18px] max-w-[48ch]">
              No programs are open right now. When one is, it will appear here.
            </p>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-6 sm:mb-8">
                <div className="kicker">
                  {String(programs.length).padStart(2, "0")} on the floor
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                  Open calls first
                </div>
              </div>
              <ul className="space-y-10 sm:space-y-14">
                {programs.map((p, i) => (
                  <li key={p.slug}>
                    <ProgramBlock program={p} index={i} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function ProgramBlock({
  program,
  index,
}: {
  program: Program;
  index: number;
}) {
  const sectorLabels = (program.sectors?.length
    ? program.sectors
    : [program.category]
  ).map((code) => categoryByCode(code)?.full ?? code);
  const siteHref = program.website || null;
  const siteHost = siteHref
    ? siteHref.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;

  return (
    <article className="grid grid-cols-12 gap-6 md:gap-10 border border-rule bg-paper p-5 sm:p-8">
      <div className="col-span-12 md:col-span-4 min-w-0">
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Program {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint border border-rule px-2 py-0.5">
            {program.startsOn
              ? program.endsOn
                ? `${formatDate(program.startsOn)} to ${formatDate(program.endsOn)}`
                : formatDate(program.startsOn)
              : program.tentativeStart
                ? program.tentativeStart
                : "Upcoming"}
          </span>
        </div>
        <h2
          className="font-display font-semibold text-ink leading-[1.02] tracking-[-0.03em]"
          style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.8rem)" }}
        >
          {siteHref ? (
            <a
              href={siteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              {program.name}
            </a>
          ) : (
            program.name
          )}
        </h2>
        <p className="mt-3 font-display italic text-ink-soft text-[15px] sm:text-[17px] leading-[1.5] max-w-[36ch]">
          {program.tagline}
        </p>
        <dl className="mt-6 space-y-2.5 font-mono text-[11px] uppercase tracking-[0.14em]">
          <MetaRow
            term={sectorLabels.length > 1 ? "Sectors" : "Sector"}
            value={sectorLabels.join(", ")}
          />
          {siteHref && siteHost && (
            <div className="flex justify-between gap-3 border-b border-rule-soft pb-2">
              <dt className="text-ink-faint">Link</dt>
              <dd className="text-ink text-right normal-case tracking-normal font-body text-[13px]">
                <a
                  href={siteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-accent hover:text-accent-deep"
                >
                  {siteHost}
                </a>
              </dd>
            </div>
          )}
          {program.startsOn ? (
            <MetaRow
              term={program.endsOn ? "Dates" : "Date"}
              value={
                program.endsOn
                  ? `${formatDate(program.startsOn)} to ${formatDate(program.endsOn)}`
                  : formatDate(program.startsOn)
              }
            />
          ) : program.tentativeStart ? (
            <MetaRow term="Tentative start" value={program.tentativeStart} />
          ) : (
            <MetaRow term="Status" value="Upcoming" />
          )}
        </dl>
      </div>

      <div className="col-span-12 md:col-span-8 min-w-0 md:border-l md:border-rule md:pl-8">
        <p className="text-[15px] sm:text-[16px] leading-[1.65] text-ink-soft">
          {program.description}
        </p>

        {program.highlights.length > 0 && (
          <div className="mt-6">
            <div className="kicker mb-3">What it is</div>
            <ul className="space-y-2">
              {program.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-[14px] sm:text-[15px] leading-[1.6] text-ink"
                >
                  <span className="font-mono text-[11px] text-accent tracking-[0.16em] mt-1 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {siteHref && (
          <div className="mt-6">
            <a
              href={siteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft hover:text-accent hover:border-accent transition-colors"
            >
              {program.status === "Open" || program.status === "Rolling"
                ? "Apply"
                : "Learn more"}{" "}
              →
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

function MetaRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-rule-soft pb-2">
      <dt className="text-ink-faint">{term}</dt>
      <dd className="text-ink text-right normal-case tracking-normal font-body text-[13px]">
        {value}
      </dd>
    </div>
  );
}
