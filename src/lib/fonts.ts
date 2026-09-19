import { Archivo, Vazirmatn, JetBrains_Mono } from "next/font/google";

/** Display face. The width axis is used deliberately — see the spec's type section. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Body face. Covers Latin + Arabic so the fa locale never falls back mid-paragraph. */
const vazirmatn = Vazirmatn({
  subsets: ["latin", "arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

/** Numerals and code only. Never labels, eyebrows or navigation. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const fontVariables = [
  archivo.variable,
  vazirmatn.variable,
  jetbrains.variable,
].join(" ");
