import { Mastra } from "@mastra/core";
import { conversationAgent } from "./agents/conversation";
import { correctionAgent } from "./agents/correction";

export const mastra = new Mastra({
  agents: {
    conversationAgent,
    correctionAgent,
  },
});
