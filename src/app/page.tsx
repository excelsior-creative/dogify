"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Voice input not supported in this browser. Please type instead.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice input failed. Please try again or type.");
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev + " " + transcript);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !description.trim()) {
      setError("Please upload a photo and describe your friend!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert photo to base64
      const reader = new FileReader();
      reader.readAsDataURL(photo);
      reader.onloadend = async () => {
        const base64Photo = reader.result as string;
        
        const response = await fetch("/api/dogify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photo: base64Photo,
            description: description.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        // Store result and navigate
        localStorage.setItem("dogifyResult", JSON.stringify(data));
        router.push("/result");
      };
    } catch (err: any) {
      console.error("Dogify error:", err);
      setError(err.message || "Failed to generate. Please try again.");
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    // Don't clear the form, just let them try again
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-100 to-orange-200">
      {/* Header */}
      <div className="text-center pt-12 pb-8">
        <h1 className="text-5xl md:text-7xl font-black text-amber-900 mb-2">
          🐕 Dogify
        </h1>
        <p className="text-xl text-amber-800">
          Turn your friends into the dogs they truly are
        </p>
      </div>

      {/* Main Form */}
      <div className="max-w-lg mx-auto px-4 pb-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-lg font-bold text-gray-800">
              📸 Upload your friend&apos;s photo
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-4 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                photoPreview
                  ? "border-green-400 bg-green-50"
                  : "border-amber-300 hover:border-amber-400 hover:bg-amber-50"
              }`}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-xl"
                />
              ) : (
                <div className="text-gray-500">
                  <span className="text-4xl">📷</span>
                  <p className="mt-2">Click to upload a photo</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-lg font-bold text-gray-800">
              🎤 Describe your friend
            </label>
            <p className="text-sm text-gray-500">
              What are they like? Personality, habits, vibes...
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="My friend is super loyal, always down to go on adventures, kind of goofy, and loves naps..."
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-0 resize-none text-gray-800"
            />
            <button
              type="button"
              onClick={startVoiceInput}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isListening ? "🎙️ Listening..." : "🎤 Or speak it"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-xl space-y-2">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="text-sm underline font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !photo || !description.trim()}
            className={`w-full py-4 rounded-xl font-black text-xl transition-all ${
              isLoading || !photo || !description.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">🐕</span>
                Fetching their inner dog...
              </span>
            ) : (
              "🐶 Dogify Them!"
            )}
          </button>
        </form>

        {/* Free tier notice */}
        <p className="text-center text-amber-800 mt-6 text-sm">
          ✨ Free: 2 dogifications per day • <a href="/premium" className="underline font-bold">Go Premium</a> for unlimited
        </p>
      </div>
    </main>
  );
}
