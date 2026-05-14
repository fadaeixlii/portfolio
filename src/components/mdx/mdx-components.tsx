import type { ComponentPropsWithoutRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";
import { ImageGrid } from "./ImageGrid";
import { MetricCard } from "./MetricCard";

export const mdxComponents = {
  // Headings
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-16 mb-4 font-serif text-2xl font-normal tracking-tight text-foreground"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="mt-10 mb-3 text-xl font-medium tracking-tight text-foreground"
      {...props}
    />
  ),

  // Text
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className="mb-6 text-base leading-relaxed text-muted-foreground"
      {...props}
    />
  ),

  // Links
  a: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => {
    if (href?.startsWith("/")) {
      return (
        <Link
          href={href}
          className="text-accent underline underline-offset-4 transition-colors hover:text-foreground"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-4 transition-colors hover:text-foreground"
        {...props}
      />
    );
  },

  // Lists
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mb-6 ml-6 list-disc space-y-2 text-muted-foreground"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mb-6 ml-6 list-decimal space-y-2 text-muted-foreground"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),

  // Blockquote
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-8 border-l-4 border-l-accent pl-6 italic text-muted-foreground [&>p]:mb-0"
      {...props}
    />
  ),

  // Code
  pre: (props: ComponentPropsWithoutRef<"pre">) => <CodeBlock {...props} />,
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
      {...props}
    />
  ),

  // Images — override to use next/image
  img: ({
    src,
    alt,
  }: ComponentPropsWithoutRef<"img">) => {
    if (!src || typeof src !== "string") return null;
    return (
      <figure className="my-8">
        <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
          <Image
            src={src}
            alt={alt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        </div>
      </figure>
    );
  },

  // Horizontal rule
  hr: () => <hr className="my-12 border-t border-border" />,

  // Strong and emphasis
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="italic" {...props} />
  ),

  // Custom components
  Callout,
  CodeBlock,
  ImageGrid,
  MetricCard,
};
