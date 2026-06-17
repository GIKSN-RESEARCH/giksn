"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import type { Variants } from "framer-motion";

import { fadeUp, blurIn, scaleIn, sectionViewport, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  variant,
}: {
  children: ReactNode;
  className?: string;
  variant?: Variants;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      variants={variant ?? fadeUp}
    >
      {children}
    </motion.div>
  );
}

export function RevealBlur({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      variants={blurIn}
    >
      {children}
    </motion.div>
  );
}

export function RevealScale({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      variants={scaleIn}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  children,
  className,
  variants: customVariants,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      variants={customVariants ?? staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  variant,
}: {
  children: ReactNode;
  className?: string;
  variant?: Variants;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={variant ?? fadeUp}>
      {children}
    </motion.div>
  );
}