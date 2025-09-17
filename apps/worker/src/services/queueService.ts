import { Queue, Worker } from "bullmq";

import { WorkflowRunnerService } from "./workflowService";

const connection = {
  host: "localhost",
  port: 6379,
};

export const WORKFLOW_QUEUE_NAME = "workflow-exexcution";

export const workflowqueue = new Queue(WORKFLOW_QUEUE_NAME, { connection });

export const initializeWorker = () => {
  const worker = new Worker(WORKFLOW_QUEUE_NAME, async (job) => {
    console.log("new job came into the queue", job.id, job.data);

    const runner = new WorkflowRunnerService();
    
  });

};
