import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteNav } from "@/components/shell/SiteNav";
import { SiteFooter } from "@/components/shell/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WAYLF — Who Are You Looking For",
    template: "%s · WAYLF",
  },
  description:
    "Sixteen questions about your habits, instincts and colours. Matched against the 500 most-loved characters in anime, revealed as a premium card.",
  keywords: [
    "anime character quiz",
    "which anime character are you",
    "anime personality test",
    "character card",
    "anime deck",
  ],
  openGraph: {
    title: "WAYLF — Who Are You Looking For",
    description:
      "Answer sixteen questions. Get matched to one of the 500 most-loved characters in anime, revealed as a premium card.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="relative z-10 flex min-h-dvh flex-col">
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
