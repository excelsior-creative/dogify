import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DOG_BREEDS = [
  { breed: "Golden Retriever", traits: ["friendly", "playful", "loyal", "energetic", "outgoing"], description: "The life of the party who's always ready for fun!" },
  { breed: "German Shepherd", traits: ["protective", "loyal", "serious", "intelligent", "brave"], description: "A natural leader who always has your back." },
  { breed: "French Bulldog", traits: ["stubborn", "chill", "funny", "lazy", "cuddly"], description: "Cool and laid-back, but secretly runs the show." },
  { breed: "Labrador", traits: ["goofy", "clumsy", "lovable", "hungry", "friendly"], description: "Pure chaos and pure love in equal measure." },
  { breed: "Poodle", traits: ["smart", "elegant", "aloof", "sophisticated", "observant"], description: "The brains AND the beauty of the group." },
  { breed: "Husky", traits: ["dramatic", "wild", "talkative", "free-spirited", "stubborn"], description: "A beautiful disaster who does what they want." },
  { breed: "Beagle", traits: ["curious", "adventurous", "nosy", "food-obsessed", "friendly"], description: "Always following their nose into trouble." },
  { breed: "Corgi", traits: ["royal", "sassy", "confident", "cute", "bossy"], description: "Small but absolutely in charge." },
  { breed: "Shiba Inu", traits: ["quirky", "independent", "weird", "photogenic", "aloof"], description: "A unique soul who marches to their own beat." },
  { breed: "Pit Bull", traits: ["tough", "loyal", "misunderstood", "sweet", "strong"], description: "Looks intimidating but is actually a total softie." },
  { breed: "Chihuahua", traits: ["tiny", "fierce", "nervous", "loud", "loyal"], description: "Small dog, BIG personality." },
  { breed: "Great Dane", traits: ["gentle", "calm", "huge", "lazy", "sweet"], description: "A gentle giant who thinks they're a lap dog." },
  { breed: "Dachshund", traits: ["stubborn", "brave", "curious", "loud", "determined"], description: "Small but thinks they're 10 feet tall." },
  { breed: "Border Collie", traits: ["smart", "intense", "workaholic", "focused", "athletic"], description: "The overachiever who makes everyone else look lazy." },
  { breed: "Bulldog", traits: ["lazy", "stubborn", "loyal", "snoring", "lovable"], description: "Maximum chill energy with a stubborn streak." },
];

// Timeout wrapper for async operations
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

async function matchDogBreed(description: string): Promise<typeof DOG_BREEDS[0]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Based on this personality description, which dog breed from the following list is the BEST match? Only respond with the exact breed name, nothing else.

Breeds: ${DOG_BREEDS.map((d) => d.breed).join(", ")}

Description: "${description}"

Best matching breed:`;

  const result = await withTimeout(
    model.generateContent(prompt),
    10000,
    "Dog breed matching timed out"
  );
  const breedName = result.response.text().trim();

  // Find the matching breed
  const match = DOG_BREEDS.find(
    (d) => d.breed.toLowerCase() === breedName.toLowerCase()
  );
  
  return match || DOG_BREEDS[Math.floor(Math.random() * DOG_BREEDS.length)];
}

async function generateDogImage(
  photoBase64: string,
  dogBreed: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
      responseModalities: ["image", "text"],
    } as any,
  });

  // Remove base64 prefix if present
  const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
  
  const prompt = `Transform this person into a ${dogBreed} dog hybrid. Keep their recognizable features (hair color, facial structure, expression) but merge them with ${dogBreed} characteristics - give them the dog's ears, nose, fur coloring, and expression. Make it look like a fun, shareable portrait - realistic enough to be recognizable but clearly showing them as a ${dogBreed}. The result should be humorous and endearing, perfect for sharing with friends. High quality, good lighting, centered portrait.`;

  try {
    console.log(`[Dogify] Starting image generation for ${dogBreed}...`);
    
    const result = await withTimeout(
      model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        },
      ]),
      55000, // 55 seconds (Vercel Pro has 60s limit)
      "Image generation timed out - the AI is taking too long. Please try again."
    );

    console.log(`[Dogify] Image generation complete, processing response...`);

    const response = result.response;
    const candidates = response.candidates;
    
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if ((part as any).inlineData) {
          const imageData = (part as any).inlineData;
          console.log(`[Dogify] Successfully generated image`);
          return `data:${imageData.mimeType};base64,${imageData.data}`;
        }
      }
    }
    
    // Check if we got a text response instead (might indicate content filtering)
    const textPart = candidates?.[0]?.content?.parts?.find((p: any) => p.text);
    if (textPart) {
      console.log(`[Dogify] Got text response instead of image:`, (textPart as any).text);
    }
    
    throw new Error("No image in response - the AI couldn't generate an image. Try a different photo.");
  } catch (error: any) {
    console.error("[Dogify] Image generation error:", error.message);
    
    // Provide more helpful error messages
    if (error.message.includes("timed out")) {
      throw error;
    }
    if (error.message.includes("SAFETY") || error.message.includes("blocked")) {
      throw new Error("The image couldn't be processed. Try a different photo.");
    }
    if (error.message.includes("quota") || error.message.includes("rate")) {
      throw new Error("We're getting a lot of requests! Please try again in a minute.");
    }
    
    throw new Error(error.message || "Failed to generate dog image. Please try again.");
  }
}

// Simple rate limiting using in-memory storage (replace with Redis/DB in production)
const usageMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  const usage = usageMap.get(ip);
  
  if (!usage || now > usage.resetTime) {
    usageMap.set(ip, { count: 1, resetTime: now + dayMs });
    return true;
  }
  
  if (usage.count >= 2) {
    return false;
  }
  
  usage.count++;
  return true;
}

// Increase function timeout for Vercel
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    console.log(`[Dogify] New request from ${ip.split(",")[0]}`);
    
    const { photo, description } = await request.json();

    if (!photo || !description) {
      return NextResponse.json(
        { error: "Photo and description are required" },
        { status: 400 }
      );
    }

    // Check rate limit (free tier: 2 per day)
    const withinLimit = checkRateLimit(ip);
    const isWatermarked = true; // Always watermarked for free tier

    if (!withinLimit) {
      return NextResponse.json(
        { 
          error: "Daily limit reached! Go Premium for unlimited dogifications.",
          limitReached: true 
        },
        { status: 429 }
      );
    }

    // Match dog breed based on personality
    console.log(`[Dogify] Matching dog breed for description: "${description.slice(0, 50)}..."`);
    const dogMatch = await matchDogBreed(description);
    console.log(`[Dogify] Matched breed: ${dogMatch.breed}`);

    // Generate the dog-human hybrid image
    const generatedImage = await generateDogImage(photo, dogMatch.breed);

    const duration = Date.now() - startTime;
    console.log(`[Dogify] Complete in ${duration}ms`);

    return NextResponse.json({
      dogBreed: dogMatch.breed,
      dogDescription: dogMatch.description,
      traits: dogMatch.traits,
      generatedImage,
      isWatermarked,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Dogify] Error after ${duration}ms:`, error.message);
    
    return NextResponse.json(
      { error: error.message || "Failed to dogify. Please try again." },
      { status: 500 }
    );
  }
}
