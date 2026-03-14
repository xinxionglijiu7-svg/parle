import { createMiddleware } from "hono/factory";
import { verifyToken, type TokenPayload } from "@/lib/auth";

type Env = {
  Variables: {
    user: TokenPayload;
  };
};

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return c.json({ error: "Non autorisé" }, 401);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return c.json({ error: "Token invalide ou expiré" }, 401);
  }

  c.set("user", payload);
  await next();
});
