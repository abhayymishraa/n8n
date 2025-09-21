"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.ts
var client_exports = {};
__export(client_exports, {
  $Enums: () => enums_exports,
  CredentialType: () => CredentialType,
  ExecutionMode: () => ExecutionMode,
  ExecutionStatus: () => ExecutionStatus,
  LogLevel: () => LogLevel,
  Prisma: () => prismaNamespace_exports,
  PrismaClient: () => PrismaClient,
  TriggerType: () => TriggerType,
  prisma: () => prisma
});
module.exports = __toCommonJS(client_exports);

// generated/client/client.ts
var process2 = __toESM(require("process"));
var path = __toESM(require("path"));
var import_node_url = require("url");

// generated/client/internal/class.ts
var runtime = __toESM(require("@prisma/client/runtime/library"));
var config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client"
    },
    "output": {
      "value": "/home/abhaymishra/Desktop/super30/n8n-agentic/packages/database/generated/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/home/abhaymishra/Desktop/super30/n8n-agentic/packages/database/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativePath": "../../prisma",
  "clientVersion": "6.16.2",
  "engineVersion": "1c57fdcd7e44b29b9313256c76699e91c3ac3c43",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/client"\n}\n\nmodel User {\n  id          String        @id @default(uuid())\n  email       String?       @unique\n  password    String?\n  createdAt   DateTime      @default(now())\n  credentials Credentials[]\n  workflows   Workflow[]\n}\n\nmodel Credentials {\n  id            String                 @id @default(uuid())\n  name          String\n  type          CredentialType\n  data          Json\n  userId        String\n  createdAt     DateTime               @default(now())\n  updatedAt     DateTime               @updatedAt\n  user          User                   @relation(fields: [userId], references: [id], onDelete: Cascade)\n  nodeInstances WorkflowNodeInstance[]\n}\n\nenum CredentialType {\n  TELEGRAM_BOT\n  GEMINI_API\n  RESEND_EMAIL\n  OPENAI_API\n  WEBHOOK_URL\n  HTTP_BASIC_AUTH\n  API_KEY\n  OAUTH2\n  CUSTOM\n}\n\nmodel Workflow {\n  id             String                 @id @default(uuid())\n  name           String\n  active         Boolean                @default(false)\n  userId         String\n  createdAt      DateTime               @default(now())\n  updatedAt      DateTime               @updatedAt\n  triggersActive Boolean                @default(false)\n  user           User                   @relation(fields: [userId], references: [id], onDelete: Cascade)\n  versions       WorkflowVersion[]\n  executions     Execution[]\n  triggers       WorkflowTrigger[]\n  nodeInstances  WorkflowNodeInstance[]\n}\n\nmodel WorkflowNodeInstance {\n  id            String       @id @default(uuid())\n  workflowId    String\n  nodeId        String\n  nodeType      String\n  configuration Json         @default("{}")\n  credentialId  String?\n  credential    Credentials? @relation(fields: [credentialId], references: [id], onDelete: SetNull)\n\n  workflow         Workflow          @relation(fields: [workflowId], references: [id], onDelete: Cascade)\n  executionResults ExecutionResult[]\n\n  @@unique([workflowId, nodeId])\n  @@map("workflow_node_instances")\n}\n\nmodel WorkflowTrigger {\n  id            String      @id @default(uuid())\n  workflowId    String\n  nodeId        String\n  triggerType   TriggerType\n  configuration Json        @default("{}")\n  isActive      Boolean     @default(true)\n  createdAt     DateTime    @default(now())\n  workflow      Workflow    @relation(fields: [workflowId], references: [id], onDelete: Cascade)\n  executions    Execution[]\n\n  @@unique([workflowId, nodeId])\n  @@map("workflow_triggers")\n}\n\nenum TriggerType {\n  MANUAL\n  WEBHOOK\n  SCHEDULE\n}\n\nmodel Execution {\n  id                String          @id @default(uuid())\n  workflowId        String\n  workflowVersionId String\n  mode              ExecutionMode\n  status            ExecutionStatus @default(QUEUED)\n\n  executionState Json?\n  resumeNode     String?\n\n  startedAt  DateTime?\n  finishedAt DateTime?\n  triggerId  String?\n\n  workflow         Workflow          @relation(fields: [workflowId], references: [id], onDelete: Cascade)\n  trigger          WorkflowTrigger?  @relation(fields: [triggerId], references: [id], onDelete: SetNull)\n  executionResults ExecutionResult[]\n  logs             ExecutionLog[]\n}\n\nmodel ExecutionResult {\n  id             String          @id @default(uuid())\n  executionId    String\n  nodeInstanceId String\n  inputData      Json?\n  outputData     Json?\n  errorMessage   String?\n  status         ExecutionStatus\n  startTime      DateTime?\n  executionTime  Int?\n\n  execution    Execution            @relation(fields: [executionId], references: [id], onDelete: Cascade)\n  nodeInstance WorkflowNodeInstance @relation(fields: [nodeInstanceId], references: [id], onDelete: Cascade)\n}\n\nmodel ExecutionLog {\n  id          String   @id @default(uuid())\n  executionId String\n  nodeId      String?\n  level       LogLevel\n  message     String\n  timestamp   DateTime @default(now())\n\n  execution Execution @relation(fields: [executionId], references: [id], onDelete: Cascade)\n\n  @@map("execution_logs")\n}\n\nenum ExecutionMode {\n  MANUAL\n  WEBHOOK\n  SCHEDULE\n}\n\nenum ExecutionStatus {\n  QUEUED\n  RUNNING\n  WAITING\n  COMPLETED\n  FAILED\n  CANCELLED\n}\n\nenum LogLevel {\n  DEBUG\n  INFO\n  WARN\n  ERROR\n}\n\nmodel WorkflowVersion {\n  id          String   @id @default(uuid())\n  workflowId  String\n  version     Int\n  changelog   String?\n  createdAt   DateTime @default(now())\n  node        Json\n  connections Json\n\n  workflow Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)\n\n  @@unique([workflowId, version])\n  @@map("workflow_versions")\n}\n',
  "inlineSchemaHash": "9c8c8cb82ef1e85d16ea84fc0141a1a5220868b3558aabd190ad9cde9a912e8d",
  "copyEngine": true,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "dirname": ""
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":false,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"password","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"credentials","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Credentials","nativeType":null,"relationName":"CredentialsToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"workflows","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Workflow","nativeType":null,"relationName":"UserToWorkflow","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Credentials":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"CredentialType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"data","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"CredentialsToUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"nodeInstances","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"WorkflowNodeInstance","nativeType":null,"relationName":"CredentialsToWorkflowNodeInstance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Workflow":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"active","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"triggersActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"UserToWorkflow","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"versions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"WorkflowVersion","nativeType":null,"relationName":"WorkflowToWorkflowVersion","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"executions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Execution","nativeType":null,"relationName":"ExecutionToWorkflow","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"triggers","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"WorkflowTrigger","nativeType":null,"relationName":"WorkflowToWorkflowTrigger","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"nodeInstances","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"WorkflowNodeInstance","nativeType":null,"relationName":"WorkflowToWorkflowNodeInstance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"WorkflowNodeInstance":{"dbName":"workflow_node_instances","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"workflowId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"nodeId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"nodeType","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"configuration","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","nativeType":null,"default":"{}","isGenerated":false,"isUpdatedAt":false},{"name":"credentialId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"credential","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Credentials","nativeType":null,"relationName":"CredentialsToWorkflowNodeInstance","relationFromFields":["credentialId"],"relationToFields":["id"],"relationOnDelete":"SetNull","isGenerated":false,"isUpdatedAt":false},{"name":"workflow","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Workflow","nativeType":null,"relationName":"WorkflowToWorkflowNodeInstance","relationFromFields":["workflowId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"executionResults","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExecutionResult","nativeType":null,"relationName":"ExecutionResultToWorkflowNodeInstance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["workflowId","nodeId"]],"uniqueIndexes":[{"name":null,"fields":["workflowId","nodeId"]}],"isGenerated":false},"WorkflowTrigger":{"dbName":"workflow_triggers","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"workflowId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"nodeId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"triggerType","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TriggerType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"configuration","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","nativeType":null,"default":"{}","isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"workflow","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Workflow","nativeType":null,"relationName":"WorkflowToWorkflowTrigger","relationFromFields":["workflowId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"executions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Execution","nativeType":null,"relationName":"ExecutionToWorkflowTrigger","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["workflowId","nodeId"]],"uniqueIndexes":[{"name":null,"fields":["workflowId","nodeId"]}],"isGenerated":false},"Execution":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"workflowId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"workflowVersionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"mode","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExecutionMode","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"ExecutionStatus","nativeType":null,"default":"QUEUED","isGenerated":false,"isUpdatedAt":false},{"name":"executionState","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"resumeNode","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"startedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"finishedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"triggerId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"workflow","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Workflow","nativeType":null,"relationName":"ExecutionToWorkflow","relationFromFields":["workflowId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"trigger","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"WorkflowTrigger","nativeType":null,"relationName":"ExecutionToWorkflowTrigger","relationFromFields":["triggerId"],"relationToFields":["id"],"relationOnDelete":"SetNull","isGenerated":false,"isUpdatedAt":false},{"name":"executionResults","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExecutionResult","nativeType":null,"relationName":"ExecutionToExecutionResult","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"logs","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExecutionLog","nativeType":null,"relationName":"ExecutionToExecutionLog","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ExecutionResult":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"executionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"nodeInstanceId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"inputData","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"outputData","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"errorMessage","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExecutionStatus","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"startTime","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"executionTime","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"execution","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Execution","nativeType":null,"relationName":"ExecutionToExecutionResult","relationFromFields":["executionId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"nodeInstance","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"WorkflowNodeInstance","nativeType":null,"relationName":"ExecutionResultToWorkflowNodeInstance","relationFromFields":["nodeInstanceId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ExecutionLog":{"dbName":"execution_logs","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"executionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"nodeId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"level","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"LogLevel","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"message","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"timestamp","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"execution","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Execution","nativeType":null,"relationName":"ExecutionToExecutionLog","relationFromFields":["executionId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"WorkflowVersion":{"dbName":"workflow_versions","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"workflowId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"version","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"changelog","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"node","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"connections","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"workflow","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Workflow","nativeType":null,"relationName":"WorkflowToWorkflowVersion","relationFromFields":["workflowId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["workflowId","version"]],"uniqueIndexes":[{"name":null,"fields":["workflowId","version"]}],"isGenerated":false}},"enums":{"CredentialType":{"values":[{"name":"TELEGRAM_BOT","dbName":null},{"name":"GEMINI_API","dbName":null},{"name":"RESEND_EMAIL","dbName":null},{"name":"OPENAI_API","dbName":null},{"name":"WEBHOOK_URL","dbName":null},{"name":"HTTP_BASIC_AUTH","dbName":null},{"name":"API_KEY","dbName":null},{"name":"OAUTH2","dbName":null},{"name":"CUSTOM","dbName":null}],"dbName":null},"TriggerType":{"values":[{"name":"MANUAL","dbName":null},{"name":"WEBHOOK","dbName":null},{"name":"SCHEDULE","dbName":null}],"dbName":null},"ExecutionMode":{"values":[{"name":"MANUAL","dbName":null},{"name":"WEBHOOK","dbName":null},{"name":"SCHEDULE","dbName":null}],"dbName":null},"ExecutionStatus":{"values":[{"name":"QUEUED","dbName":null},{"name":"RUNNING","dbName":null},{"name":"WAITING","dbName":null},{"name":"COMPLETED","dbName":null},{"name":"FAILED","dbName":null},{"name":"CANCELLED","dbName":null}],"dbName":null},"LogLevel":{"values":[{"name":"DEBUG","dbName":null},{"name":"INFO","dbName":null},{"name":"WARN","dbName":null},{"name":"ERROR","dbName":null}],"dbName":null}},"types":{}}');
config.engineWasm = void 0;
config.compilerWasm = void 0;
function getPrismaClientClass(dirname2) {
  config.dirname = dirname2;
  return runtime.getPrismaClient(config);
}

// generated/client/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull,
  CredentialsScalarFieldEnum: () => CredentialsScalarFieldEnum,
  DbNull: () => DbNull,
  Decimal: () => Decimal2,
  ExecutionLogScalarFieldEnum: () => ExecutionLogScalarFieldEnum,
  ExecutionResultScalarFieldEnum: () => ExecutionResultScalarFieldEnum,
  ExecutionScalarFieldEnum: () => ExecutionScalarFieldEnum,
  JsonNull: () => JsonNull,
  JsonNullValueFilter: () => JsonNullValueFilter,
  JsonNullValueInput: () => JsonNullValueInput,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  WorkflowNodeInstanceScalarFieldEnum: () => WorkflowNodeInstanceScalarFieldEnum,
  WorkflowScalarFieldEnum: () => WorkflowScalarFieldEnum,
  WorkflowTriggerScalarFieldEnum: () => WorkflowTriggerScalarFieldEnum,
  WorkflowVersionScalarFieldEnum: () => WorkflowVersionScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
var runtime2 = __toESM(require("@prisma/client/runtime/library"));
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "6.16.2",
  engine: "1c57fdcd7e44b29b9313256c76699e91c3ac3c43"
};
var NullTypes = {
  DbNull: runtime2.objectEnumValues.classes.DbNull,
  JsonNull: runtime2.objectEnumValues.classes.JsonNull,
  AnyNull: runtime2.objectEnumValues.classes.AnyNull
};
var DbNull = runtime2.objectEnumValues.instances.DbNull;
var JsonNull = runtime2.objectEnumValues.instances.JsonNull;
var AnyNull = runtime2.objectEnumValues.instances.AnyNull;
var ModelName = {
  User: "User",
  Credentials: "Credentials",
  Workflow: "Workflow",
  WorkflowNodeInstance: "WorkflowNodeInstance",
  WorkflowTrigger: "WorkflowTrigger",
  Execution: "Execution",
  ExecutionResult: "ExecutionResult",
  ExecutionLog: "ExecutionLog",
  WorkflowVersion: "WorkflowVersion"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  email: "email",
  password: "password",
  createdAt: "createdAt"
};
var CredentialsScalarFieldEnum = {
  id: "id",
  name: "name",
  type: "type",
  data: "data",
  userId: "userId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var WorkflowScalarFieldEnum = {
  id: "id",
  name: "name",
  active: "active",
  userId: "userId",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  triggersActive: "triggersActive"
};
var WorkflowNodeInstanceScalarFieldEnum = {
  id: "id",
  workflowId: "workflowId",
  nodeId: "nodeId",
  nodeType: "nodeType",
  configuration: "configuration",
  credentialId: "credentialId"
};
var WorkflowTriggerScalarFieldEnum = {
  id: "id",
  workflowId: "workflowId",
  nodeId: "nodeId",
  triggerType: "triggerType",
  configuration: "configuration",
  isActive: "isActive",
  createdAt: "createdAt"
};
var ExecutionScalarFieldEnum = {
  id: "id",
  workflowId: "workflowId",
  workflowVersionId: "workflowVersionId",
  mode: "mode",
  status: "status",
  executionState: "executionState",
  resumeNode: "resumeNode",
  startedAt: "startedAt",
  finishedAt: "finishedAt",
  triggerId: "triggerId"
};
var ExecutionResultScalarFieldEnum = {
  id: "id",
  executionId: "executionId",
  nodeInstanceId: "nodeInstanceId",
  inputData: "inputData",
  outputData: "outputData",
  errorMessage: "errorMessage",
  status: "status",
  startTime: "startTime",
  executionTime: "executionTime"
};
var ExecutionLogScalarFieldEnum = {
  id: "id",
  executionId: "executionId",
  nodeId: "nodeId",
  level: "level",
  message: "message",
  timestamp: "timestamp"
};
var WorkflowVersionScalarFieldEnum = {
  id: "id",
  workflowId: "workflowId",
  version: "version",
  changelog: "changelog",
  createdAt: "createdAt",
  node: "node",
  connections: "connections"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var JsonNullValueInput = {
  JsonNull
};
var NullableJsonNullValueInput = {
  DbNull,
  JsonNull
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull,
  JsonNull,
  AnyNull
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/client/enums.ts
var enums_exports = {};
__export(enums_exports, {
  CredentialType: () => CredentialType,
  ExecutionMode: () => ExecutionMode,
  ExecutionStatus: () => ExecutionStatus,
  LogLevel: () => LogLevel,
  TriggerType: () => TriggerType
});
var CredentialType = {
  TELEGRAM_BOT: "TELEGRAM_BOT",
  GEMINI_API: "GEMINI_API",
  RESEND_EMAIL: "RESEND_EMAIL",
  OPENAI_API: "OPENAI_API",
  WEBHOOK_URL: "WEBHOOK_URL",
  HTTP_BASIC_AUTH: "HTTP_BASIC_AUTH",
  API_KEY: "API_KEY",
  OAUTH2: "OAUTH2",
  CUSTOM: "CUSTOM"
};
var TriggerType = {
  MANUAL: "MANUAL",
  WEBHOOK: "WEBHOOK",
  SCHEDULE: "SCHEDULE"
};
var ExecutionMode = {
  MANUAL: "MANUAL",
  WEBHOOK: "WEBHOOK",
  SCHEDULE: "SCHEDULE"
};
var ExecutionStatus = {
  QUEUED: "QUEUED",
  RUNNING: "RUNNING",
  WAITING: "WAITING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED"
};
var LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR"
};

// generated/client/client.ts
var import_meta = {};
globalThis["__dirname"] = path.dirname((0, import_node_url.fileURLToPath)(import_meta.url));
var PrismaClient = getPrismaClientClass(__dirname);
path.join(__dirname, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(process2.cwd(), "generated/client/libquery_engine-debian-openssl-3.0.x.so.node");

// src/client.ts
var globalForPrisma = global;
var prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $Enums,
  CredentialType,
  ExecutionMode,
  ExecutionStatus,
  LogLevel,
  Prisma,
  PrismaClient,
  TriggerType,
  prisma
});
