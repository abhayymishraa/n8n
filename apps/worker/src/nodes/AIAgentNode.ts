import { NodeImplementation, NodeExecutionContext } from "./types";
import { SimpleAIAgent, SimpleAgentConfig } from "../agents/SimpleAIAgent";

export const AIAgentNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    const config = context.getNodeConfig();
    const {
      provider = "openai",
      model,
      temperature = 0.7,
      maxTokens = 2000,
      systemPrompt,
      task,
      useTools = true,
      analyzeData = false,
      generateReport = false,
      reportType = "summary"
    } = config;

    if (!task && !analyzeData && !generateReport) {
      throw new Error("AI Agent requires either 'task', 'analyzeData', or 'generateReport' to be specified");
    }

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

      // Execute based on the specified action
      if (task) {
        // Execute a specific task
        const taskResult = await agent.execute(task);
        result = {
          task,
          output: taskResult.output,
          usage: taskResult.usage
        };
      } else if (analyzeData) {
        // Analyze workflow data
        const analysisResult = await agent.execute("analyze workflow data and provide insights");
        result = {
          analysis: analysisResult.output,
          dataAnalyzed: context.fullDataPacket,
          timestamp: new Date().toISOString()
        };
      } else if (generateReport) {
        // Generate a report
        const reportResult = await agent.execute(`generate ${reportType} report based on the provided data`);
        result = {
          report: reportResult.output,
          reportType,
          dataSource: input,
          timestamp: new Date().toISOString()
        };
      }

      // Add metadata
      result.metadata = {
        provider,
        model: model || (provider === "openai" ? "gpt-4" : "gemini-pro"),
        temperature,
        maxTokens,
        executionTime: Date.now(),
        nodeId: context.nodeId
      };

      return result;

    } catch (error) {
      console.error("AI Agent node execution failed:", error);
      throw new Error(`AI Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
