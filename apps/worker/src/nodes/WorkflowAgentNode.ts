import { NodeImplementation, NodeExecutionContext } from "./types";
import { SimpleAIAgent, SimpleAgentConfig } from "../agents/SimpleAIAgent";

export const WorkflowAgentNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    const config = context.getNodeConfig();
    const {
      provider = "openai",
      model,
      temperature = 0.7,
      maxTokens = 2000,
      systemPrompt,
      mode = "orchestrate", 
      enableMemory = true,
      enableLearning = true,
      enableAutoOptimization = false
    } = config;

    try {
      // Create agent configuration
      const agentConfig: SimpleAgentConfig = {
        provider: provider as "openai" | "gemini",
        model,
        temperature,
        maxTokens,
        systemPrompt
      };

      // Create agent context
      const agentContext = {
        prisma: context.prisma,
        executionId: context.executionId,
        workflowId: context.workflowId,
        nodeId: context.nodeId,
        fullDataPacket: context.fullDataPacket
      };

      // Create the AI agent
      const agent = await SimpleAIAgent.createAgent(agentConfig, agentContext);

      let result: any = {};

      // Execute based on the specified mode
      switch (mode) {
        case "orchestrate":
          const orchestrateResult = await agent.execute("orchestrate workflow execution and provide action plan");
          result = JSON.parse(orchestrateResult.output);
          break;
        case "optimize":
          const optimizeResult = await agent.execute("optimize workflow performance and provide recommendations");
          result = JSON.parse(optimizeResult.output);
          break;
        case "predict":
          const predictResult = await agent.execute("predict potential issues and provide preventive actions");
          result = JSON.parse(predictResult.output);
          break;
        case "learn":
          const learnResult = await agent.execute("learn from execution patterns and provide insights");
          result = JSON.parse(learnResult.output);
          break;
        default:
          throw new Error(`Unknown workflow agent mode: ${mode}`);
      }

      // Add metadata
      result.metadata = {
        mode,
        provider,
        model: model || (provider === "openai" ? "gpt-4" : "gemini-pro"),
        temperature,
        maxTokens,
        executionTime: Date.now(),
        nodeId: context.nodeId,
        enableMemory,
        enableLearning,
        enableAutoOptimization
      };

      // Add input data for reference
      result.inputData = input;

      return result;

    } catch (error) {
      console.error("Workflow Agent node execution failed:", error);
      throw new Error(`Workflow Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
