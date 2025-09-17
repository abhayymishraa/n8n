import { authRouter } from "./routers/auth";
import { credentialRouter } from "./routers/credential";
import { workflowRouter } from "./routers/workflow";
import { createTrpcRouter } from "./trpc";

export const appRouter = createTrpcRouter({
  workflow: workflowRouter,
  credentials: credentialRouter,
  auth: authRouter
});

export type AppRouter = typeof appRouter;
