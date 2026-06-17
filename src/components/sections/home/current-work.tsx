import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";

const initiatives = [
  {
    title: "Cross-domain AGI capability mapping",
    description:
      "Correlating reasoning benchmarks with hardware constraints and distributed deployment realities.",
    status: "Active",
  },
  {
    title: "Tooling explainer series",
    description:
      "High-signal writeups on existing frontier tools — what they do, when to use them, and where the gaps are.",
    status: "Ongoing",
  },
  {
    title: "Open research questions board",
    description:
      "Documenting what we do not know yet — and inviting vetted contributors to help close the gaps.",
    status: "Founding",
  },
] as const;

const statusDotClass: Record<string, string> = {
  Active: "status-dot status-dot-active",
  Ongoing: "status-dot status-dot-ongoing",
  Founding: "status-dot status-dot-founding",
};

export function CurrentWork() {
  return (
    <Section id="current-work" className="overflow-hidden">
      <Reveal>
        <SectionHeading
          eyebrow="Current Work"
          title="Building momentum from day one"
          description="Early-stage does not mean empty. We seed from existing threads, Substack explainers and founding notes — then compound through open research and community execution."
        />
      </Reveal>

      <div className="relative mt-12">
        <RevealStagger className="relative flex flex-col gap-8">
          <div
            className="pointer-events-none absolute bottom-0 left-[15px] top-0 w-px bg-border"
            aria-hidden
          />

          {initiatives.map((item) => (
            <RevealItem key={item.title}>
              <div className="flex items-start gap-0">
                <div className="relative flex shrink-0 items-center">
                  <div
                    className="relative z-10 flex size-[30px] items-center justify-center"
                    aria-hidden
                  >
                    <div className={statusDotClass[item.status]} />
                  </div>
                  <div className="h-px w-6 bg-border" aria-hidden />
                </div>

                <article className="glass-subtle flex-1 rounded-xl p-5 sm:p-6">
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {item.status}
                  </span>

                  <h3 className="mt-3 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </Section>
  );
}