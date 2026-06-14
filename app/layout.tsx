import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3M 製品セレクションガイド | テープ・接着剤・ファスナー",
  description: "3M工業用テープ・接着剤・ファスナーの最適製品を選定するAIガイド。営業担当者・技術者向け。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
