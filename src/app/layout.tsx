import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import { Lexend_Deca } from "next/font/google";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Geist Mono is loaded specifically to render hex codes in monospace.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
});

// Baloo 2 carries both Devanagari and Latin, so the "रंगwaala" wordmark
// renders in one coherent typeface instead of falling back for the Hindi.
const baloo = Baloo_2({
  weight: ["600", "700", "800"],
  subsets: ["latin", "devanagari"],
  variable: "--font-baloo",
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
        className={`${geistMono.variable} ${poppins.variable} ${lexendDeca.variable} ${baloo.variable} antialiased`}
      >
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}