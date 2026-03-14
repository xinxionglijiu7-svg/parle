import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const saveVocabularyTool = createTool({
  id: "save_vocabulary",
  description:
    "Extracts and saves notable vocabulary words from the conversation to the user's vocabulary notebook.",
  inputSchema: z.object({
    userId: z.string().describe("The user's ID"),
    scenarioId: z.number().describe("The scenario ID"),
    words: z.array(
      z.object({
        word: z.string().describe("The French word or expression"),
        translation: z
          .string()
          .describe("The Japanese translation"),
        context: z
          .string()
          .describe("The sentence where the word appeared in the conversation"),
      }),
    ),
  }),
  execute: async ({ context: input }) => {
    const saved = [];

    for (const w of input.words) {
      const existing = await prisma.vocabulary.findFirst({
        where: { userId: input.userId, word: w.word },
      });

      if (!existing) {
        const vocab = await prisma.vocabulary.create({
          data: {
            userId: input.userId,
            word: w.word,
            translation: w.translation,
            context: w.context,
            scenarioId: input.scenarioId,
          },
        });
        saved.push(vocab);
      }
    }

    return { savedCount: saved.length, words: saved.map((v) => v.word) };
  },
});
