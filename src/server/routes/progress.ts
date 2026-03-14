import { Hono } from "hono";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type Env = {
  Variables: {
    userId: string;
  };
};

const progress = new Hono<Env>();

progress.use("/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Non autorisé" }, 401);

  const payload = await verifyToken(token);
  if (!payload) return c.json({ error: "Token invalide" }, 401);

  c.set("userId", payload.userId);
  await next();
});

// GET /api/progress — aggregated stats
progress.get("/", async (c) => {
  const userId = c.get("userId");

  const [
    totalConversations,
    completedConversations,
    totalVocabulary,
    recentFeedbacks,
    recentProgress,
  ] = await Promise.all([
    prisma.conversation.count({ where: { userId } }),
    prisma.conversation.count({ where: { userId, status: "completed" } }),
    prisma.vocabulary.count({ where: { userId } }),
    prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        grammarErrors: true,
        createdAt: true,
      },
    }),
    prisma.learningProgress.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    }),
  ]);

  // Calculate streak
  const streak = calculateStreak(recentProgress);

  // Grammar error trend (compare last 5 vs previous 5)
  const errorCounts = recentFeedbacks.map((f) => f.grammarErrors.length);
  const trend = calculateTrend(errorCounts);

  // Recent activity: last 5 completed conversations with scenario info
  const recentActivity = await prisma.conversation.findMany({
    where: { userId, status: "completed" },
    orderBy: { completedAt: "desc" },
    take: 5,
    select: {
      id: true,
      scenarioId: true,
      completedAt: true,
      feedback: {
        select: {
          grammarErrors: true,
          vocabularySuggestions: true,
        },
      },
    },
  });

  return c.json({
    totalConversations,
    completedConversations,
    totalVocabulary,
    streak,
    grammarTrend: trend,
    recentActivity,
  });
});

function calculateStreak(
  progressEntries: { date: Date; conversationsCompleted: number }[],
): number {
  if (progressEntries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check each day backwards from today
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);

    const entry = progressEntries.find((p) => {
      const pDate = new Date(p.date);
      pDate.setHours(0, 0, 0, 0);
      return pDate.getTime() === checkDate.getTime();
    });

    if (entry && entry.conversationsCompleted > 0) {
      streak++;
    } else if (i === 0) {
      // Today hasn't had activity yet, that's ok — check yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

function calculateTrend(errorCounts: number[]): "improving" | "stable" | "declining" {
  if (errorCounts.length < 2) return "stable";

  const mid = Math.floor(errorCounts.length / 2);
  const recent = errorCounts.slice(0, mid);
  const older = errorCounts.slice(mid);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const diff = olderAvg - recentAvg;
  if (diff > 0.5) return "improving";
  if (diff < -0.5) return "declining";
  return "stable";
}

export { progress };
