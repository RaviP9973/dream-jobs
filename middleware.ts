import { createMiddleware } from "@arcjet/next";
import arcjet, { detectBot, shield } from "./app/utils/arcjet";

export const config = {
  // The matcher controls which routes the middleware runs on.
  // We exclude Next.js internals, static files, and api/auth, api/inngest, api/webhook routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/inngest|api/webhook).*)"],
};

// Create the Arcjet middleware
const aj = arcjet
  .withRule(
    shield({
      mode: "LIVE", // Protects against common attacks (SQLi, XSS, etc.)
    })
  )
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Allow search engines
      ], 
    })
  );

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Only run Arcjet on mutations (Server Actions, API submissions)
  if (req.method === "GET") {
    return NextResponse.next();
  }

  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    console.log("Arcjet blocked request:", req.nextUrl.pathname, "Reason:", decision.reason);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}
