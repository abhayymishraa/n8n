"use client";

import {
  Background,
  Controls,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useState } from "react";
import { NodeDefination } from "@repo/nodes-registry";
import { v4 as uuidv4 } from "uuid";
import { trpc } from "../../../utils/trpc";
import EditorHeader from "../../../components/EditorHeader";
import NodeSidebar from "../../../components/NodeSidebar";
import FlowNode from "../../../components/FlowNode";
import { useRef } from "react";

type SimpleNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
};

type SimpleEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
};

type SimpleConnection = {
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
};

function EditorCanvas({
  params,
}: {
  params: { workflowId: string };
}) {
  const { data: workflowData, isLoading: isWorkflowLoading } =
    trpc.workflow.getById.useQuery({ id: params.workflowId });
  const saveMutation = trpc.workflow.saveVersion.useMutation();

  // React Flow state management
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  
  // UI state management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const instance = useReactFlow();
  
  // Close sidebar when clicking on the canvas
  const handlePaneClick = useCallback(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isSidebarOpen]);  const onConnect = useCallback(
    (params: SimpleConnection) => {
      const newEdge: SimpleEdge = {
        ...params,
        id: uuidv4(),
        source: params.source,
        target: params.target,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  useEffect(() => {
    if (
      !workflowData ||
      !workflowData.versions ||
      workflowData.versions.length === 0
    ) {
      return;
    }

    try {
      setNodes([]);
      setEdges([]);

      setTimeout(() => {
        try {
          const wfData = JSON.parse(JSON.stringify(workflowData));
          if (wfData?.versions[0]) {
            const latestVersion = wfData.versions[0];

            if (latestVersion.node) {
              const nodeData = latestVersion.node;
              const safeNodes = Array.isArray(nodeData) ? nodeData : [];
              setNodes(safeNodes);
            }

            if (latestVersion.connections) {
              const edgeData = latestVersion.connections;
              const safeEdges = Array.isArray(edgeData) ? edgeData : [];
              setEdges(safeEdges);
            }
          }
        } catch (err) {
          console.error("Error processing workflow data:", err);
        }
      }, 10);
    } catch (error) {
      console.error("Failed to load workflow data:", error);
    }
  }, [workflowData, setNodes, setEdges]);

  const handleSave = () => {
    setIsSaving(true);
    saveMutation.mutate(
      {
        workflowId: params.workflowId,
        nodes: nodes,
        connections: edges,
      },
      {
        onSuccess: () => setIsSaving(false),
        onError: () => setIsSaving(false),
      }
    );
  };

  const handleAddNode = (nodeDef: NodeDefination) => {
    const newNode: SimpleNode = {
      id: uuidv4(),
      type: "flowNode",
      position: { x: 200, y: 100 },
      data: { label: nodeDef.displayName, type: nodeDef.type },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      let data = event.dataTransfer.getData("application/reactflow");
      if (!data) {
        data = event.dataTransfer.getData("text/plain");
      }
      if (!data) return;

      const { nodeDef } = JSON.parse(data) as { nodeDef: NodeDefination };

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      const position = instance.screenToFlowPosition({
        x: event.clientX - (bounds?.left ?? 0),
        y: event.clientY - (bounds?.top ?? 0),
      });

      const newNode: SimpleNode = {
        id: uuidv4(),
        type: "flowNode",
        position,
        data: { label: nodeDef.displayName, type: nodeDef.type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [instance, setNodes]
  );

  if (isWorkflowLoading) return <div>...Loading Workflow</div>;
  if (!workflowData) return <div>Workflow not found.</div>;

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-gray-100">
      <EditorHeader
        workflowId={params.workflowId}
        workflowName={workflowData.name}
        onSave={handleSave}
        isSaving={isSaving || !!saveMutation.isPending}
        onToggleNodePanel={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-grow relative">
        <div
          ref={reactFlowWrapper}
          className="flex-grow h-full"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={handlePaneClick}
            nodeTypes={{ flowNode: FlowNode }}
            className="bg-gray-950"
            proOptions={{ hideAttribution: true }}
            fitView
          >
            <Background color="#374151" gap={16} size={1} />
            <Controls />
          </ReactFlow>
        </div>
        {/* Position the sidebar absolutely so it overlaps the canvas when open */}
        <div className="absolute right-0 top-0 bottom-0 h-full">
          <NodeSidebar onNodeClick={handleAddNode} isOpen={isSidebarOpen} />
        </div>
      </div>
    </div>
  );
}

export default function EditorPage({
  params,
}: {
  params: { workflowId: string };
}) {
  return (
    <ReactFlowProvider>
      <EditorCanvas params={params} />
    </ReactFlowProvider>
  );
}
