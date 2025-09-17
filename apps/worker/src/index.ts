import { Workfolow_queue_name } from "@repo/queue";
import { WorkflowRunnerService } from "./services/workflowService";
import { Worker } from "bullmq";

console.log("Worker starting the processing");

const connection = {
  host: "localhost",
  port: 6379,
};

const worker = new Worker(
  Workfolow_queue_name,
  async (job: any) => {
    console.log("workder started for job", job.id, job.name);
    const runner = new WorkflowRunnerService();

    if (job.name === "workflow-execute") {
      await runner.executeWorkflow(
        job.data.executionId,
        job.data.workflowVersionId,
        job.data.triggerData
      );
    }
  },
  {
    connection,
  }
);

worker.on("completed", (job) => {
  console.log("worker completed this job with job id", job.id);
});

worker.on("failed", (err) => {
  console.error("something went wrong", err);
});

console.log("worker intialized and waiting for the jobs");
