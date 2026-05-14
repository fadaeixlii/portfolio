"use client"; // state + motion animations

import { motion, useReducedMotion } from "motion/react";

interface HeroAnimationProps {
  children: React.ReactNode;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const containerVariantsReduced = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0,
    },
  },
};

export function HeroAnimation({ children }: HeroAnimationProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shouldReduce ? containerVariantsReduced : containerVariants}
    >
      {children}
    </motion.div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const itemVariantsReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0 },
  },
};

export function HeroItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduce ? itemVariantsReduced : itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
