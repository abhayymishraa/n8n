import { prisma } from "@repo/database";
import { getImplementation } from "../nodes/NodeProvider";
import { NodeExecutionContext } from "../nodes/types";
import { CredentialService } from "./CredentialService";

export class WorkflowRunnerService {
  private async logExecution(executionId: string, level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: string, nodeId?: string) {
    await prisma.executionLog.create({
      data: {
        executionId,
        nodeId,
        level,
        message,
      },
    });
  }

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
      
      await this.logExecution(executionId, 'INFO', `Workflow execution started with trigger data: ${JSON.stringify(triggerData)}`);
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
      await this.logExecution(executionId, 'INFO', `Execution order determined: ${executionorders.join(' -> ')}`);
      
      let data: Record<string, any> = {
        trigger: { output: triggerData, handle: null },
      };
      for (const nodeId of executionorders) {
        const currentNode = nodes.find((n) => n.id === nodeId)!;

        const inputData = this.mapinputforNode(
          currentNode.id,
          connections,
          data
        );
        if (inputData === null) {
          await this.logExecution(executionId, 'INFO', `Skipping node ${currentNode.id} as its branch was not taken.`, currentNode.id);
          continue;
        }

        await this.logExecution(executionId, 'INFO', `Executing node ${currentNode.id} (${currentNode.data.type})`, currentNode.id);

        console.log(`🔍 Looking for implementation for node type: "${currentNode.data.type}"`);
        const implementation = getImplementation(currentNode.data.type); // <-- Use correct type property
        console.log(`📦 Implementation found:`, !!implementation);
        const nodeInstance = nodeinstance.find(
          (ni) => ni.nodeId === currentNode.id
        );
        if (!nodeInstance)
          throw new Error(
            `Invariant: Could not find WorkflowNodeInstance for nodeId ${nodeId}`
          );

        const context: NodeExecutionContext = {
          prisma,
          workflowId: wv.workflowId,
          executionId: executionId,
          nodeId: currentNode.id,
          fullDataPacket: data,
          getNodeConfig: () => currentNode.data.inputs || {},
          getCredential: async (credentialId) => {
            const c = await prisma.credentials.findFirst({
              where: { id: credentialId },
            });
            if (!c) return null;
            return {
              id: c.id,
              name: c.name,
              type: c.type,
              data: c.data as Record<string, any>,
            };
          },
          getCredentialService: () => CredentialService,
        };

        const startTime = new Date();
        let outputData: any;
        let executionTime: number = 0;
        
        try {
          outputData = await implementation.execute(inputData, context);
          executionTime = Date.now() - startTime.getTime();
          
          await this.logExecution(executionId, 'INFO', `Node ${currentNode.id} executed successfully in ${executionTime}ms`, currentNode.id);
        } catch (error: any) {
          executionTime = Date.now() - startTime.getTime();
          await this.logExecution(executionId, 'ERROR', `Node ${currentNode.id} failed: ${error.message}`, currentNode.id);
          throw error;
        }

        let outputHandle: string | null = null;
        let finalOutput = outputData;

        if (outputData?.__special_output__?.type === "branching") {
          outputHandle = outputData.__special_output__.outputHandle;
          finalOutput = outputData.__special_output__.data;
          await this.logExecution(executionId, 'INFO', `Node ${currentNode.id} branching output: ${outputHandle}`, currentNode.id);
        }

        data[currentNode.id] = { output: finalOutput, handle: outputHandle };

        await prisma.executionResult.create({
          data: {
            executionId: executionId,
            nodeInstanceId: nodeInstance.id,
            inputData: inputData,
            outputData: finalOutput,
            status: "COMPLETED",
            startTime: startTime,
            executionTime: executionTime,
          },
        });
      }

      await prisma.execution.update({
        where: { id: executionId },
        data: { 
          status: "COMPLETED",
          finishedAt: new Date(),
        },
      });
      
      await this.logExecution(executionId, 'INFO', 'Workflow execution completed successfully');
    } catch (e: any) {
      await prisma.execution.update({
        where: { id: executionId },
        data: { 
          status: "FAILED",
          finishedAt: new Date(),
        },
      });
      
      await this.logExecution(executionId, 'ERROR', `Workflow execution failed: ${e.message}`);
      throw e;
    }
  }
  private getExecutionOrder(nodes: any[], connections: any[]): string[] {
    console.log("🔍 Computing execution order for nodes:", nodes.map(n => `${n.id}(${n.data?.type})`));
    console.log("🔗 Connections:", connections.map(c => `${c.source} → ${c.target}`));
    
    const order: string[] = [];
    const nodemap = new Map(nodes.map((n) => [n.id, n]));
    const inDegree = new Map<string, number>(nodes.map((n) => [n.id, 0]));
    const adjList = new Map<string, string[]>(nodes.map((n) => [n.id, []]));

    // Build adjacency list and calculate in-degrees
    for (const conn of connections) {
      adjList.get(conn.source)?.push(conn.target);
      inDegree.set(conn.target, (inDegree.get(conn.target) || 0) + 1);
    }

    console.log("📊 In-degrees:", Object.fromEntries(inDegree));
    console.log("🌐 Adjacency list:", Object.fromEntries(adjList));

    // Find starting nodes (triggers and nodes with no dependencies)
    const queue = nodes
      .filter((n) => inDegree.get(n.id) === 0)
      .map((n) => n.id);

    console.log("🚀 Starting nodes (in-degree 0):", queue);

    // Breadth-First Topological Sort
    // This ensures we process level by level: main nodes first, then their children, then their children's children
    while (queue.length > 0) {
      // Process all nodes at current level
      const currentLevelSize = queue.length;
      const currentLevel: string[] = [];
      
      for (let i = 0; i < currentLevelSize; i++) {
        const nodeId = queue.shift()!;
        currentLevel.push(nodeId);
        order.push(nodeId);
        
        // Add children to queue for next level
        for (const neighbourId of adjList.get(nodeId) || []) {
          const newInDegree = (inDegree.get(neighbourId) || 1) - 1;
          inDegree.set(neighbourId, newInDegree);
          if (newInDegree === 0) {
            queue.push(neighbourId);
          }
        }
      }
      
      console.log(`📍 Level processed: [${currentLevel.join(', ')}]`);
    }

    if (order.length !== nodes.length) {
      console.error("❌ Workflow contains a cycle! Processed:", order.length, "Total:", nodes.length);
      console.error("Missing nodes:", nodes.filter(n => !order.includes(n.id)).map(n => n.id));
      throw new Error("Workflow contains a cycle and cannot be executed.");
    }
    
    console.log("✅ Final execution order:", order);
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
