import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  Inter,
  Bricolage_Grotesque,
  Anek_Devanagari,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Geist Mono is loaded specifically to render hex codes in monospace.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inter — body and UI.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Bricolage Grotesque — display / headings.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

// Anek Devanagari carries both Devanagari and Latin, so the "रंगwaala"
// wordmark renders in one coherent typeface instead of falling back.
const anek = Anek_Devanagari({
  subsets: ["latin", "devanagari"],
  variable: "--font-anek",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Rangwaala — color palettes",
    template: "%s · Rangwaala",
  },
  description: "A minimalistic color palette tool",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" }
  ],
  colorScheme: "light dark"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${inter.variable} ${bricolage.variable} ${anek.variable} antialiased`}
      >
        <Navbar />
        <main className="pt-[4.5rem]">{children}</main>
      </body>
    </html>
  );
}