import { getImplementation } from "../nodes/NodeProvider";
import { NodeExecutionContext } from "../nodes/types";
import { PrismaClient } from "@repo/database";

export const prisma: PrismaClient = new PrismaClient();

export class WorkflowRunnerService {
  public async executeWorkflow(
    executionId: string,
    workflowVersionId: string,
    triggerData: any
  ) {
    try {
      await prisma.execution.update({
        where: {
          id: executionId,
        },
        data: {
          status: "RUNNING",
          startedAt: new Date(),
        },
      });

      const wv = await prisma.workflowVersion.findUniqueOrThrow({
        where: {
          id: workflowVersionId,
        },
      });

      const nodeinstance = await prisma.workflowNodeInstance.findMany({
        where: {
          workflowId: wv.workflowId,
        },
      });

      const nodes = wv.node as any[];
      const connections = wv.connections as any[];
      const executionorders = this.getExecutionOrder(nodes, connections);
      let data: Record<string, any> = { trigger: { output: triggerData } };

      for (const nodeId of executionorders) {
        const currnetnode = nodes.find((n) => n.id === nodeId);
        const implementation = getImplementation(currnetnode.type);
        const instance = nodeinstance.find((ni) => ni.id === nodeId)!;
        const context: NodeExecutionContext = {
          prisma: prisma,
          workflowId: wv.workflowId,
          executionId: executionId,
          nodeId: currnetnode.id,
          getNodeConfig: () => ({}),
          getCredential: async () => null,
          getCredentialService: () => ({} as any),
          fullDataPacket: {}
        };

        const inputdata = this.mapinputforNode(
          currnetnode.id,
          connections,
          data
        );
        const outputdata = await implementation.execute(inputdata, context);
        data[currnetnode.id] = { output: outputdata };

        await prisma.executionResult.create({
          data: {
            executionId: executionId,
            nodeInstanceId: instance.id,
            inputData: inputdata,
            outputData: outputdata,
            status: "COMPLETED",
            startTime: new Date(),
            executionTime: 0,
          },
        });
      }
      await prisma.execution.update({
        where: {
          id: executionId,
        },
        data: {
          status: "COMPLETED",
          finishedAt: new Date(),
        },
      });
    } catch (e) {
      await prisma.execution.update({
        where: {
          id: executionId,
        },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
        },
      });
    }
  }

  private getExecutionOrder(nodes: any[], connections: any[]): string[] {
    const order: string[] = [];
    const nodemap = new Map(nodes.map((n) => [n.id, n]));
    const inDegree = new Map<string, number>(nodes.map((n) => [n.id, 0]));
    const adjList = new Map<string, string[]>(nodes.map((n) => [n.id, []]));

    for (const conn of connections) {
      adjList.get(conn.source)?.push(conn.target);
      inDegree.set(conn.target, (inDegree.get(conn.target) || 0) + 1);
    }

    const quque = nodes
      .filter((n) => inDegree.get(n.id) === 0)
      .map((n) => n.id);

    while (quque.length > 0) {
      const nodeId = quque.shift()!;
      order.push(nodeId);
      for (const neighbourId of adjList.get(nodeId) || []) {
        inDegree.set(neighbourId, (inDegree.get(neighbourId) || 1) - 1);
        if (inDegree.get(neighbourId) === 0) {
          quque.push(neighbourId);
        }
      }
    }

    if (order.length !== nodes.length) {
      throw new Error("Workflow contains a cycle and cannot be executed.");
    }
    return order;
  }

  private mapinputforNode(
    nodeid: string,
    connections: any[],
    datapacket: Record<string, any>
  ): any {
    const parentconnection = connections.filter((c) => c.target === nodeid);
    if (parentconnection.length === 0) {
      return datapacket["trigger"].output;
    }

    if (parentconnection.length === 1) {
      return datapacket[parentconnection[0].source].output;
    }

    const mergedInput = {};
    for (const conn of parentconnection) {
      Object.assign(mergedInput, datapacket[conn.source].output);
    }
    return mergedInput;
  }
}
