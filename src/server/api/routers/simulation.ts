import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { runSimulation } from "~/lib/simulation/engine";
import { getAllTribes } from "~/lib/tribes/generator";

export const simulationRouter = createTRPCRouter({
  // Get all available tribes
  getTribes: publicProcedure.query(() => {
    return getAllTribes();
  }),

  // Create a new simulation
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        targetTribe: z.string(),
        geography: z.string().default("Global"),
        stimulusType: z.enum(["TEXT", "URL", "PDF", "IMAGE"]),
        stimulusText: z.string().min(10),
        chaosModes: z.object({
          hater: z.boolean().default(false),
          recession: z.boolean().default(false),
          echoChamber: z.boolean().default(false),
        }),
        agentCount: z.number().min(30).max(300).default(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create simulation record (demo mode - no user auth required)
      const simulation = await ctx.db.simulation.create({
        data: {
          userId: "demo-user",
          title: input.title,
          targetTribe: input.targetTribe,
          geography: input.geography,
          stimulusType: input.stimulusType,
          stimulusText: input.stimulusText,
          chaosModes: input.chaosModes as never,
          agentCount: input.agentCount,
          status: "QUEUED",
        },
      });

      // Start simulation in background (non-blocking)
      // In production, this should use a proper job queue like BullMQ
      runSimulation({
        simulationId: simulation.id,
        tribeId: input.targetTribe,
        agentCount: input.agentCount,
        stimulusText: input.stimulusText,
        stimulusType: input.stimulusType,
        chaosModes: input.chaosModes,
      }).catch((error) => {
        console.error("Simulation failed:", error);
      });

      return simulation;
    }),

  // Get simulation by ID with all related data
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const simulation = await ctx.db.simulation.findUnique({
        where: { id: input.id },
        include: {
          report: true,
          agentProfiles: {
            take: 10, // Sample of agents for display
            include: {
              responses: true,
            },
          },
          agentResponses: {
            orderBy: { createdAt: "desc" },
            take: 25, // Sample responses
          },
        },
      });

      if (!simulation) {
        throw new Error("Simulation not found");
      }

      return simulation;
    }),

  // List all simulations for current user
  listForUser: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      const simulations = await ctx.db.simulation.findMany({
        where: {},
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          report: {
            select: {
              mfiScore: true,
              confidenceLevel: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (simulations.length > limit) {
        const nextItem = simulations.pop();
        nextCursor = nextItem?.id;
      }

      return {
        simulations,
        nextCursor,
      };
    }),

  // Get simulation status (for polling during execution)
  getStatus: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const simulation = await ctx.db.simulation.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          status: true,
          agentCount: true,
          _count: {
            select: {
              agentResponses: true,
            },
          },
        },
      });

      if (!simulation) {
        throw new Error("Simulation not found");
      }

      return {
        id: simulation.id,
        status: simulation.status,
        progress: {
          completed: simulation._count.agentResponses,
          total: simulation.agentCount,
          percentage:
            (simulation._count.agentResponses / simulation.agentCount) * 100,
        },
      };
    }),

  // Delete a simulation
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify existence before deleting
      const simulation = await ctx.db.simulation.findUnique({
        where: { id: input.id },
      });

      if (!simulation) {
        throw new Error("Simulation not found");
      }

      await ctx.db.simulation.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
