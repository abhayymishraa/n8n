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
  type: "string" | "number" | "boolean" | "options" | "notice";
  required?: boolean;
  default?: any;
  placeholder?: string;
  options?: Array<{ name: string; value: string }>;
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
        name: 'crendentialId',
        type: 'options',
        required: true,
        options: [],
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
];

export const getNodeDefinition = (type: string) => {
  const definition = NODES_REGISTRY.find((n) => n.type === type);
  return definition;
};
