import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
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
    default: "Mohammad Fadaei — Full-Stack Developer",
    template: "%s | fadaeixlii.com",
  },
  description:
    "Senior full-stack developer building web applications with React, Next.js, and TypeScript. Based in the Netherlands.",
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
