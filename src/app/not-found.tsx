import Link from "next/link";

// Only reached for a path outside any locale prefix (e.g. a dotted
// filename the proxy matcher skips). No layout above this file renders
// <html>/<body>, so it must do so itself. English only — unreachable in
// normal use, so it isn't worth localising or theming.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <h1>Page not found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/en">Go home</Link>
      </body>
    </html>
  );
}
