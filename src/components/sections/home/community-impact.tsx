"use client";

import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Reveal, RevealBlur, RevealScale } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";

function AnimatedCounter({
  target,
  suffix = "",
  isNumeric,
  textValue,
}: {
  target: number;
  suffix?: string;
  isNumeric: boolean;
  textValue?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    if (!isInView || !isNumeric) return;
    const controls = animate(motionVal, target, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [isInView, isNumeric, motionVal, target]);

  useEffect(() => {
    if (!isNumeric) return;
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${v}${suffix}`;
    });
    return unsubscribe;
  }, [rounded, suffix, isNumeric]);

  if (!isNumeric) {
    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0, filter: "blur(6px)" }}
        animate={isInView ? { opacity: 1, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {textValue}
      </motion.span>
    );
  }

  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  {
    label: "Research domains",
    value: "4",
    target: 4,
    suffix: "",
    isNumeric: true,
  },
  {
    label: "Open channels",
    value: "5+",
    target: 5,
    suffix: "+",
    isNumeric: true,
  },
  {
    label: "Bootstrap stage",
    value: "Active",
    target: 0,
    suffix: "",
    isNumeric: false,
  },
  {
    label: "Contribution",
    value: "Vetted",
    target: 0,
    suffix: "",
    isNumeric: false,
  },
] as const;

export function CommunityImpact() {
  return (
    <Section id="community-impact" fullBleed>
      <div className="w-full site-gutter-x">
        <RevealScale>
          <div className="glass overflow-hidden rounded-2xl">
            <div className="relative grid gap-10 p-8 lg:grid-cols-2 lg:gap-16 lg:p-12">
              <RevealBlur>
                <SectionHeading
                  eyebrow="Community"
                  title="Built by researchers and builders, for the frontier"
                  description="GIKSN grows through a vetted community — not open signup. We look for people who can understand the research and continue it. The public Telegram channel is open to everyone; private channels unlock after acceptance."
                  gradient
                />
              </RevealBlur>

              <div className="flex flex-col justify-center gap-8">
                <dl className="grid grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="card-elevated relative overflow-hidden rounded-xl p-5"
                    >
                      <div className="absolute left-0 right-0 top-0 h-px bg-border" />
                      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </dt>
                      <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                        <AnimatedCounter
                          target={stat.target}
                          suffix={stat.suffix}
                          isNumeric={stat.isNumeric}
                          textValue={stat.value}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>

                <Reveal>
                  <Button
                    render={<Link href="/contribute/apply" />}
                    size="lg"
                    className="w-fit"
                  >
                    Apply to contribute
                  </Button>
                </Reveal>
              </div>
            </div>
          </div>
        </RevealScale>
      </div>
    </Section>
  );
}