# Dogify MVP Plan

**Date:** 2026-01-31
**Type:** Feature - MVP
**Detail Level:** MORE

## Overview

Build a viral "What Dog Are You?" web app where users upload a friend's photo + describe their personality, and the app:
1. Analyzes the personality to determine a matching dog breed
2. Uses Nano Banana Pro (Gemini) to merge the dog breed with the person's face
3. Creates a shareable result

## Requirements

### Core Flow
1. User uploads a photo of their friend
2. User provides personality description (text or voice input)
3. AI determines the most fitting dog breed based on personality
4. Nano Banana Pro generates a dog-human hybrid image
5. User can view, download, and share the result

### Freemium Model
- **Free tier:** 2 generations per day, watermarked result
- **Premium ($2.99/month or $0.99 per generation):**
  - Unlimited generations
  - No watermark
  - HD download
  - Multiple style options (realistic, cartoon, anime)

### Tech Stack
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Neon PostgreSQL (user accounts, usage tracking)
- **Image Generation:** Nano Banana Pro (Gemini gemini-3-pro-image-preview)
- **Payments:** Stripe
- **Hosting:** Vercel
- **Voice Input:** Web Speech API

## Implementation Tasks

### Phase 1: Core MVP ✅
- [x] Set up project structure (Next.js 16, Tailwind)
- [x] Create landing page with upload form
- [x] Implement voice-to-text for personality input (Web Speech API)
- [x] Build personality → dog breed matching logic (Gemini)
- [x] Integrate Nano Banana Pro for image generation
- [x] Create results page with sharing options

### Phase 2: Freemium & Polish ✅
- [ ] Set up Neon database (using IP-based for MVP)
- [x] Implement usage tracking (IP-based for free tier)
- [x] Add watermark to free tier results
- [x] Integrate Stripe for payments (checkout + webhook)
- [ ] Add account system (optional - can use IP initially)

### Phase 3: Viral Features ✅
- [x] Social sharing (X, Facebook, WhatsApp, iMessage)
- [x] "Make Your Friend a Dog" referral flow (share buttons)
- [ ] Gallery of recent dogs (opt-in) - future

### Setup Required
- [ ] Add STRIPE_SECRET_KEY to Vercel
- [ ] Add STRIPE_WEBHOOK_SECRET to Vercel
- [ ] Create Stripe webhook endpoint (dogify-zeta.vercel.app/api/stripe/webhook)
- [ ] Create/assign X account (@dogifyapp?)
- [ ] Create OG image for social sharing
- [ ] Purchase custom domain (dogify.app?)

## Acceptance Criteria

1. User can upload a photo and describe their friend
2. App generates a dog-human hybrid image
3. Free users limited to 2/day with watermark
4. Premium option available for unlimited use
5. Results are shareable

## Dog Breed Personality Mapping

| Personality Traits | Dog Breed |
|-------------------|-----------|
| Loyal, protective, serious | German Shepherd |
| Playful, energetic, friendly | Golden Retriever |
| Stubborn, independent, chill | French Bulldog |
| Smart, elegant, aloof | Poodle |
| Goofy, clumsy, lovable | Labrador |
| Fierce, confident, intense | Doberman |
| Lazy, calm, sweet | Basset Hound |
| Hyper, tiny, feisty | Chihuahua |
| Gentle giant, calm | Great Dane |
| Adventurous, curious | Beagle |
| Royal, fancy, dignified | Corgi |
| Wild, free-spirited | Husky |
| Cuddly, affectionate | Cavalier King Charles |
| Tough, muscular, soft inside | Pit Bull |
| Quirky, unique, weird | Shiba Inu |

## Notes

- Focus on viral coefficient - the share button IS the product
- Mobile-first design (most shares happen on phones)
- Fast generation time is critical for retention
