import { Hono } from "hono";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type Env = {
  Variables: {
    userId: string;
  };
};

const feedback = new Hono<Env>();

feedback.use("/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Non autorisé" }, 401);

  const payload = await verifyToken(token);
  if (!payload) return c.json({ error: "Token invalide" }, 401);

  c.set("userId", payload.userId);
  await next();
});

// GET /api/feedback/:conversationId — get feedback for a conversation
feedback.get("/:conversationId", async (c) => {
  const userId = c.get("userId");
  const conversationId = c.req.param("conversationId");

  const result = await prisma.feedback.findFirst({
    where: { conversationId, userId },
  });

  if (!result) {
    return c.json({ error: "Feedback introuvable" }, 404);
  }

  return c.json(result);
});

export { feedback };
