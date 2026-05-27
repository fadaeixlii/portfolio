import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
