import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { readFile } from "fs/promises";
import path from "path";
import "./globals.css";
import { ThemeApplicator } from "./components/ThemeApplicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const filePath = path.join(process.cwd(), "data", "settings.json");
    const content = await readFile(filePath, "utf-8");
    const settings = JSON.parse(content);
    const schoolName: string = settings.schoolName || "School Athletics";
    const logo: string = settings.logo || "";
    return {
      title: `${schoolName} Athletics`,
      description: `${schoolName} Athletics Website`,
      icons: logo ? { icon: logo } : undefined,
    };
  } catch {
    return {
      title: "School Athletics",
      description: "School Athletics Website",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeApplicator />
        {children}
      </body>
    </html>
  );
}
