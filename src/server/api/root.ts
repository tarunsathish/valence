import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { simulationRouter } from "./routers/simulation";

export const appRouter = createTRPCRouter({
  simulation: simulationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
