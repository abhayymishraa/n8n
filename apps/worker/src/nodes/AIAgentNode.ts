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
      task: rawTask,
      prompt,
      credentialId,
      apiKey,
      useTools = true,
      analyzeData = false,
      generateReport = false,
      reportType = "summary"
    } = config;

    const task = (rawTask || prompt) as string | undefined;

    const shouldRunGeneric = !task && !analyzeData && !generateReport;

    try {
      // If provider is gemini, call Gemini HTTP API directly without adding extra prompt
      if ((provider as string) === 'gemini') {
        // Resolve API key: credentialId > apiKey field
        let geminiKey = apiKey as string | undefined;
        if (!geminiKey && credentialId) {
          const cred = await context.getCredential(credentialId);
          geminiKey = cred?.data?.apiKey as string | undefined;
        }
        if (!geminiKey) {
          throw new Error('Gemini API key is required (set via credentialId or apiKey)');
        }
        const modelName = model || 'gemini-2.0-flash';
        const userText = task || '';
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': geminiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [ { text: userText } ]
              }
            ]
          })
        });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`Gemini HTTP error: ${resp.status} ${txt}`);
        }
        const data = await resp.json();
        const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
        const result: any = {
          task: userText || 'generic',
          output: outputText,
          metadata: {
            provider: 'gemini',
            model: modelName,
            temperature,
            maxTokens,
            executionTime: Date.now(),
            nodeId: context.nodeId
          }
        };
        return result;
      }

      // Otherwise use SimpleAIAgent (OpenAI default)
      const agentConfig: SimpleAgentConfig = {
        provider: 'openai',
        model: model || 'gpt-4o-mini',
        temperature,
        maxTokens,
        systemPrompt
      };

      const agentContext = {
        prisma: context.prisma,
        executionId: context.executionId,
        workflowId: context.workflowId,
        nodeId: context.nodeId,
        fullDataPacket: context.fullDataPacket
      };
      const agent = await SimpleAIAgent.createAgent(agentConfig, agentContext);

      let result: any = {};
      if (task) {
        const taskResult = await agent.execute(task);
        result = {
          task,
          output: taskResult.output,
          usage: taskResult.usage
        };
      } else if (shouldRunGeneric) {
        const generic = await agent.execute("Process the provided input and return a helpful response.");
        result = {
          task: "generic",
          output: generic.output,
          usage: generic.usage
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
        const reportResult = await agent.execute(`generate ${reportType} report based on the provided data`);
        result = {
          report: reportResult.output,
          reportType,
          dataSource: input,
          timestamp: new Date().toISOString()
        };
      }

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
