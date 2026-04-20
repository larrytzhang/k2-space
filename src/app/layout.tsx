import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Metadata for social-sharing previews (OpenGraph + Twitter), browser title,
 * and search indexing. Kept in one place so link previews stay consistent
 * wherever the demo URL is pasted (email, Slack, LinkedIn, etc.).
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://k2-space.vercel.app"),
  title: "Procedure AI — structured aerospace procedures in seconds",
  description:
    "Upload a paper aerospace procedure (PDF, DOCX, or TXT) and get back a validated, machine-readable JSON structure — warnings, cautions, sign-offs, and pass/fail criteria all preserved.",
  applicationName: "Procedure AI",
  authors: [{ name: "Larry Zhang" }],
  keywords: [
    "aerospace",
    "procedure digitization",
    "K2 Space",
    "Claude API",
    "AI document structuring",
  ],
  openGraph: {
    type: "website",
    title: "Procedure AI — built for K2 Space",
    description:
      "Paper aerospace procedures → structured JSON in seconds. A working prototype by Larry Zhang.",
    siteName: "Procedure AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Procedure AI — built for K2 Space",
    description:
      "Paper aerospace procedures → structured JSON in seconds. A working prototype by Larry Zhang.",
  },
  robots: {
    // Demo is public but we don't want it colliding with a real product
    // in search results — allow indexing but keep it low-signal.
    index: true,
    follow: true,
  },
};

/**
 * Root layout component for the Procedure AI application.
 * Applies the Inter font and sets up the base HTML structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
