import { Queue } from "bullmq";

const connection = {
  host: "localhost",
  port: 6379,
};

export const Workfolow_queue_name = "workflow-execution";

export const workflowQueue = new Queue(Workfolow_queue_name, { connection });
