import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dogify - Turn Your Friends Into Dogs 🐕",
  description: "Upload a photo of your friend, describe their personality, and discover what dog they truly are! AI-powered fun for everyone.",
  keywords: ["dog", "personality quiz", "AI", "fun", "friends", "viral", "what dog am I", "dog breed"],
  metadataBase: new URL("https://dogify-zeta.vercel.app"),
  openGraph: {
    title: "Dogify - Turn Your Friends Into Dogs 🐕",
    description: "Upload a photo of your friend, describe their personality, and discover what dog they truly are!",
    type: "website",
    url: "https://dogify-zeta.vercel.app",
    siteName: "Dogify",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dogify - Turn Your Friends Into Dogs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dogify - Turn Your Friends Into Dogs 🐕",
    description: "Upload a photo of your friend, describe their personality, and discover what dog they truly are!",
    images: ["/og-image.png"],
    creator: "@dogifyapp",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Facebook App ID - for better sharing analytics */}
        <meta property="fb:app_id" content="" />
      </head>
      <body className={geist.className}>{children}</body>
    </html>
  );
}
