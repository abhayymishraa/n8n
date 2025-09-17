interface Node {
  // eslint-disable-next-line no-unused-vars
  execute: (input: any, context: NodeExecutionContext) => Promise<any>;
}

export interface NodeExecutionContext {
  workflowId: string;
  executionId: string;
  nodeId: string;
}

const LogNode: Node = {
  execute: async (input: any) => {
    console.log("--LOG Node ---");
    console.log(JSON.stringify(input, null, 2));
    console.log("---LOG Node End---");
    return input;
  },
};

const AddNode: Node = {
  execute: async (inputData: { num1: number; num2: number }) => {
    const result = inputData.num1 + inputData.num2;
    return { sum: result };
  },
};

const nodeRegistry: Record<string, Node> = {
  log: LogNode,
  add: AddNode,
};

export const getImplementation = (type: string): Node => {
  return nodeRegistry[type];
};
