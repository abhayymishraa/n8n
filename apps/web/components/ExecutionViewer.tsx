'use client';

import { useMemo, useState } from 'react';
import { trpc } from '../utils/trpc';

interface ExecutionViewerProps {
  workflowId: string;
}

export default function ExecutionViewer({ workflowId }: ExecutionViewerProps) {
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  
  const { data: executions, isLoading, refetch } = trpc.workflow.getExecutions.useQuery(
    { workflowId, limit: 10 },
    { refetchInterval: 2000 }
  );

  const { data: executionDetails } = trpc.workflow.getExecutionDetails.useQuery(
    { executionId: selectedExecutionId! },
    { enabled: !!selectedExecutionId }
  );

  const nodeIdToLabel = useMemo(() => {
    const map = new Map<string, string>();
    const versionNodes = (executionDetails as any)?.workflowVersion?.node as any[] | undefined;
    if (Array.isArray(versionNodes)) {
      for (const n of versionNodes) {
        if (n?.id) {
          const label = n?.data?.label || n?.data?.name || n?.type || n?.id;
          map.set(n.id, label);
        }
      }
    }
    return map;
  }, [executionDetails]);


  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col text-foreground">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primary tracking-tight">Executions</h2>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 text-sm rounded-theme text-primary border border-border hover:border-primary/60 hover:text-primary hover:bg-[rgba(203,166,247,0.12)] transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0 mt-6">
        {/* Executions List */}
        <div className="flex flex-col  min-h-0">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Recent Executions</h3>
          <div className="flex-1 overflow-auto space-y-2">
            {executions?.map((execution: any) => (
              <div
                key={execution.id}
                className={`p-4 rounded-theme cursor-pointer transition-colors bg-[var(--card)] border ${
                  selectedExecutionId === execution.id
                    ? 'border-primary shadow shadow-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedExecutionId(execution.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border border-border text-primary`}>
                        {execution.status}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {execution.mode}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Started: {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'Not started'}
                    </div>
                    {execution.finishedAt && (
                      <div className="text-xs text-[var(--muted-foreground)]">
                        Finished: {new Date(execution.finishedAt).toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      {execution.executionResults.length} nodes • {execution.logs.length} logs
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(!executions || executions.length === 0) && (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                No executions found. Run your workflow to see results here.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col min-h-0 col-span-4">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Execution Details</h3>
          
          {selectedExecutionId && executionDetails ? (
            <div className="flex-1 overflow-auto space-y-4">
              <div className="p-4 rounded-theme bg-[var(--card)] border border-border">
                <h4 className="font-medium text-primary mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
                  <div>
                    <span>Workflow:</span>
                    <span className="ml-2 font-medium text-primary">{executionDetails.workflow.name}</span>
                  </div>
                  <div>
                    <span>Status:</span>
                    <span className={`ml-2 px-2 py-0.5 text-[10px] font-medium rounded-md border border-border text-primary`}>{executionDetails.status}</span>
                  </div>
                  <div>
                    <span>Mode:</span>
                    <span className="ml-2 text-primary">{executionDetails.mode}</span>
                  </div>
                  <div>
                    <span>Duration:</span>
                    <span className="ml-2 text-primary">
                      {executionDetails.startedAt && executionDetails.finishedAt
                        ? `${Math.round((new Date(executionDetails.finishedAt).getTime() - new Date(executionDetails.startedAt).getTime()) / 1000)}s`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-theme bg-[var(--card)] border border-border">
                <div className="p-4 border-b border-border">
                  <h4 className="font-medium text-primary">Node Execution Results</h4>
                </div>
                <div>
                  {executionDetails.executionResults.map((result: any, index: number) => (
                    <div key={result.id} className="p-4 border-b last:border-b-0 border-border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-primary">
                            {nodeIdToLabel.get(result.nodeInstance.nodeId) || result.nodeInstance.nodeType}
                          </span>
                          <span className="ml-2 text-xs text-[var(--muted-foreground)]">({result.nodeInstance.nodeType})</span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border border-border text-primary`}>{result.status}</span>
                          {result.executionTime && (
                            <div className="text-xs text-[var(--muted-foreground)] mt-1">
                              {result.executionTime}ms
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {result.outputData && (
                        <details className="mt-2">
                          <summary className="text-xs text-[var(--muted-foreground)] cursor-pointer hover:text-primary">
                            View Output Data
                          </summary>
                          <pre className="mt-2 text-[11px] bg-[var(--background)] text-wrap text-[#d1d5db] p-2 rounded-theme overflow-x-auto border border-border">
                            {JSON.stringify(result.outputData, null, 2)}
                          </pre>
                        </details>
                      )}

                      {result.errorMessage && (
                        <div className="mt-2 p-2 rounded-theme border border-red-900/40 bg-[rgba(239,68,68,0.12)]">
                          <span className="text-xs text-red-300 font-medium">Error: </span>
                          <span className="text-xs text-red-300">{result.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Logs */}
              <div className="rounded-theme bg-[var(--card)] border border-border">
                <div className="p-4 border-b border-border">
                  <h4 className="font-medium text-primary">Execution Logs</h4>
                </div>
                <div>
                  {executionDetails.logs.map((log: any) => (
                    <div key={log.id} className="p-3 border-b last:border-b-0 font-mono text-xs border-border">
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-theme border border-border text-primary`}>
                          {log.level}
                        </span>
                        <span className="flex-1 text-foreground">{log.message}</span>
                      </div>
                      {log.nodeId && (
                        <div className="ml-20 text-[10px] text-[var(--muted-foreground)] mt-1">
                          Node: <span className="text-primary">{nodeIdToLabel.get(log.nodeId) || log.nodeId}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              Select an execution to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
