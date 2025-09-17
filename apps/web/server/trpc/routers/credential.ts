import { z } from "zod";

import { createTrpcRouter, protectedProcedure } from "../trpc";

export const credentialRouter = createTrpcRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.credentials.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
  }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.credentials.findFirst({
        where: {
          id: input.id,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        data: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.credentials.create({
        data: {
          name: input.name,
          type: input.type,
          data: input.data,
          userId: ctx.session.user.id,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.credentials.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
      return { success: "true" };
    }),
});
