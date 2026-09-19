import type { Metadata } from "next";
import "./forcing.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StyleguideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
