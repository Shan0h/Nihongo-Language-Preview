import type { Metadata } from "next";
import { Outfit, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import DarkModeToggle from "@/app/components/DarkModeToggle";
import BgmPlayer from "@/app/components/BgmPlayer";
import AfkScreensaver from "@/app/components/AfkScreensaver";

// Lazy load fonts for faster initial load
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Nihongo Education | 日本語教育 (UHB10802)",
  description: "Learn Japanese Beautifully 🌸 Interactive Quizzes, Vocabulary Drills & Live Classroom Multiplayer Arena",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${outfit.variable} ${notoSansJP.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased transition-colors duration-300" suppressHydrationWarning>
        <DarkModeToggle />
        <BgmPlayer />
        <AfkScreensaver />
        {children}
      </body>
    </html>
  );
}