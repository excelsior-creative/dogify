import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { priceType } = await request.json();
    
    const origin = request.headers.get("origin") || "https://dogify-zeta.vercel.app";

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    let mode: Stripe.Checkout.SessionCreateParams.Mode;

    if (priceType === "subscription") {
      // Monthly subscription - $2.99/mo
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Dogify Premium",
              description: "Unlimited dogifications, no watermarks, HD downloads",
              images: [`${origin}/og-image.png`],
            },
            unit_amount: 299, // $2.99 in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ];
      mode = "subscription";
    } else {
      // One-time purchase - $0.99 per dog
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Dogify - Single Premium Dog",
              description: "One premium dogification - no watermark, HD download",
              images: [`${origin}/og-image.png`],
            },
            unit_amount: 99, // $0.99 in cents
          },
          quantity: 1,
        },
      ];
      mode = "payment";
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode,
      success_url: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
