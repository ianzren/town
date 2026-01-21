import type { Metadata } from "next";
import { Sofia_Sans_Semi_Condensed } from "next/font/google";
import "./globals.css";

const sofiaSans = Sofia_Sans_Semi_Condensed({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-sofia-sans",
});

export const metadata: Metadata = {
  title: "Gigs in Town - London",
  description: "Local music events around London",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sofiaSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
