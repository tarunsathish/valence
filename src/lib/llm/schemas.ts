import { z } from "zod";

export const agentReactionSchema = z.object({
  reaction: z.string().min(10),
  sentiment: z.number().min(-1).max(1),
  purchaseIntent: z.number().min(0).max(1),
  virality: z.number().min(0).max(1),
  objections: z.array(z.string()),
  emotionalTriggers: z
    .object({
      confusion: z.number().min(0).max(1).optional(),
      anger: z.number().min(0).max(1).optional(),
      excitement: z.number().min(0).max(1).optional(),
      fear: z.number().min(0).max(1).optional(),
      trust: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export type AgentReaction = z.infer<typeof agentReactionSchema>;
