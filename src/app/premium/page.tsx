"use client";

import Link from "next/link";

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 to-pink-900 py-12">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-white">
            🐕 Dogify
          </Link>
        </div>

        {/* Premium Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white text-center">
            <span className="text-6xl">👑</span>
            <h1 className="text-3xl font-black mt-4">Go Premium</h1>
            <p className="opacity-90 mt-2">Unlimited dogifications await</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔓</span>
                <div>
                  <p className="font-bold text-gray-800">Unlimited Generations</p>
                  <p className="text-sm text-gray-500">Dogify everyone you know</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-bold text-gray-800">No Watermarks</p>
                  <p className="text-sm text-gray-500">Clean images ready to share</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📸</span>
                <div>
                  <p className="font-bold text-gray-800">HD Downloads</p>
                  <p className="text-sm text-gray-500">High-quality images</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="font-bold text-gray-800">Multiple Styles</p>
                  <p className="text-sm text-gray-500">Realistic, cartoon, anime & more</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3 pt-4">
              <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg">
                Subscribe - $2.99/month
              </button>
              <button className="w-full py-4 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-all">
                One-Time - $0.99 per dog
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm">
              Cancel anytime • Secure payments via Stripe
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="text-center mt-8">
          <Link href="/" className="text-white underline">
            ← Back to Dogify
          </Link>
        </div>
      </div>
    </main>
  );
}
