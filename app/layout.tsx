import type { Metadata } from "next";
import { Outfit, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin", "japanese"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Nihongo Talk Screen | UHB10802",
  description: "Speak, Play & Learn Basic Japanese! 🌸 Live Multiplayer Quiz Exhibition",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${outfit.variable} ${notoSansJP.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#fdfbf7] text-[#2d2d2d] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
