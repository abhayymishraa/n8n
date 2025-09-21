import { z } from "zod";
import { createTrpcRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { TriggerManagementService } from "../../services/TriggermanagementService";


import { Queue } from "bullmq"


const connetion = {
  host: "localhost",
  port: 6379,
}




export const workflowQueue = new Queue("workflow-execution", { connection: connetion })

export const workflowRouter = createTrpcRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.workflow.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        active: true,
        updatedAt: true,
      },
    });
  } ),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          versions: {
            orderBy: { version: "desc" },
            take: 1,
          },
          triggers: true
        },
      });
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const newWorkflow = await ctx.prisma.workflow.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          versions: {
            create: {
              version: 1,
              node: [],
              connections: [],
            },
          },
        },
      });

      return newWorkflow;
    }),

  saveVersion: protectedProcedure
    .input(
      z.object({
        workflowId: z.uuid(),
        nodes: z.any(),
        connections: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const latestversion = await ctx.prisma.workflowVersion.findFirst({
        where: {
          workflowId: input.workflowId,
        },
        orderBy: {
          version: "desc",
        },
      });

      const nextversion = latestversion ? latestversion.version + 1 : 1;
      const newversion = await ctx.prisma.workflowVersion.create({
        data: {
          workflowId: input.workflowId,
          version: nextversion,
          node: input.nodes,
          connections: input.connections,
        },
      });

      await ctx.prisma.workflowNodeInstance.deleteMany({
        where: {
          workflowId: input.workflowId,
        },
      });

      if (input.nodes && input.nodes.length > 0) {
        await ctx.prisma.workflowNodeInstance.createMany({
          data: input.nodes.map((node: any) => ({
            workflowId: input.workflowId,
            nodeId: node.id,
            nodeType: node.type,
          })),
        });
      }

      return newversion;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(1).optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation( async ({ ctx, input }) => {

      if( typeof input.active === "boolean"){
        const triggerService = new TriggerManagementService();
        if(input.active){
          await triggerService.deactivateTriggers(input.id);
          await triggerService.activeTriggers(input.id);
        } else {
          await triggerService.deactivateTriggers(input.id)
        }
      }

      return ctx.prisma.workflow.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          name: input.name,
          triggersActive: input.active,
        },
      });
    }),

  executeManual: protectedProcedure
    .input(
      z.object({
        workflowid: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const latestversion = await ctx.prisma.workflowVersion.findFirst({
        where: {
          workflowId: input.workflowid,
        },
        orderBy: {
          version: "desc",
        },
        select: {
          id: true,
          workflowId: true,
        },
      });

      if (!latestversion) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const execution = await ctx.prisma.execution.create({
        data: {
          workflowId: latestversion.workflowId,
          workflowVersionId: latestversion.id,
          mode: "MANUAL",
          status: "QUEUED",
        },
      });

      await workflowQueue.add("workflow-execution", {
        executionId: execution.id,
        workflowVersionId: latestversion.id,
        triggerData: { message: "Manual trigger from the api" },
      });

      return { executionId: execution.id };
    }),

  getExecutions: protectedProcedure
    .input(
      z.object({
        workflowId: z.uuid(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.execution.findMany({
        where: {
          workflowId: input.workflowId,
        },
        include: {
          executionResults: {
            include: {
              nodeInstance: true,
            },
          },
          logs: {
            orderBy: { timestamp: 'asc' },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: input.limit,
      });
    }),

  getExecutionDetails: protectedProcedure
    .input(
      z.object({
        executionId: z.uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.execution.findUniqueOrThrow({
        where: {
          id: input.executionId,
        },
        include: {
          workflow: {
            select: { name: true },
          },
          executionResults: {
            include: {
              nodeInstance: true,
            },
            orderBy: { startTime: 'asc' },
          },
          logs: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });
    }),
});

export type WorkflowRouter = typeof workflowRouter;
