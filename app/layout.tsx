import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anime Character Quiz",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
