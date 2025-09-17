export interface NodeDefination {
  type: string;
  displayName: string;
  description: string;
  icon: string;
  role: "trigger" | "action" | "both";
  group: "ai" | "action" | "data" | "flow" | "core" | "trigger";
}

export const NODES_REGISTRY: NodeDefination[] = [
  {
    type: "Manual",
    displayName: "Manual Trigger",
    description: "runs the flow when  clicking on a button",
    icon: "MousePointerClick",
    role: "trigger",
    group: "trigger",
  },
  {
    type: "webhook",
    displayName: "Webhook",
    description: "Runs the flow on recieving a http request",
    icon: "Webhook",
    role: "trigger",
    group: "trigger",
  },
  {
    type: "log",
    displayName: "Log Message",
    description: "Logs the data to the console for the debugging",
    icon: "Terminal",
    role: "action",
    group: "core",
  },
  {
    type: "if",
    displayName: "IF",
    description: "Branch the flow on a condition",
    icon: "GitFork",
    role: "action",
    group: "flow",
  },
  {
    type: "google-gemini",
    displayName: "Google Gemini",
    description: "Interact with Google Gemini Ai Model.",
    icon: "Sparkles",
    role: "action",
    group: "ai",
  },
];

export const getNodeDefination = (type: string) => {
  const defination = NODES_REGISTRY.find((n) => n.type === type);
  return defination;
};

