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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      case 'RUNNING':
        return 'text-blue-600 bg-blue-100';
      case 'QUEUED':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600';
      case 'WARN':
        return 'text-yellow-600';
      case 'INFO':
        return 'text-blue-600';
      case 'DEBUG':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

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
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#4de8e8] tracking-tight">Executions</h2>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 text-sm rounded-lg text-[#4de8e8] border border-[rgba(22,73,85,0.5)] hover:border-[#4de8e8]/60 hover:text-[#4de8e8] hover:bg-[rgba(77,232,232,0.12)] transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 mt-6">
        {/* Executions List */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-sm font-medium text-[#36a5a5]">Recent Executions</h3>
          <div className="flex-1 overflow-auto space-y-2">
            {executions?.map((execution: any) => (
              <div
                key={execution.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors bg-[rgba(12,32,37,0.8)] border ${
                  selectedExecutionId === execution.id
                    ? 'border-[#4de8e8] shadow shadow-[#4de8e8]/20'
                    : 'border-[rgba(22,73,85,0.5)] hover:border-[#4de8e8]/50'
                }`}
                onClick={() => setSelectedExecutionId(execution.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border border-[rgba(22,73,85,0.5)] text-[#4de8e8]`}>
                        {execution.status}
                      </span>
                      <span className="text-xs text-[#36a5a5]">
                        {execution.mode}
                      </span>
                    </div>
                    <div className="text-xs text-[#36a5a5]">
                      Started: {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'Not started'}
                    </div>
                    {execution.finishedAt && (
                      <div className="text-xs text-[#36a5a5]">
                        Finished: {new Date(execution.finishedAt).toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-[#36a5a5] mt-1">
                      {execution.executionResults.length} nodes • {execution.logs.length} logs
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(!executions || executions.length === 0) && (
              <div className="text-center py-8 text-[#36a5a5]">
                No executions found. Run your workflow to see results here.
              </div>
            )}
          </div>
        </div>

        {/* Execution Details */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-sm font-medium text-[#36a5a5]">Execution Details</h3>
          
          {selectedExecutionId && executionDetails ? (
            <div className="flex-1 overflow-auto space-y-4">
              {/* Basic Info */}
              <div className="p-4 rounded-lg bg-[rgba(12,32,37,0.8)] border border-[rgba(22,73,85,0.5)]">
                <h4 className="font-medium text-[#4de8e8] mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#36a5a5]">
                  <div>
                    <span>Workflow:</span>
                    <span className="ml-2 font-medium text-[#4de8e8]">{executionDetails.workflow.name}</span>
                  </div>
                  <div>
                    <span>Status:</span>
                    <span className={`ml-2 px-2 py-0.5 text-[10px] font-medium rounded-md border border-[rgba(22,73,85,0.5)] text-[#4de8e8]`}>{executionDetails.status}</span>
                  </div>
                  <div>
                    <span>Mode:</span>
                    <span className="ml-2 text-[#4de8e8]">{executionDetails.mode}</span>
                  </div>
                  <div>
                    <span>Duration:</span>
                    <span className="ml-2 text-[#4de8e8]">
                      {executionDetails.startedAt && executionDetails.finishedAt
                        ? `${Math.round((new Date(executionDetails.finishedAt).getTime() - new Date(executionDetails.startedAt).getTime()) / 1000)}s`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Node Results */}
              <div className="rounded-lg bg-[rgba(12,32,37,0.8)] border border-[rgba(22,73,85,0.5)]">
                <div className="p-4 border-b border-[rgba(22,73,85,0.5)]">
                  <h4 className="font-medium text-[#4de8e8]">Node Execution Results</h4>
                </div>
                <div>
                  {executionDetails.executionResults.map((result: any, index: number) => (
                    <div key={result.id} className="p-4 border-b last:border-b-0 border-[rgba(22,73,85,0.5)]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-[#4de8e8]">
                            {nodeIdToLabel.get(result.nodeInstance.nodeId) || result.nodeInstance.nodeType}
                          </span>
                          <span className="ml-2 text-xs text-[#36a5a5]">({result.nodeInstance.nodeType})</span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border border-[rgba(22,73,85,0.5)] text-[#4de8e8]`}>{result.status}</span>
                          {result.executionTime && (
                            <div className="text-xs text-[#36a5a5] mt-1">
                              {result.executionTime}ms
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {result.outputData && (
                        <details className="mt-2">
                          <summary className="text-xs text-[#36a5a5] cursor-pointer hover:text-[#4de8e8]">
                            View Output Data
                          </summary>
                          <pre className="mt-2 text-[11px] bg-[#0a1a20] text-[#d1d5db] p-2 rounded overflow-x-auto border border-[rgba(22,73,85,0.5)]">
                            {JSON.stringify(result.outputData, null, 2)}
                          </pre>
                        </details>
                      )}

                      {result.errorMessage && (
                        <div className="mt-2 p-2 rounded border border-red-900/40 bg-[rgba(239,68,68,0.12)]">
                          <span className="text-xs text-red-300 font-medium">Error: </span>
                          <span className="text-xs text-red-300">{result.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Logs */}
              <div className="rounded-lg bg-[rgba(12,32,37,0.8)] border border-[rgba(22,73,85,0.5)]">
                <div className="p-4 border-b border-[rgba(22,73,85,0.5)]">
                  <h4 className="font-medium text-[#4de8e8]">Execution Logs</h4>
                </div>
                <div>
                  {executionDetails.logs.map((log: any, index: number) => (
                    <div key={log.id} className="p-3 border-b last:border-b-0 font-mono text-xs border-[rgba(22,73,85,0.5)]">
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] text-[#36a5a5] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-[rgba(22,73,85,0.5)] text-[#4de8e8]`}>
                          {log.level}
                        </span>
                        <span className="flex-1 text-[#e5e7eb]">{log.message}</span>
                      </div>
                      {log.nodeId && (
                        <div className="ml-20 text-[10px] text-[#36a5a5] mt-1">
                          Node: <span className="text-[#4de8e8]">{nodeIdToLabel.get(log.nodeId) || log.nodeId}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#36a5a5]">
              Select an execution to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
