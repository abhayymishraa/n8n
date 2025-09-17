import { z } from "zod";
import { createTrpcRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";

export const authRouter = createTrpcRouter({
  signup: publicProcedure
    .input(
      z.object({
        email: z.email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existinguser = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (existinguser) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "An account with this username already exist you cant sign in into by using different email",
        });
      }
      const hashedpass = await bcrypt.hash(input.password, 10);
      const newUser = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashedpass,
        },
      });

      return {
        id: newUser.id,
        email: newUser.email,
      };
    }),
});
