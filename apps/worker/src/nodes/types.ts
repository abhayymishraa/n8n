import { PrismaClient } from "@repo/database";
import { CredentialService } from "../services/CredentialService";

export interface NodeExecutionContext {
    prisma: PrismaClient,
    workflowId: string,
    executionId: string,
    nodeId: string,
    getNodeConfig:  () => Record<string, any>,
    getCredential:  (credentialId: string) => Promise<{
      id: string;
      name: string;
      type: string;
      data: Record<string, any>;
    } | null>;
    getCredentialService: () => typeof CredentialService;
    fullDataPacket: Record<string, any>  
}

export interface NodeImplementation {
    execute: (input: any, context: NodeExecutionContext) => Promise<any> 
}