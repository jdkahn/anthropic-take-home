import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Wireframe type (docs/wireframes/README.md): Plex Sans for UI, Source Serif 4 for Claude's
// answer, Plex Mono for file names. Self-hosted by next/font at build time.
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });

// App name is still open (Phase 4 Q9); the package name stands in.
export const metadata: Metadata = {
  title: "Goal-driven Cloze",
  description: "Claude answers in full and leaves one key step for you to work out.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="bg-page font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
