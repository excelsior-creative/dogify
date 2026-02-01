"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DogifyResult {
  dogBreed: string;
  dogDescription: string;
  traits: string[];
  generatedImage: string;
  isWatermarked: boolean;
}

export default function ResultPage() {
  const [result, setResult] = useState<DogifyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("dogifyResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleShare = async (platform: string) => {
    const text = `I just turned my friend into a ${result?.dogBreed}! 🐕 Find out what dog YOU are:`;
    const url = shareUrl;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case "download":
        if (result?.generatedImage) {
          const link = document.createElement("a");
          link.href = result.generatedImage;
          link.download = `dogify-${result.dogBreed.toLowerCase().replace(/\s/g, "-")}.png`;
          link.click();
        }
        break;
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-100 to-orange-200 flex items-center justify-center">
        <div className="animate-spin text-6xl">🐕</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-100 to-orange-200 py-12">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-amber-900">
            🐕 Dogify
          </Link>
        </div>

        {/* Result Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Generated Image */}
          <div className="relative">
            <img
              src={result.generatedImage}
              alt={`${result.dogBreed} version`}
              className="w-full aspect-square object-cover"
            />
            {result.isWatermarked && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                dogify.app
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-3xl font-black text-amber-900">
                {result.dogBreed}
              </h2>
              <p className="text-gray-600 mt-2">{result.dogDescription}</p>
            </div>

            {/* Traits */}
            <div className="flex flex-wrap gap-2 justify-center">
              {result.traits.map((trait, i) => (
                <span
                  key={i}
                  className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>

            {/* Share Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => handleShare("twitter")}
                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
              >
                𝕏 Share on X
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                {copied ? "✅ Copied!" : "🔗 Copy Link"}
              </button>
              <button
                onClick={() => handleShare("download")}
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all"
              >
                📥 Download Image
              </button>
            </div>

            {/* Premium upsell for watermarked */}
            {result.isWatermarked && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl text-center">
                <p className="font-bold">Want it without the watermark?</p>
                <p className="text-sm opacity-90">Plus unlimited dogifications</p>
                <Link
                  href="/premium"
                  className="inline-block mt-2 bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100"
                >
                  Go Premium - $2.99/mo
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Make another */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block bg-white text-amber-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            🐕 Dogify Another Friend
          </Link>
        </div>
      </div>
    </main>
  );
}
