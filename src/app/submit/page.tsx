import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { SubmitForm } from "./SubmitForm";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const initialType = kind === "update" ? "update" : "paper";
  const isUpdateMode = initialType === "update";
  return (
    <>
      <Masthead />
      <CategoryNav active={isUpdateMode ? "UPDATES" : undefined} />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <header className="grid grid-cols-12 gap-6 md:gap-10 pb-8 sm:pb-10 border-b border-rule">
          <div className="col-span-12 md:col-span-9">
            <div className="kicker mb-3">
              {isUpdateMode ? "Submit an update" : "Submit a paper"}
            </div>
            <h1
              className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[20ch]"
              style={{ fontSize: "clamp(2rem, 6vw, 4.6rem)" }}
            >
              {isUpdateMode ? (
                <>
                  Add it to the <span className="text-accent">wire</span>. Keep
                  it factual.
                </>
              ) : (
                <>
                  Write the <span className="text-accent">first draft</span>.
                  Argue about it in public.
                </>
              )}
            </h1>
            <p className="mt-5 sm:mt-7 max-w-[60ch] text-[16px] sm:text-[19px] leading-[1.55] text-ink-soft font-display italic">
              {isUpdateMode
                ? "Cohort openings, releases, program dates, collaborations. Source it from the org doing the announcing."
                : "The first version doesn't need to be right. It needs to be specific enough to argue with."}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 md:gap-10 pt-8 sm:pt-12">
          <section className="col-span-12 md:col-span-8">
            <SubmitForm initialType={initialType} />
          </section>

          <aside className="col-span-12 md:col-span-4 pt-2 md:pt-0 md:border-l md:border-rule md:pl-8">
            <div className="kicker mb-3">Before you submit</div>
            <ol className="space-y-4">
              {[
                "Read at least three published papers in your sector.",
                "Write the title last. Most first-draft titles are slogans.",
                "Name the failure mode if your argument is wrong.",
                "Don't pre-answer objections. Let the community raise them.",
                "All submissions land as Exploration and are moved by an editor.",
              ].map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-[11px] text-accent tracking-[0.16em] mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14px] text-ink leading-[1.6]">
                    {tip}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-10 divider-dashed" />
            <div className="kicker mt-8 mb-3">What happens next</div>
            <p className="text-[14px] text-ink-soft leading-[1.65]">
              An editor reads it for clarity, not for content. Status moves
              from Exploration → Draft → Preprint → Published as the research
              matures. Landmark is reserved for work that later research keeps
              coming back to.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
