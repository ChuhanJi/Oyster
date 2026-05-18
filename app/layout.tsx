import type { Metadata } from "next";
import { Caveat, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oyster — See Your World",
  description: "The world is your oyster. Every trip leaves a pearl.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${caveat.variable} ${barlowCondensed.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
