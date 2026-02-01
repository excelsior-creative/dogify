"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-400 to-emerald-600 py-12">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-white">
            🐕 Dogify
          </Link>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <div className="text-8xl">🎉</div>
            <h1 className="text-3xl font-black text-gray-800">
              Welcome to Premium!
            </h1>
            <p className="text-gray-600">
              You now have unlimited access to Dogify with no watermarks and HD downloads!
            </p>

            {sessionId && (
              <p className="text-xs text-gray-400">
                Order: {sessionId.slice(0, 20)}...
              </p>
            )}

            <Link
              href="/"
              className="inline-block w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
            >
              🐶 Start Dogifying!
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-emerald-600 flex items-center justify-center">
        <div className="animate-spin text-6xl">🐕</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
