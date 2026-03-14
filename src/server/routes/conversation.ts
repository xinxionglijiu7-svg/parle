import { Hono } from "hono";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { mastra } from "@/mastra/index";
import { getScenarioById } from "@/mastra/scenarios";

type Env = {
  Variables: {
    userId: string;
  };
};

const conversations = new Hono<Env>();

// Auth middleware for all conversation routes
conversations.use("/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Non autorisé" }, 401);

  const payload = await verifyToken(token);
  if (!payload) return c.json({ error: "Token invalide" }, 401);

  c.set("userId", payload.userId);
  await next();
});

// GET /api/conversations — list user's conversations
conversations.get("/", async (c) => {
  try {
    const userId = c.get("userId");

    const list = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        scenarioId: true,
        status: true,
        createdAt: true,
        completedAt: true,
      },
    });

    return c.json(list);
  } catch (error) {
    console.error("Error listing conversations:", error);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
  }
});

// POST /api/conversations — create new conversation with scenario
conversations.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    const { scenarioId } = await c.req.json<{ scenarioId: number }>();

    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return c.json({ error: "Scénario introuvable" }, 404);
    }

    // Get agent's opening message
    const agent = mastra.getAgent("conversationAgent");
    const prompt = `${scenario.initialPrompt}\n\nCommence la conversation maintenant avec une première réplique.`;

    const response = await agent.generate(prompt);
    const agentMessage = typeof response.text === "string" ? response.text : "";

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        scenarioId,
        messages: [
          {
            role: "assistant",
            content: agentMessage,
            timestamp: new Date(),
          },
        ],
      },
    });

    return c.json(conversation, 201);
  } catch (error) {
    console.error("Error creating conversation:", error);
    const message = error instanceof Error ? error.message : String(error);
    // Temporary: return actual error for debugging
    return c.json({ error: `Debug: ${message.substring(0, 300)}` }, 500);
  }
});

// GET /api/conversations/:id — get single conversation
conversations.get("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
    });

    if (!conversation) {
      return c.json({ error: "Conversation introuvable" }, 404);
    }

    return c.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
  }
});

// POST /api/conversations/:id/message — send user message, get agent response
conversations.post("/:id/message", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const { content } = await c.req.json<{ content: string }>();

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId, status: "active" },
    });

    if (!conversation) {
      return c.json({ error: "Conversation introuvable ou terminée" }, 404);
    }

    const scenario = getScenarioById(conversation.scenarioId);

    // Build prompt with conversation history
    const agent = mastra.getAgent("conversationAgent");
    const scenarioContext = scenario
      ? `[Contexte du scénario : ${scenario.initialPrompt}]\n\n`
      : "";

    const historyText = conversation.messages
      .map((m) => `${m.role === "user" ? "Apprenant" : "Ami"}: ${m.content}`)
      .join("\n");

    const prompt = `${scenarioContext}Voici l'historique de la conversation :\n${historyText}\nApprenant: ${content}\n\nRéponds en tant qu'ami :`;

    const response = await agent.generate(prompt);
    const agentMessage = typeof response.text === "string" ? response.text : "";

    // Update conversation with both messages
    const now = new Date();
    await prisma.conversation.update({
      where: { id },
      data: {
        messages: {
          push: [
            { role: "user", content, timestamp: now },
            { role: "assistant", content: agentMessage, timestamp: new Date() },
          ],
        },
      },
    });

    return c.json({
      userMessage: { role: "user", content, timestamp: now },
      agentMessage: {
        role: "assistant",
        content: agentMessage,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
  }
});

// PATCH /api/conversations/:id/complete — end conversation
conversations.patch("/:id/complete", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId, status: "active" },
    });

    if (!conversation) {
      return c.json({ error: "Conversation introuvable ou déjà terminée" }, 404);
    }

    // Mark as completed
    await prisma.conversation.update({
      where: { id },
      data: { status: "completed", completedAt: new Date() },
    });

    // Build transcript for correction agent
    const transcript = conversation.messages
      .map((m) => `${m.role === "user" ? "Apprenant" : "Ami"}: ${m.content}`)
      .join("\n");

    // Generate feedback
    const correctionAgent = mastra.getAgent("correctionAgent");
    const feedbackResponse = await correctionAgent.generate(
      `Analyse la transcription suivante et fournis ton feedback au format JSON demandé.\n\nTranscription :\n${transcript}`,
    );

    const feedbackText =
      typeof feedbackResponse.text === "string" ? feedbackResponse.text : "";

    // Parse JSON feedback
    let feedbackData;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
      feedbackData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(feedbackText);
    } catch {
      feedbackData = {
        grammarErrors: [],
        vocabularySuggestions: [],
        pronunciationNotes: [],
        keyPhrases: [],
        overallComment: feedbackText,
      };
    }

    // Save feedback
    const feedback = await prisma.feedback.create({
      data: {
        conversationId: id,
        userId,
        grammarErrors: feedbackData.grammarErrors || [],
        vocabularySuggestions: feedbackData.vocabularySuggestions || [],
        pronunciationNotes: feedbackData.pronunciationNotes || [],
        keyPhrases: feedbackData.keyPhrases || [],
        overallComment: feedbackData.overallComment || "",
      },
    });

    // Auto-save vocabulary from suggestions
    if (feedbackData.vocabularySuggestions?.length > 0) {
      for (const suggestion of feedbackData.vocabularySuggestions) {
        const existing = await prisma.vocabulary.findFirst({
          where: { userId, word: suggestion.suggested },
        });
        if (!existing) {
          await prisma.vocabulary.create({
            data: {
              userId,
              word: suggestion.suggested,
              translation: "",
              context: suggestion.context || "",
              scenarioId: conversation.scenarioId,
            },
          });
        }
      }
    }

    // Update learning progress for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vocabCount = feedbackData.vocabularySuggestions?.length || 0;
    const errorCount = feedbackData.grammarErrors?.length || 0;

    const existingProgress = await prisma.learningProgress.findFirst({
      where: { userId, date: today },
    });

    if (existingProgress) {
      await prisma.learningProgress.update({
        where: { id: existingProgress.id },
        data: {
          conversationsCompleted: existingProgress.conversationsCompleted + 1,
          newWordsLearned: existingProgress.newWordsLearned + vocabCount,
          grammarErrorCount: existingProgress.grammarErrorCount + errorCount,
        },
      });
    } else {
      // Calculate streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayProgress = await prisma.learningProgress.findFirst({
        where: { userId, date: yesterday },
      });

      const streak = yesterdayProgress ? yesterdayProgress.streak + 1 : 1;

      await prisma.learningProgress.create({
        data: {
          userId,
          date: today,
          conversationsCompleted: 1,
          newWordsLearned: vocabCount,
          grammarErrorCount: errorCount,
          streak,
        },
      });
    }

    return c.json({ conversation: { id, status: "completed" }, feedback });
  } catch (error) {
    console.error("Error completing conversation:", error);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
  }
});

export { conversations };
