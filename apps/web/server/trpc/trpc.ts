import { PrismaClient } from "@repo/database";
import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession, Session } from "next-auth";
import { authOption } from "../../app/api/auth/[...nextauth]/route";

declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export interface TRPCContext {
  prisma: PrismaClient;
  session: Session | null;
}

export const prisma: PrismaClient = new PrismaClient();

export const createTRPCContext = async () => {
  const session = await getServerSession(authOption);

  return {
    prisma,
    session,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const createTrpcRouter = t.router;
export const publicProcedure = t.procedure;

const userIsAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(userIsAuth);
