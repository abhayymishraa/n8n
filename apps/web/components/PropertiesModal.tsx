'use client';

import { Node } from '@xyflow/react';
import { getNodeDefinition, NodeProperty } from '@repo/nodes-registry';
import { useState, useEffect } from 'react';
import { IoClose, IoSave } from 'react-icons/io5';
import { FaCopy } from 'react-icons/fa';
import { trpc } from '../utils/trpc'
import { CredentialType } from '../types/credential';

interface CredentialSelectorProps {
  prop: NodeProperty;
  currentValue: string;
  onValueChange: (_value: string) => void;
  isEmpty: boolean;
}

function CredentialSelector({ prop, currentValue, onValueChange, isEmpty }: CredentialSelectorProps) {
  const { data: credentials, isLoading } = trpc.credentials.list.useQuery();
  
  // Filter credentials by the allowed types for this property
  const allowedTypes = prop.credentialTypes || [];
  const filteredCredentials = credentials?.filter((cred: any) => 
    allowedTypes.length === 0 || allowedTypes.includes(cred.type as CredentialType)
  ) || [];

  const inputClassName = `w-full px-3 py-2 bg-[rgba(22,73,85,0.3)] border ${isEmpty ? 'border-red-500' : 'border-[rgba(22,73,85,0.5)]'} rounded-lg text-white placeholder-[#36a5a5] focus:outline-none focus:border-[#4de8e8] focus:ring-1 focus:ring-[#4de8e8]`;

  if (isLoading) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#4de8e8] mb-2">
          {prop.displayName}
          {prop.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="p-3 bg-[rgba(22,73,85,0.3)] border border-[rgba(22,73,85,0.5)] rounded-lg">
          <p className="text-sm text-[#36a5a5]">Loading credentials...</p>
        </div>
      </div>
    );
  }

  if (filteredCredentials.length === 0) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#4de8e8] mb-2">
          {prop.displayName}
          {prop.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="p-3 bg-[rgba(22,73,85,0.3)] border border-[rgba(22,73,85,0.5)] rounded-lg">
          <p className="text-sm text-[#36a5a5] mb-2">No credentials available for this node type.</p>
          <a 
            href="/credentials" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#4de8e8] hover:underline text-sm"
          >
            Create credentials →
          </a>
        </div>
        {isEmpty && (
          <p className="text-red-400 text-xs mt-1">This field is required</p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-[#4de8e8] mb-2">
        {prop.displayName}
        {prop.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        value={currentValue}
        onChange={(e) => onValueChange(e.target.value)}
        className={inputClassName}
      >
        <option value="">Select a credential...</option>
        {filteredCredentials.map((credential: any) => (
          <option key={credential.id} value={credential.id}>
            {credential.name} ({credential.type})
          </option>
        ))}
      </select>
      {isEmpty && (
        <p className="text-red-400 text-xs mt-1">This field is required</p>
      )}
      <div className="mt-2">
        <a 
          href="/credentials" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#4de8e8] hover:underline text-xs"
        >
          Manage credentials →
        </a>
      </div>
    </div>
  );
}

interface PropertiesModalProps {
  selectedNode: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onNodeDataChange: (_nodeId: string, _newData: any) => void;
  workflowData?: any;
  initialTab?: 'properties' | 'output';
}

export default function PropertiesModal({ 
  selectedNode, 
  isOpen, 
  onClose, 
  onNodeDataChange: _onNodeDataChange,
  workflowData,
  initialTab = 'properties',
}: PropertiesModalProps) {
  const [localInputs, setLocalInputs] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'properties' | 'output'>(initialTab);

  // Keep tab in sync when modal opens with a different initialTab
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  // Fetch latest execution details to show this node's last output
  const workflowId = workflowData?.id as string | undefined;
  const { data: latestExecutions } = trpc.workflow.getExecutions.useQuery(
    { workflowId: workflowId as string, limit: 1 },
    { enabled: !!workflowId }
  );
  const latestExecutionId = latestExecutions && latestExecutions[0]?.id;
  const { data: latestExecutionDetails } = trpc.workflow.getExecutionDetails.useQuery(
    { executionId: latestExecutionId as string },
    { enabled: !!latestExecutionId }
  );
  const nodeExecutionResult = (latestExecutionDetails?.executionResults || []).find(
    (r: any) => r?.nodeInstance?.nodeId === selectedNode?.id
  );

  // Initialize local inputs when node changes
  useEffect(() => {
    if (selectedNode) {
      const nodeDef = getNodeDefinition(selectedNode.data.type as string);
      if (nodeDef && nodeDef.properties) {
        const initialInputs: Record<string, any> = {};
        nodeDef.properties.forEach(prop => {
          initialInputs[prop.name] = (selectedNode.data?.inputs as Record<string, any>)?.[prop.name] ?? prop.default ?? '';
        });
        setLocalInputs(initialInputs);
      }
    }
  }, [selectedNode]);

  if (!isOpen || !selectedNode) {
    return null;
  }

  const nodeDef = getNodeDefinition(selectedNode.data.type as string);
  if (!nodeDef) return null;

  const handleInputChange = (propName: string, value: any) => {
    setLocalInputs(prev => ({
      ...prev,
      [propName]: value,
    }));
  };

  const handleSave = () => {
    // Check if all required fields are filled
    if (nodeDef && nodeDef.properties) {
      const missingRequiredFields = nodeDef.properties.filter(prop => 
        prop.required && (!localInputs[prop.name] || localInputs[prop.name] === '')
      );
      
      if (missingRequiredFields.length > 0) {
        if (typeof window !== 'undefined' && (window as any).alert) {
          (window as any).alert(`Please fill in the required fields: ${missingRequiredFields.map(f => f.displayName).join(', ')}`);
        }
        return;
      }
    }
    
    const newData = {
      ...selectedNode.data,
      inputs: localInputs,
    };
    _onNodeDataChange(selectedNode.id, newData);
    onClose();
  };

  const handleCancel = () => {
    const nodeDef = getNodeDefinition(selectedNode.data.type as string);
    if (nodeDef && nodeDef.properties) {
      const resetInputs: Record<string, any> = {};
      nodeDef.properties.forEach(prop => {
        resetInputs[prop.name] = (selectedNode.data?.inputs as Record<string, any>)?.[prop.name] ?? prop.default ?? '';
      });   
      setLocalInputs(resetInputs);
    }
    onClose();
  };

  const renderProperty = (prop: NodeProperty) => {
    // Handle the special case for webhook URL display
    if (prop.type === 'notice' && selectedNode?.data.type === 'webhook') {
      // Find the active trigger that corresponds to THIS specific node
      const activeTrigger = workflowData?.triggers?.find(
        (t: any) => t.nodeId === selectedNode.id
      );

      // Always generate a webhook URL - use the actual trigger path if available, otherwise use node ID
      const webhookPath = activeTrigger?.configuration?.path || selectedNode.id;
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
      const fullUrl = `${baseUrl}/api/webhook/${webhookPath}`;
      
      const isActive = !!activeTrigger;

      return (
        <div key={prop.name} className="mb-6">
          <label className="block text-sm font-medium text-[#4de8e8] mb-2">
            {prop.displayName}
          </label>
          <div className="p-3 bg-[rgba(10,20,22,0.8)] border border-[rgba(22,73,85,0.5)] rounded-lg space-y-3">
            <div>
              <p className="text-sm text-white break-all font-mono">{fullUrl}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isActive 
                    ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                    : 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
                }`}>
                  {isActive ? '🟢 Active' : '🟡 Activate workflow to enable'}
                </span>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).navigator?.clipboard) {
                      (window as any).navigator.clipboard.writeText(fullUrl);
                    }
                  }}
                  className="text-xs text-[#4de8e8] hover:underline transition-colors flex items-center gap-1"
                >
                  <FaCopy /> Copy URL
                </button>
              </div>
            </div>
            
            <div className="border-t border-[rgba(22,73,85,0.3)] pt-3">
              <p className="text-xs text-[#36a5a5] mb-2">📝 <strong>How to use this webhook:</strong></p>
              <div className="text-xs text-[#36a5a5] space-y-1">
                <p>• Send HTTP requests to the URL above</p>
                <p>• Method: {localInputs['httpMethod'] || 'POST'}</p>
                <p>• Content-Type: application/json (recommended)</p>
                <p>• The request body will be available as trigger data</p>
              </div>
              
              <div className="mt-2 p-2 bg-[rgba(5,15,18,0.8)] border border-[rgba(22,73,85,0.3)] rounded text-xs">
                <p className="text-[#4de8e8] mb-1">Example cURL command:</p>
                <pre className="text-[#36a5a5] font-mono text-[10px] whitespace-pre-wrap break-all">
{`curl -X ${localInputs['httpMethod'] || 'POST'} "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello from webhook!"}'`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const currentValue = localInputs[prop.name] ?? prop.default ?? '';
    const isEmpty = Boolean(prop.required) && (!currentValue || currentValue === '');
    const inputClassName = `w-full px-3 py-2 bg-[rgba(22,73,85,0.3)] border ${isEmpty ? 'border-red-500' : 'border-[rgba(22,73,85,0.5)]'} rounded-lg text-white placeholder-[#36a5a5] focus:outline-none focus:border-[#4de8e8] focus:ring-1 focus:ring-[#4de8e8]`;
    
    switch (prop.type) {
      case 'string':
        return (
          <div key={prop.name} className="mb-6">
            <label className="block text-sm font-medium text-[#4de8e8] mb-2">
              {prop.displayName}
              {prop.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <textarea
              value={currentValue}
              onChange={(e) => handleInputChange(prop.name, e.target.value)}
              placeholder={prop.placeholder}
              rows={3}
              className={`${inputClassName} resize-none`}
            />
            {isEmpty && (
              <p className="text-red-400 text-xs mt-1">This field is required</p>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div key={prop.name} className="mb-6">
            <label className="block text-sm font-medium text-[#4de8e8] mb-2">
              {prop.displayName}
              {prop.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={currentValue}
              onChange={(e) => handleInputChange(prop.name, parseFloat(e.target.value) || 0)}
              placeholder={prop.placeholder}
              className={inputClassName}
            />
            {isEmpty && (
              <p className="text-red-400 text-xs mt-1">This field is required</p>
            )}
          </div>
        );
      
      case 'boolean':
        return (
          <div key={prop.name} className="mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={currentValue}
                onChange={(e) => handleInputChange(prop.name, e.target.checked)}
                className="w-4 h-4 text-[#4de8e8] bg-[rgba(22,73,85,0.3)] border-[rgba(22,73,85,0.5)] rounded focus:ring-[#4de8e8] focus:ring-2"
              />
              <span className="text-sm font-medium text-[#4de8e8]">
                {prop.displayName}
                {prop.required && <span className="text-red-400 ml-1">*</span>}
              </span>
            </label>
          </div>
        );
      
      case 'options':
        return (
          <div key={prop.name} className="mb-6">
            <label className="block text-sm font-medium text-[#4de8e8] mb-2">
              {prop.displayName}
              {prop.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <select
              value={currentValue}
              onChange={(e) => handleInputChange(prop.name, e.target.value)}
              className={inputClassName}
            >
              <option value="">Select an option...</option>
              {prop.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
            {isEmpty && (
              <p className="text-red-400 text-xs mt-1">This field is required</p>
            )}
          </div>
        );
      
      case 'notice':
        return (
          <div key={prop.name} className="mb-6">
            <label className="block text-sm font-medium text-[#4de8e8] mb-2">
              {prop.displayName}
            </label>
            <div className="p-3 bg-[rgba(10,20,22,0.8)] border border-[rgba(22,73,85,0.5)] rounded-lg">
              <p className="text-sm text-[#36a5a5] break-all">{prop.default}</p>
            </div>
          </div>
        );
      
      case 'credential':
        return <CredentialSelector 
          key={prop.name}
          prop={prop}
          currentValue={currentValue}
          onValueChange={(value) => handleInputChange(prop.name, value)}
          isEmpty={isEmpty}
        />;
      
      default:
        return (
          <div key={prop.name} className="mb-6">
            <label className="block text-sm font-medium text-[#4de8e8] mb-2">
              {prop.displayName}
              {prop.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleInputChange(prop.name, e.target.value)}
              placeholder={prop.placeholder}
              className={inputClassName}
            />
            {isEmpty && (
              <p className="text-red-400 text-xs mt-1">This field is required</p>
            )}
          </div>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[rgba(12,32,37,0.95)] backdrop-blur-md border border-[rgba(22,73,85,0.5)] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] w-full max-w-lg max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgba(22,73,85,0.5)]">
            <div>
              <h2 className="text-xl font-semibold text-[#4de8e8]">{nodeDef.displayName}</h2>
              <p className="text-sm text-[#36a5a5] mt-1">{nodeDef.description}</p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 text-[#36a5a5] hover:text-[#4de8e8] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-colors"
            >
              <IoClose size={20} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="px-6 pt-4">
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 text-sm rounded-md border ${activeTab === 'properties' ? 'border-[#4de8e8] text-[#4de8e8] bg-[rgba(77,232,232,0.1)]' : 'border-[rgba(22,73,85,0.5)] text-[#36a5a5] hover:text-[#4de8e8]'}`}
                onClick={() => setActiveTab('properties')}
              >
                Properties
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-md border ${activeTab === 'output' ? 'border-[#4de8e8] text-[#4de8e8] bg-[rgba(77,232,232,0.1)]' : 'border-[rgba(22,73,85,0.5)] text-[#36a5a5] hover:text-[#4de8e8]'}`}
                onClick={() => setActiveTab('output')}
              >
                Output
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'properties' && (
              !nodeDef.properties || nodeDef.properties.length === 0 ? (
                <p className="text-[#36a5a5] text-center py-8">
                  This node has no configurable properties.
                </p>
              ) : (
                <div>
                  {nodeDef.properties.map(renderProperty)}

                  {/* Data access help */}
                  <div className="mt-6 p-4 rounded-lg bg-[rgba(10,20,22,0.8)] border border-[rgba(22,73,85,0.5)]">
                    <h4 className="font-medium text-[#4de8e8] mb-2">How to reference data from other nodes</h4>
                    <div className="space-y-2 text-xs text-[#36a5a5]">
                      <p>
                        Use templating with <span className="text-[#4de8e8] font-mono">{'{{ }}'}</span> to reference values from previous nodes.
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <span className="text-[#4de8e8]">Trigger data</span>: <span className="font-mono">{'{{ trigger.body.message }}'}</span>
                        </li>
                        <li>
                          <span className="text-[#4de8e8]">Previous node output</span> (by label or id): <span className="font-mono">{'{{ nodes["Node Label"].output.key }}'}</span> or <span className="font-mono">{'{{ nodes["<node-id>"].output.key }}'}</span>
                        </li>
                        <li>
                          <span className="text-[#4de8e8]">Entire output</span>: <span className="font-mono">{'{{ nodes["Node Label"].output }}'}</span>
                        </li>
                        <li>
                          <span className="text-[#4de8e8]">AI/Agent nodes</span> often return <span className="font-mono">text</span> and <span className="font-mono">metadata</span>: <span className="font-mono">{'{{ nodes["AI"].output.text }}'}</span>
                        </li>
                      </ul>
                      <div className="mt-2 p-2 bg-[rgba(5,15,18,0.8)] border border-[rgba(22,73,85,0.3)] rounded">
                        <p className="text-[#4de8e8] mb-1">Example:</p>
                        <pre className="text-[11px] text-[#d1d5db] font-mono whitespace-pre-wrap">{"Send to {{ nodes[\"Summarize\"].output.text }}"}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {activeTab === 'output' && (
              <div className="space-y-3">
                {!latestExecutionId && (
                  <div className="text-[#36a5a5] text-sm">No executions yet. Run the workflow to see outputs.</div>
                )}
                {latestExecutionId && !nodeExecutionResult && (
                  <div className="text-[#36a5a5] text-sm">This node did not run in the latest execution.</div>
                )}
                {nodeExecutionResult && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-md border border-[rgba(22,73,85,0.5)] text-[#4de8e8]">{nodeExecutionResult.status}</span>
                      {typeof nodeExecutionResult.executionTime === 'number' && (
                        <span className="text-[#36a5a5]">{nodeExecutionResult.executionTime}ms</span>
                      )}
                    </div>
                    {nodeExecutionResult.errorMessage && (
                      <div className="p-2 rounded border border-red-900/40 bg-[rgba(239,68,68,0.12)] text-xs text-red-300">
                        Error: {nodeExecutionResult.errorMessage}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-medium text-[#4de8e8] mb-1">Input</h4>
                      <pre className="text-[11px] bg-[#0a1a20] text-[#d1d5db] p-2 rounded overflow-x-auto border border-[rgba(22,73,85,0.5)]">{JSON.stringify(nodeExecutionResult.inputData, null, 2)}</pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-[#4de8e8] mb-1">Output</h4>
                      <pre className="text-[11px] bg-[#0a1a20] text-[#d1d5db] p-2 rounded overflow-x-auto border border-[rgba(22,73,85,0.5)]">{JSON.stringify(nodeExecutionResult.outputData, null, 2)}</pre>
                    </div>
                    <div className="text-[10px] text-[#36a5a5]">From latest execution: {new Date(latestExecutionDetails?.startedAt || Date.now()).toLocaleString()}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-[rgba(22,73,85,0.5)]">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-[#36a5a5] hover:text-white border border-[rgba(22,73,85,0.5)] hover:border-[rgba(255,255,255,0.2)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-[#4de8e8] text-[#0a1a20] hover:bg-[#36a5a5] rounded-lg transition-colors font-medium shadow-[0_4px_15px_rgba(77,232,232,0.25)]"
            >
              <IoSave size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
