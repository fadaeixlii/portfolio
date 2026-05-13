"use client";

import { motion, useReducedMotion } from "motion/react";

interface HeroAnimationProps {
  headline: string;
  children?: React.ReactNode;
}

export function HeroAnimation({ headline, children }: HeroAnimationProps) {
  const shouldReduce = useReducedMotion();
  const words = headline.split(" ");

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <h1 className="font-serif text-display font-normal text-foreground">
        <motion.span
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: shouldReduce ? 0 : 0.05,
              },
            },
          }}
          className="inline"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: shouldReduce ? 0 : 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                },
              }}
              className="inline-block"
            >
              {word}
              {i < words.length - 1 && "\u00A0"}
            </motion.span>
          ))}
        </motion.span>
      </h1>

      <motion.div
        initial={{ opacity: shouldReduce ? 1 : 0, y: shouldReduce ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduce ? 0 : 0.5,
          delay: shouldReduce ? 0 : words.length * 0.05 + 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="flex flex-col items-center gap-8"
      >
        {children}
      </motion.div>
    </div>
  );
}
