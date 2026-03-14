import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "@/server/routes/auth";
import { conversations } from "@/server/routes/conversation";
import { tts } from "@/server/routes/tts";
import { feedback } from "@/server/routes/feedback";
import { vocabulary } from "@/server/routes/vocabulary";
import { progress } from "@/server/routes/progress";
import { authRateLimiter, apiRateLimiter } from "@/server/middleware/rateLimit";

const app = new Hono().basePath("/api");

// Global error handler
app.onError((err, c) => {
  console.error("Unhandled API error:", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

// Rate limiting
app.use("/auth/*", authRateLimiter);
app.use("/*", apiRateLimiter);

// Public routes
app.route("/auth", auth);

// Protected routes
app.route("/conversations", conversations);
app.route("/feedback", feedback);
app.route("/vocabulary", vocabulary);
app.route("/progress", progress);
app.route("/tts", tts);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
