import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { site } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const deltha = localFont({
  src: "../../public/fonts/Deltha.ttf",
  variable: "--font-deltha",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.role}`,
    template: "%s | fadaeixlii.com",
  },
  description:
    "Full-stack developer building web applications with React, Next.js, TypeScript, and Solidity. Based in Greece.",
  metadataBase: new URL("https://fadaeixlii.com"),
  alternates: {
    types: {
      "application/rss+xml": "https://fadaeixlii.com/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${deltha.variable}`}
    >
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
