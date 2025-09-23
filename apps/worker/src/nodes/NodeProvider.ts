import { NodeExecutionContext, NodeImplementation } from "./types";
import { eval as evalExpression} from 'expression-eval';
import { AIAgentNode } from "./AIAgentNode";
import { WorkflowAgentNode } from "./WorkflowAgentNode";
import { TemplateEngine } from "../utils/TemplateEngine";

const ManualTriggerNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    console.log(`🎯 Manual trigger executed for workflow: ${context.workflowId}`);
    return input;
  },
};

const WebhookTriggerNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    console.log(`🪝 Webhook trigger executed for workflow: ${context.workflowId}`);
    const payload = context.fullDataPacket?.trigger?.output;
    return payload !== undefined ? payload : input;
  },
};

const LogNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    const config = context.getNodeConfig();
    let logMessage = config.message || '{{ $json }}';

    // Use enhanced template engine for better data access
    const templateContext = {
      input,
      fullDataPacket: context.fullDataPacket,
      trigger: context.fullDataPacket.trigger?.output || {}
    };

    if (logMessage === '{{ $json }}') {
      logMessage = JSON.stringify(input, null, 2);
    } else {
      logMessage = TemplateEngine.process(logMessage, templateContext);
    }

    console.log(`--- [LOG] Workflow: ${context.workflowId}, Node: ${context.nodeId} ---`);
    console.log(logMessage);
    console.log(`--- END LOG ---`);
    return input; // Pass through
  },
};



const IFNODE: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    const config = context.getNodeConfig();
    const {condition } = config;
    if(!condition){
      console.log("No condition found ");
      return input      
    };

    let res = false;
    try {
      res = evalExpression(condition, {...input})
    } catch (err) {
      console.log("somehting is not right");
      res = false
    }

    return {
      __special_output:  {
        type: 'branching',
        outputHandle: res ? 'true' : 'false',
        data: input
      }
    }
  }
}


const TelegramSendNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    const config = context.getNodeConfig();
    const {credentialId, chatId, message} = config;

    if(!credentialId  || !chatId || !message){
      throw new Error("Missing required fields: credentialId, chatId, or message");
    } 

    const credentials = await context.getCredential(credentialId);
    if(!credentials?.data?.token){
      throw new Error("Telegram bot token not found in credentials");
    }

    const botToken = credentials.data.token;

    // Use enhanced template engine for better data access
    const templateContext = {
      input,
      fullDataPacket: context.fullDataPacket,
      trigger: context.fullDataPacket.trigger?.output || {}
    };

    const templatedMessage = TemplateEngine.process(message, templateContext);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: templatedMessage
      })
    });

    const resdata = await response.json();

    if(!response.ok){
      throw new Error(`Telegram API error: ${resdata.description || 'Unknown error'}`);
    }

    return {
      success: true,
      messageId: resdata.result?.message_id,
      chatId: resdata.result?.chat?.id,
      text: resdata.result?.text,
    };
  }
}

const HttpRequestNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    const config = context.getNodeConfig();
    const { method = 'GET', url, headers = {}, body, timeout = 10000, credentialId } = config;

    if (!url) {
      throw new Error("URL is required for HTTP request");
    }

    // Use enhanced template engine for better data access
    const templateContext = {
      input,
      fullDataPacket: context.fullDataPacket,
      trigger: context.fullDataPacket.trigger?.output || {}
    };

    // Template the URL
    const templatedUrl = TemplateEngine.process(url, templateContext);

    // Start with template headers
    const templatedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      templatedHeaders[key] = TemplateEngine.process(String(value), templateContext);
    }

    // Add authentication headers if credential is provided
    if (credentialId) {
      const credentials = await context.getCredential(credentialId);
      if (credentials) {
        const credentialService = context.getCredentialService();
        const authHeaders = credentialService.getAuthHeaders(credentials.type as any, credentials.data);
        Object.assign(templatedHeaders, authHeaders);
      }
    }

    // Template body if it exists
    let templatedBody = body;
    if (body && typeof body === 'string') {
      templatedBody = TemplateEngine.process(body, templateContext);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(templatedUrl, {
        method: method.toUpperCase(),
        headers: templatedHeaders,
        body: templatedBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        statusCode: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(Array.from(response.headers as any).entries()),
        data: responseData,
        success: response.ok,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  }
}

const DataTransformNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    const config = context.getNodeConfig();
    const { transformations = [] } = config;

    let result = { ...input };

    for (const transformation of transformations) {
      const { type, field, value, newField } = transformation;

      switch (type) {
        case 'set':
          // Set a field to a specific value
          const templateContext = {
            input: result,
            fullDataPacket: context.fullDataPacket,
            trigger: context.fullDataPacket.trigger?.output || {}
          };
          const templatedValue = TemplateEngine.process(String(value), templateContext);
          result[newField || field] = templatedValue;
          break;

        case 'remove':
          delete result[field];
          break;

        case 'rename':
          if (result.hasOwnProperty(field)) {
            result[newField] = result[field];
            delete result[field];
          }
          break;

        case 'math':
          const { operation, operand } = transformation;
          const currentValue = Number(result[field]) || 0;
          const operandValue = Number(operand) || 0;
          
          switch (operation) {
            case 'add':
              result[field] = currentValue + operandValue;
              break;
            case 'subtract':
              result[field] = currentValue - operandValue;
              break;
            case 'multiply':
              result[field] = currentValue * operandValue;
              break;
            case 'divide':
              result[field] = operandValue !== 0 ? currentValue / operandValue : 0;
              break;
          }
          break;

        case 'format':
          const { formatType, formatString } = transformation;
          if (formatType === 'date' && result[field]) {
            const date = new Date(result[field]);
            result[field] = date.toLocaleDateString();
          } else if (formatType === 'uppercase') {
            result[field] = String(result[field]).toUpperCase();
          } else if (formatType === 'lowercase') {
            result[field] = String(result[field]).toLowerCase();
          }
          break;
      }
    }

    return result;
  }
}

const DelayNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    const config = context.getNodeConfig();
    const { delay = 1000, unit = 'milliseconds' } = config;

    let delayMs = delay;
    switch (unit) {
      case 'seconds':
        delayMs = delay * 1000;
        break;
      case 'minutes':
        delayMs = delay * 60 * 1000;
        break;
      case 'hours':
        delayMs = delay * 60 * 60 * 1000;
        break;
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    return {
      ...input,
      delayedAt: new Date().toISOString(),
      delayDuration: delayMs,
    };
  }
}

const EmailNode: NodeImplementation = {
  execute: async (input: any, context: NodeExecutionContext) => {
    const config = context.getNodeConfig();
    const { credentialId, to, subject, body, isHtml = false } = config;

    if (!credentialId || !to || !subject || !body) {
      throw new Error("Missing required fields: credentialId, to, subject, or body");
    }

    const credentials = await context.getCredential(credentialId);
    if (!credentials?.data?.apiKey) {
      throw new Error("Resend API key not found in credentials");
    }

    const templateContext = {
      input,
      fullDataPacket: context.fullDataPacket,
      trigger: context.fullDataPacket.trigger?.output || {}
    };

    const templatedTo = TemplateEngine.process(to, templateContext);
    const templatedSubject = TemplateEngine.process(subject, templateContext);
    const templatedBody = TemplateEngine.process(body, templateContext);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.data.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@example.com',
        to: [templatedTo],
        subject: templatedSubject,
        [isHtml ? 'html' : 'text']: templatedBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Resend API error: ${response.status} ${errorData}`);
    }

    const result = await response.json();
    return {
      success: true,
      emailSent: true,
      messageId: result.id,
      to: templatedTo,
      subject: templatedSubject,
      sentAt: new Date().toISOString(),
    };
  }
}

const nodeRegistry: Record<string, NodeImplementation> = {
  'Manual': ManualTriggerNode,
  'webhook': WebhookTriggerNode,
  'log': LogNode,
  'telegram-send-message': TelegramSendNode,
  'if': IFNODE,
  'http-request': HttpRequestNode,
  'data-transform': DataTransformNode,
  'delay': DelayNode,
  'email': EmailNode,
  'ai-agent': AIAgentNode,
  'workflow-agent': WorkflowAgentNode,
  'google-gemini': AIAgentNode,
  'gemini': AIAgentNode,
};

export const getImplementation = (type: string): NodeImplementation => {
  const original = type;

  let impl = nodeRegistry[original];


  if (!impl) {
    console.error(`❌ No implementation found for node type: "${original}"`);
    throw new Error(`No implementation found for node type: "${original}"`);
  }
  console.log(`✅ Found implementation for node type: "${original}"`);
  return impl;
};
