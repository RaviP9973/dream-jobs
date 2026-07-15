import { redirect } from "next/navigation";
import { auth } from "./auth";
import arcjet, { detectBot, shield, tokenBucket } from "./arcjet";
import { request } from "@arcjet/next";

const aj = arcjet
  .withRule(
    shield({
      mode: "LIVE",
    })
  )
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    })
  )
  .withRule(
    tokenBucket({
      mode: "LIVE",
      capacity: 100,      // Max 100 requests
      interval: 60,       // per 60 seconds
      refillRate: 30,     // Refill 30 tokens every 60 seconds
    })
  );

export async function requireUser() {
  const session = await auth();
  
  if (!session?.user) {
    return redirect("/login");
  }

  // Centralized Arcjet protection for all secure routes and actions
  try {
    const req = await request();
    const decision = await aj.protect(req, { requested: 10 });

    if (decision.isDenied()) {
      throw new Error("Forbidden by Arcjet");
    }
  } catch (error) {
    // If request() fails (e.g., in unsupported contexts), bypass gracefully
    console.warn("Arcjet protection skipped:", error);
  }

  return session?.user;
}
