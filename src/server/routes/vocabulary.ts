import { Hono } from "hono";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type Env = {
  Variables: {
    userId: string;
  };
};

const vocabulary = new Hono<Env>();

vocabulary.use("/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Non autorisé" }, 401);

  const payload = await verifyToken(token);
  if (!payload) return c.json({ error: "Token invalide" }, 401);

  c.set("userId", payload.userId);
  await next();
});

// GET /api/vocabulary — list with search, filter, pagination
vocabulary.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const search = c.req.query("search") || "";
    const scenarioId = c.req.query("scenarioId");
    const mode = c.req.query("mode"); // "review" for SRS
    const page = parseInt(c.req.query("page") || "1", 10);
    const limit = parseInt(c.req.query("limit") || "50", 10);

    const where: Record<string, unknown> = { userId };

    if (search) {
      where.OR = [
        { word: { contains: search, mode: "insensitive" } },
        { translation: { contains: search, mode: "insensitive" } },
      ];
    }

    if (scenarioId) {
      where.scenarioId = parseInt(scenarioId, 10);
    }

    // SRS mode: get words due for review
    if (mode === "review") {
      const now = new Date();
      const words = await prisma.vocabulary.findMany({
        where: {
          userId,
          OR: [
            { lastReviewedAt: null },
            {
              // Simple SRS: review interval doubles with each review
              // reviewCount 0 → immediate, 1 → 1 day, 2 → 2 days, 3 → 4 days, etc.
              lastReviewedAt: {
                lt: new Date(
                  now.getTime() - 24 * 60 * 60 * 1000, // at least 1 day ago as base
                ),
              },
            },
          ],
        },
        orderBy: [
          { reviewCount: "asc" },
          { lastReviewedAt: "asc" },
        ],
        take: 20,
      });

      return c.json({ words, total: words.length });
    }

    const [words, total] = await Promise.all([
      prisma.vocabulary.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vocabulary.count({ where }),
    ]);

    return c.json({ words, total, page, limit });
  } catch (error) {
    console.error("Error listing vocabulary:", error);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
  }
});

// POST /api/vocabulary — manually add word
vocabulary.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    const { word, translation, context, scenarioId } = await c.req.json<{
      word: string;
      translation: string;
      context?: string;
      scenarioId?: number;
    }>();

    if (!word || !translation) {
      return c.json({ error: "Mot et traduction requis" }, 400);
    }

    const existing = await prisma.vocabulary.findFirst({
      where: { userId, word },
    });

    if (existing) {
      return c.json({ error: "Ce mot existe déjà dans votre carnet" }, 409);
    }

    const vocab = await prisma.vocabulary.create({
      data: { userId, word, translation, context, scenarioId },
    });

    return c.json(vocab, 201);
  } catch (error) {
    console.error("Error adding vocabulary:", error);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
  }
});

// PATCH /api/vocabulary/:id/review — update review count and date
vocabulary.patch("/:id/review", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const { known } = await c.req.json<{ known: boolean }>();

    const vocab = await prisma.vocabulary.findFirst({
      where: { id, userId },
    });

    if (!vocab) {
      return c.json({ error: "Mot introuvable" }, 404);
    }

    const updated = await prisma.vocabulary.update({
      where: { id },
      data: {
        reviewCount: known ? vocab.reviewCount + 1 : Math.max(0, vocab.reviewCount - 1),
        lastReviewedAt: new Date(),
      },
    });

    return c.json(updated);
  } catch (error) {
    console.error("Error reviewing vocabulary:", error);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
  }
});

// DELETE /api/vocabulary/:id — delete word
vocabulary.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    const vocab = await prisma.vocabulary.findFirst({
      where: { id, userId },
    });

    if (!vocab) {
      return c.json({ error: "Mot introuvable" }, 404);
    }

    await prisma.vocabulary.delete({ where: { id } });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting vocabulary:", error);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
  }
});

export { vocabulary };
