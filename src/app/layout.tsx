import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dogify - Turn Your Friends Into Dogs 🐕",
  description: "Upload a photo of your friend, describe their personality, and discover what dog they truly are! AI-powered fun for everyone.",
  keywords: ["dog", "personality quiz", "AI", "fun", "friends", "viral"],
  openGraph: {
    title: "Dogify - Turn Your Friends Into Dogs 🐕",
    description: "Upload a photo of your friend, describe their personality, and discover what dog they truly are!",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dogify - Turn Your Friends Into Dogs 🐕",
    description: "Upload a photo of your friend, describe their personality, and discover what dog they truly are!",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
