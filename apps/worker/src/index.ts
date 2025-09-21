import { Worker } from "bullmq";
import { WorkflowRunnerService } from "./services/WorkflowRunnerService";

console.log("🚀 Worker starting the processing");
console.log("📅 Timestamp:", new Date().toISOString());

const connection = {
  host: "localhost",
  port: 6379,
};

console.log("🔗 Connecting to Redis at:", connection);

// Test Redis connection first
import { Redis } from "ioredis";
const testRedis = new Redis(connection);
testRedis.on('connect', () => {
  console.log("✅ Redis connection successful");
});
testRedis.on('error', (err) => {
  console.error("❌ Redis connection failed:", err);
});

// Test the connection
testRedis.ping().then(() => {
  console.log("🏓 Redis PING successful");
}).catch((err) => {
  console.error("❌ Redis PING failed:", err);
});

const worker = new Worker(
  "workflow-execution",
  async (job: any) => {
    console.log("🎯 Worker started for job", job.id, job.name);
    console.log("📦 Job data:", JSON.stringify(job.data, null, 2));
    
    const runner = new WorkflowRunnerService();

    // Process all jobs in the workflow-execution queue
    if (job.data.executionId && job.data.workflowVersionId) {
      console.log(`⚡ Processing workflow execution: ${job.data.executionId}`);
      try {
        await runner.executeWorkflow(
          job.data.executionId,
          job.data.workflowVersionId,
          job.data.triggerData
        );
        console.log(`✅ Workflow execution completed: ${job.data.executionId}`);
      } catch (error) {
        console.error(`❌ Workflow execution failed: ${job.data.executionId}`, error);
        throw error;
      }
    } else {
      console.log(`⏭️ Skipping job ${job.id} - missing required data (executionId: ${job.data.executionId}, workflowVersionId: ${job.data.workflowVersionId})`);
    }
  },
  {
    connection,
    concurrency: 1, // Process one job at a time
  }
);

worker.on("completed", (job) => {
  console.log("🎉 Worker completed job", job.id);
});

worker.on("failed", (job, err) => {
  console.error("💥 Job failed:", job?.id, err.message);
  console.error("Full error:", err);
});

worker.on("error", (err) => {
  console.error("🚨 Worker error:", err);
});

worker.on("ready", () => {
  console.log("🟢 Worker is ready and connected to Redis");
});

worker.on("stalled", (jobId) => {
  console.log("⏰ Job stalled:", jobId);
});

worker.on("active", (job) => {
  console.log("🔄 Job became active:", job.id);
});

console.log("🎯 Worker initialized and waiting for jobs...");
