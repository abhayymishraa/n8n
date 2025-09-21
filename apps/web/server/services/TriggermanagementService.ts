import { v4 } from "uuid";
import { prisma } from "../trpc/trpc";

export class TriggerManagementService {
  public async activeTriggers(workflowId: string) {
    const latestversion = await prisma.workflowVersion.findFirst({
      where: {
        workflowId,
      },
      orderBy: {
        version: "desc",
      },
    });

    if (!latestversion) return;

    const triggerNodes = (latestversion.node as any[]).filter(
      (n) => n.data.role === "trigger"
    );

    for (const triggerNde of triggerNodes) {
      if (triggerNde.data.type === "webhook") {
        const uniquePath = v4();
        await prisma.workflowTrigger.create({
          data: {
            workflowId,
            nodeId: triggerNde.id,
            triggerType: "WEBHOOK",
            configuration: {
              path: uniquePath,
              method: "POST",
            },
          },
        });
      }
      console.log("trigger node", triggerNde);
    }
  }

  public async deactivateTriggers(workflowId: string) {
    await prisma.workflowTrigger.deleteMany({
      where: {
        workflowId,
      },
    });
    console.log(
      `[TriggerService] Deactivated all triggers for workflow ${workflowId}`
    );
  }
}
