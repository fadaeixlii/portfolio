"use client"; // copy-to-clipboard interaction

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  filename?: string;
}

export function CodeBlock({ children, className, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const el = document.querySelector("[data-code-content]");
    if (el?.textContent) {
      navigator.clipboard.writeText(el.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <div className="group relative my-8 overflow-hidden rounded-lg border border-border bg-card">
      {filename && (
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground">
            {filename}
          </span>
        </div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-3 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 transition-opacity duration-200 hover:text-foreground group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <pre
          className={cn(
            "overflow-x-auto p-6 font-mono text-sm leading-relaxed text-foreground",
            className
          )}
          data-code-content
        >
          {children}
        </pre>
      </div>
    </div>
  );
}
