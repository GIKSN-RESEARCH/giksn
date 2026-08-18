import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { ProgramBlock } from "@/components/ProgramBlock";
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
                    <ProgramBlock program={p} index={i} collapsed />
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
