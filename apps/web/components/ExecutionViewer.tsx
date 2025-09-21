'use client';

import { useState } from 'react';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Execution History</h2>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executions List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Executions</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {executions?.map((execution: any) => (
              <div
                key={execution.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedExecutionId === execution.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedExecutionId(execution.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {execution.mode}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Started: {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'Not started'}
                    </div>
                    {execution.finishedAt && (
                      <div className="text-sm text-gray-600">
                        Finished: {new Date(execution.finishedAt).toLocaleString()}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      {execution.executionResults.length} nodes • {execution.logs.length} logs
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(!executions || executions.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No executions found. Run your workflow to see results here.
              </div>
            )}
          </div>
        </div>

        {/* Execution Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Execution Details</h3>
          
          {selectedExecutionId && executionDetails ? (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Workflow:</span>
                    <span className="ml-2 font-medium">{executionDetails.workflow.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(executionDetails.status)}`}>
                      {executionDetails.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mode:</span>
                    <span className="ml-2">{executionDetails.mode}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2">
                      {executionDetails.startedAt && executionDetails.finishedAt
                        ? `${Math.round((new Date(executionDetails.finishedAt).getTime() - new Date(executionDetails.startedAt).getTime()) / 1000)}s`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Node Results */}
              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <h4 className="font-medium text-gray-900">Node Execution Results</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {executionDetails.executionResults.map((result: any, index: number) => (
                    <div key={result.id} className="p-4 border-b last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900">
                            {result.nodeInstance.nodeType}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            ({result.nodeInstance.nodeId})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                          {result.executionTime && (
                            <div className="text-sm text-gray-500 mt-1">
                              {result.executionTime}ms
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {result.outputData && (
                        <details className="mt-2">
                          <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                            View Output Data
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.outputData, null, 2)}
                          </pre>
                        </details>
                      )}

                      {result.errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <span className="text-sm text-red-600 font-medium">Error: </span>
                          <span className="text-sm text-red-600">{result.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Logs */}
              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <h4 className="font-medium text-gray-900">Execution Logs</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {executionDetails.logs.map((log: any, index: number) => (
                    <div key={log.id} className="p-3 border-b last:border-b-0 font-mono text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getLogLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                        <span className="flex-1 text-gray-800">{log.message}</span>
                      </div>
                      {log.nodeId && (
                        <div className="ml-20 text-xs text-gray-500 mt-1">
                          Node: {log.nodeId}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select an execution to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
