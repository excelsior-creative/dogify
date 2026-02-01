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

async function matchDogBreed(description: string): Promise<typeof DOG_BREEDS[0]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Based on this personality description, which dog breed from the following list is the BEST match? Only respond with the exact breed name, nothing else.

Breeds: ${DOG_BREEDS.map((d) => d.breed).join(", ")}

Description: "${description}"

Best matching breed:`;

  const result = await model.generateContent(prompt);
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
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    const candidates = response.candidates;
    
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if ((part as any).inlineData) {
          const imageData = (part as any).inlineData;
          return `data:${imageData.mimeType};base64,${imageData.data}`;
        }
      }
    }
    
    throw new Error("No image generated");
  } catch (error: any) {
    console.error("Image generation error:", error);
    throw new Error("Failed to generate dog image");
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

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
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
    const dogMatch = await matchDogBreed(description);

    // Generate the dog-human hybrid image
    const generatedImage = await generateDogImage(photo, dogMatch.breed);

    return NextResponse.json({
      dogBreed: dogMatch.breed,
      dogDescription: dogMatch.description,
      traits: dogMatch.traits,
      generatedImage,
      isWatermarked,
    });
  } catch (error: any) {
    console.error("Dogify error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dogify. Please try again." },
      { status: 500 }
    );
  }
}
