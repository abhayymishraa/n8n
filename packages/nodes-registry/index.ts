export interface NodeDefinition {
  type: string;
  displayName: string;
  description: string;
  icon: string;
  role: "trigger" | "action" | "both";
  group: "ai" | "action" | "data" | "flow" | "core" | "trigger";
  properties?: NodeProperty[];
}

export interface NodeProperty {
  displayName: string;
  name: string;
  type: "string" | "number" | "boolean" | "options" | "notice" | "credential";
  required?: boolean;
  default?: any;
  placeholder?: string;
  options?: Array<{ name: string; value: string }>;
  credentialTypes?: string[];
}

export const NODES_REGISTRY: NodeDefinition[] = [
  {
    type: "Manual",
    displayName: "Manual Trigger",
    description: "runs the flow when  clicking on a button",
    icon: "MousePointerClick",
    role: "trigger",
    group: "trigger",
    properties: [],
  },
  {
    type: "telegram-send-message",
    displayName: "Telegram Send Message",
    description: "Sends a message to a telegram channel",
    icon: 'Send',
    role: 'action',
    group: 'action',
    properties: [
      {
        displayName: 'Bot credentials',
        name: 'credentialId',
        type: 'credential',
        required: true,
        credentialTypes: ['TELEGRAM_BOT'],
      },
      {
        displayName: 'Chat ID',
        name: 'chatId',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'eg., 123456',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        required: true,
        default: 'Hello from Workflow',
        placeholder: 'eg., You can use data from the previous steps like {{trigger.output.body.name}}'
      }
    ]
  },
  {
    type: "webhook",
    displayName: "Webhook",
    description: "Runs the flow on recieving a http request",
    icon: "Webhook",
    role: "trigger",
    group: "trigger",
    properties: [
      {
        displayName: 'Webhook URL',
        name: 'webhookURL',
        type: 'notice',
        default: 'Your webhook URL will appear here with usage instructions',
      },
      {
        displayName: 'HTTP Method',
        name: 'httpMethod',
        type: 'options',
        default: 'POST',
        options: [
          {name: 'POST', value: 'POST'},
          {name: 'GET', value:'GET'},
          {name: 'PUT', value: 'PUT'}
        ]
      }
    ],
  },
  {
    type: "log",
    displayName: "Log Message",
    description: "Logs the data to the console for the debugging",
    icon: "Terminal",
    role: "action",
    group: "core",
    properties: [
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        required: true,
        default: '{{ $json }}',
        placeholder: 'Enter message to log'
      }
    ],
  },
  {
    type: "if",
    displayName: "IF",
    description: "Branch the flow on a condition",
    icon: "GitFork",
    role: "action",
    group: "flow",
    properties: [
      {
        displayName: 'Condition',
        name: 'condition',
        type: 'string',
        required: true,
        default: '{{ $json.value }} > 0',
        placeholder: 'Enter condition expression'
      }
    ],
  },
  {
    type: "google-gemini",
    displayName: "Google Gemini",
    description: "Interact with Google Gemini Ai Model.",
    icon: "Sparkles",
    role: "action",
    group: "ai",
    properties: [
      {
        displayName: 'API Key',
        name: 'apiKey',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'Enter your Gemini API key'
      },
      {
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        required: true,
        default: 'Hello, how can you help me?',
        placeholder: 'Enter your prompt'
      }
    ],
  },
  {
    type: "http-request",
    displayName: "HTTP Request",
    description: "Make HTTP requests to external APIs",
    icon: "Globe",
    role: "action",
    group: "action",
    properties: [
      {
        displayName: 'Method',
        name: 'method',
        type: 'options',
        required: true,
        default: 'GET',
        options: [
          {name: 'GET', value: 'GET'},
          {name: 'POST', value: 'POST'},
          {name: 'PUT', value: 'PUT'},
          {name: 'DELETE', value: 'DELETE'},
          {name: 'PATCH', value: 'PATCH'}
        ]
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        required: true,
        default: 'https://api.example.com/data',
        placeholder: 'Enter the API URL'
      },
      {
        displayName: 'Request Body',
        name: 'body',
        type: 'string',
        required: false,
        default: '',
        placeholder: 'JSON request body (optional)'
      },
      {
        displayName: 'Timeout (ms)',
        name: 'timeout',
        type: 'number',
        required: false,
        default: 10000,
        placeholder: 'Request timeout in milliseconds'
      },
      {
        displayName: 'Authentication',
        name: 'credentialId',
        type: 'credential',
        required: false,
        credentialTypes: ['HTTP_BASIC_AUTH', 'API_KEY', 'OAUTH2', 'CUSTOM'],
      }
    ],
  },
  {
    type: "data-transform",
    displayName: "Data Transform",
    description: "Transform and manipulate data fields",
    icon: "Shuffle",
    role: "action",
    group: "data",
    properties: [
      {
        displayName: 'Transformations',
        name: 'transformations',
        type: 'string',
        required: true,
        default: '[{"type":"set","field":"newField","value":"{{trigger.output.someValue}}"}]',
        placeholder: 'JSON array of transformations'
      }
    ],
  },
  {
    type: "delay",
    displayName: "Delay",
    description: "Add a delay before continuing execution",
    icon: "Clock",
    role: "action",
    group: "flow",
    properties: [
      {
        displayName: 'Delay Amount',
        name: 'delay',
        type: 'number',
        required: true,
        default: 1,
        placeholder: 'Enter delay amount'
      },
      {
        displayName: 'Unit',
        name: 'unit',
        type: 'options',
        required: true,
        default: 'seconds',
        options: [
          {name: 'Milliseconds', value: 'milliseconds'},
          {name: 'Seconds', value: 'seconds'},
          {name: 'Minutes', value: 'minutes'},
          {name: 'Hours', value: 'hours'}
        ]
      }
    ],
  },
  {
    type: "email",
    displayName: "Send Email",
    description: "Send emails via SMTP",
    icon: "Mail",
    role: "action",
    group: "action",
    properties: [
      {
        displayName: 'Email credentials',
        name: 'credentialId',
        type: 'credential',
        required: true,
        credentialTypes: ['RESEND_EMAIL'],
      },
      {
        displayName: 'To',
        name: 'to',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'recipient@example.com'
      },
      {
        displayName: 'Subject',
        name: 'subject',
        type: 'string',
        required: true,
        default: 'Workflow Notification',
        placeholder: 'Email subject'
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        required: true,
        default: 'Hello from your workflow!\n\nData: {{$json}}',
        placeholder: 'Email body content'
      }
    ],
  },
  {
    type: "ai-agent",
    displayName: "AI Agent",
    description: "Intelligent AI agent that can reason, use tools, and execute complex tasks",
    icon: "🤖",
    role: "action",
    group: "ai",
    properties: [
      {
        displayName: "Credentials",
        name: "credentialId",
        type: "credential",
        required: false,
        credentialTypes: ['GEMINI_API', 'OPENAI_API']
      },
      {
        displayName: "Provider",
        name: "provider",
        type: "options",
        required: true,
        default: "openai",
        options: [
          { name: "OpenAI", value: "openai" },
          { name: "Google Gemini", value: "gemini" }
        ]
      },
      {
        displayName: "Model",
        name: "model",
        type: "string",
        required: false,
        placeholder: "gpt-4, gpt-3.5-turbo, gemini-pro"
      },
      {
        displayName: "Temperature",
        name: "temperature",
        type: "number",
        required: false,
        default: 0.7,
        placeholder: "0.0 - 1.0"
      },
      {
        displayName: "Max Tokens",
        name: "maxTokens",
        type: "number",
        required: false,
        default: 2000,
        placeholder: "Maximum tokens to generate"
      },
      {
        displayName: "System Prompt",
        name: "systemPrompt",
        type: "string",
        required: false,
        placeholder: "Custom system prompt for the AI agent"
      },
      {
        displayName: "Task",
        name: "task",
        type: "string",
        required: false,
        placeholder: "Specific task for the AI agent to execute"
      },
      {
        displayName: "Analyze Data",
        name: "analyzeData",
        type: "boolean",
        required: false,
        default: false
      },
      {
        displayName: "Generate Report",
        name: "generateReport",
        type: "boolean",
        required: false,
        default: false
      },
      {
        displayName: "Report Type",
        name: "reportType",
        type: "options",
        required: false,
        default: "summary",
        options: [
          { name: "Summary", value: "summary" },
          { name: "Detailed", value: "detailed" },
          { name: "Executive", value: "executive" },
          { name: "Technical", value: "technical" }
        ]
      },
      {
        displayName: "Use Tools",
        name: "useTools",
        type: "boolean",
        required: false,
        default: true
      }
    ]
  },
  {
    type: "workflow-agent",
    displayName: "Workflow Agent",
    description: "Advanced AI agent for workflow orchestration, optimization, and intelligent automation",
    icon: "🧠",
    role: "action",
    group: "ai",
    properties: [
      {
        displayName: "Provider",
        name: "provider",
        type: "options",
        required: true,
        default: "openai",
        options: [
          { name: "OpenAI", value: "openai" },
          { name: "Google Gemini", value: "gemini" }
        ]
      },
      {
        displayName: "Model",
        name: "model",
        type: "string",
        required: false,
        placeholder: "gpt-4, gpt-3.5-turbo, gemini-pro"
      },
      {
        displayName: "Mode",
        name: "mode",
        type: "options",
        required: true,
        default: "orchestrate",
        options: [
          { name: "Orchestrate", value: "orchestrate" },
          { name: "Optimize", value: "optimize" },
          { name: "Predict", value: "predict" },
          { name: "Learn", value: "learn" }
        ]
      },
      {
        displayName: "Temperature",
        name: "temperature",
        type: "number",
        required: false,
        default: 0.7,
        placeholder: "0.0 - 1.0"
      },
      {
        displayName: "Max Tokens",
        name: "maxTokens",
        type: "number",
        required: false,
        default: 2000,
        placeholder: "Maximum tokens to generate"
      },
      {
        displayName: "System Prompt",
        name: "systemPrompt",
        type: "string",
        required: false,
        placeholder: "Custom system prompt for the workflow agent"
      },
      {
        displayName: "Enable Memory",
        name: "enableMemory",
        type: "boolean",
        required: false,
        default: true
      },
      {
        displayName: "Enable Learning",
        name: "enableLearning",
        type: "boolean",
        required: false,
        default: true
      },
      {
        displayName: "Auto Optimization",
        name: "enableAutoOptimization",
        type: "boolean",
        required: false,
        default: false
      }
    ]
  }
];

export const getNodeDefinition = (type: string) => {
  const definition = NODES_REGISTRY.find((n) => n.type === type);
  return definition;
};
