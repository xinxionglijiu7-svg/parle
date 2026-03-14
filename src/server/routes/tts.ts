import { Hono } from "hono";
import { verifyToken } from "@/lib/auth";
import { synthesizeSpeech } from "@/lib/tts";

const tts = new Hono();

tts.post("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Non autorisé" }, 401);

  const payload = await verifyToken(token);
  if (!payload) return c.json({ error: "Token invalide" }, 401);

  const { text } = await c.req.json<{ text: string }>();

  if (!text || text.length > 5000) {
    return c.json({ error: "Texte invalide ou trop long" }, 400);
  }

  const audioBuffer = await synthesizeSpeech(text);

  const uint8 = new Uint8Array(audioBuffer);
  return new Response(uint8, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": uint8.length.toString(),
    },
  });
});

export { tts };
