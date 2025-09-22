"use client"

import type React from "react"

import {
  Background,
  Controls,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
  MiniMap,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { useCallback, useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { NodeDefinition } from "@repo/nodes-registry"
import { v4 as uuidv4 } from "uuid"
import { trpc } from "../../../utils/trpc"
import NodeSidebar from "../../../components/NodeSidebar"
import FlowNode from "../../../components/Nodes/FlowNode"
import ConditionNode from "../../../components/Nodes/ConditionNode"
import TriggerNode from "../../../components/Nodes/TriggerNode"
import InteractiveEdge from "../../../components/InteractiveEdge"
import PropertiesModal from "../../../components/PropertiesModal"
import ExecutionViewer from "../../../components/ExecutionViewer"

type SimpleNode = {
  id: string
  type: string
  position: { x: number; y: number }
  data: any
}

type SimpleEdge = {
  id: string
  source: string
  target: string
  type?: string
}

type SimpleConnection = {
  source: string
  target: string
  sourceHandle: string | null
  targetHandle: string | null
}

function EditorCanvas({
  params,
}: {
  params: { workflowId: string }
}) {
  const router = useRouter()
  const { data: workflowData, isLoading: isWorkflowLoading } = trpc.workflow.getById.useQuery({ id: params.workflowId })
  const saveMutation = trpc.workflow.saveVersion.useMutation()
  const executeManualMutation = trpc.workflow.executeManual.useMutation()

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([])

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null)
  const instance = useReactFlow()
  const [pendingInsertEdgeId, setPendingInsertEdgeId] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isPropertiesModalOpen, setIsPropertiesModalOpen] = useState(false)
  const [propertiesInitialTab, setPropertiesInitialTab] = useState<'properties' | 'output'>('properties')
  const [showExecutionViewer, setShowExecutionViewer] = useState(false)
  const initializedRef = useRef<string | null>(null)

  const handlePaneClick = useCallback(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }, [isSidebarOpen])

  const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: any) => {
    setSelectedNode(node)
    setPropertiesInitialTab('properties')
    setIsPropertiesModalOpen(true)
  }, [])

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    setSelectedNode(node)
    setPropertiesInitialTab('output')
    setIsPropertiesModalOpen(true)
  }, [])

  const handleNodeDataChange = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        return { ...node, data: newData }
      }
      return node
    }))
  }, [setNodes])

  const onConnect = useCallback(
    (params: SimpleConnection) => {
      const sourceNode = nodes.find((n) => n.id === params.source)
      const targetNode = nodes.find((n) => n.id === params.target)

      // Disallow connecting a node to itself (self-looping)
      if (params.source === params.target) {
        return
      }

      // Disallow connecting INTO a trigger
      if (targetNode?.type === "triggerNode") {
        return
      }

      // For condition nodes, allow at most one edge per handle id (true/false)
      if (sourceNode?.type === "conditionNode") {
        const handleId = params.sourceHandle
        if (!handleId) return
        const existing = edges.some((e) => e.source === sourceNode.id && (e as any).sourceHandle === handleId)
        if (existing) return
      }

      const newEdge: SimpleEdge = {
        ...params,
        id: uuidv4(),
        source: params.source,
        target: params.target,
        type: "interactive",
      }
      setEdges((eds) => addEdge(newEdge as any, eds))
    },
    [nodes, edges, setEdges],
  )

  useEffect(() => {
    if (!workflowData || !workflowData.versions || workflowData.versions.length === 0) {
      return
    }

    // Prevent re-initializing graph state after the first successful load for this workflow
    if (initializedRef.current === params.workflowId) {
      return
    }

    try {
      const wfData = JSON.parse(JSON.stringify(workflowData))
      if (wfData?.versions[0]) {
        const latestVersion = wfData.versions[0]

        if (latestVersion.node) {
          const nodeData = latestVersion.node
          const safeNodes = Array.isArray(nodeData) ? nodeData : []
          setNodes(safeNodes)
        } else {
          setNodes([])
        }

        if (latestVersion.connections) {
          const edgeData = latestVersion.connections
          const safeEdges = (Array.isArray(edgeData) ? edgeData : []).map((e: any) => ({ ...e, type: "interactive" }))
          setEdges(safeEdges)
        } else {
          setEdges([])
        }
      }
      initializedRef.current = params.workflowId
    } catch (error) {
      console.error("Failed to load workflow data:", error)
    }
  }, [workflowData, params.workflowId, setNodes, setEdges])

  const handleSave = () => {
    setIsSaving(true)
    saveMutation.mutate(
      {
        workflowId: params.workflowId,
        nodes: nodes,
        connections: edges,
      },
      {
        onSuccess: () => setIsSaving(false),
        onError: () => setIsSaving(false),
      },
    )
  }

  // Check if workflow has a Manual trigger
  const hasManualTrigger = nodes.some(node => node.data?.type === 'Manual')

  const handleExecuteManual = () => {
    setIsExecuting(true)
    let triggerData: any = undefined
    if (typeof window !== 'undefined' && (window as any).prompt) {
      try {
        const raw = (window as any).prompt('Optional: Enter trigger JSON (leave empty for default)', '{"message":"Manual trigger from UI"}')
        if (raw && raw.trim().length > 0) {
          triggerData = JSON.parse(raw)
        }
      } catch (e) {
        console.error('Invalid JSON provided for trigger data, ignoring.', e)
      }
    }
    executeManualMutation.mutate(
      {
        workflowid: params.workflowId,
        triggerData,
      },
      {
        onSuccess: (data) => {
          setIsExecuting(false)
          console.log('Workflow executed successfully:', data)
          // You could show a toast notification here
          if (typeof window !== 'undefined' && window.alert) {
            window.alert(`Workflow executed successfully! Execution ID: ${data.executionId}`)
          }
        },
        onError: (error) => {
          setIsExecuting(false)
          console.error('Failed to execute workflow:', error)
          if (typeof window !== 'undefined' && window.alert) {
            window.alert(`Failed to execute workflow: ${error.message}`)
          }
        },
      },
    )
  }

  const handleAddNode = (nodeDef: NodeDefinition) => {
    const nodeType = nodeDef.type === "if" ? "conditionNode" : nodeDef.role === "trigger" ? "triggerNode" : "flowNode"

    // If an edge is selected for insertion, insert node between it
    if (pendingInsertEdgeId) {
      const edge = edges.find((e) => e.id === pendingInsertEdgeId)
      if (edge) {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        const targetNode = nodes.find((n) => n.id === edge.target)
        const sourcePos = sourceNode?.position || { x: 0, y: 0 }
        const targetPos = targetNode?.position || { x: 0, y: 0 }
        const position = { x: (sourcePos.x + targetPos.x) / 2, y: (sourcePos.y + targetPos.y) / 2 }

        const insertedNode: SimpleNode = {
          id: uuidv4(),
          type: nodeType,
          position,
          data: { 
            label: nodeDef.displayName, 
            type: nodeDef.type, 
            role: nodeDef.role,
            inputs: {}
          },
        }

        setNodes((nds) => nds.concat(insertedNode))
        setEdges((eds) => {
          const filtered = eds.filter((e) => e.id !== pendingInsertEdgeId)
          const newA: any = { id: uuidv4(), source: edge.source, target: insertedNode.id, type: "interactive" }
          const newB: any = { id: uuidv4(), source: insertedNode.id, target: edge.target, type: "interactive" }
          return filtered.concat(newA, newB)
        })
        setPendingInsertEdgeId(null)
        
        // Open properties modal for the inserted node if it has properties
        if (nodeDef.properties && nodeDef.properties.length > 0) {
          setSelectedNode(insertedNode)
          setIsPropertiesModalOpen(true)
        }
        return
      }
    }

    const newNode: SimpleNode = {
      id: uuidv4(),
      type: nodeType,
      position: { x: 200, y: 100 },
      data: { 
        label: nodeDef.displayName, 
        type: nodeDef.type, 
        role: nodeDef.role,
        inputs: {}
      },
    }
    setNodes((nds) => [...nds, newNode])
    
    // Close sidebar when node is added
    setIsSidebarOpen(false)
    
    // Open properties modal for the new node if it has properties
    if (nodeDef.properties && nodeDef.properties.length > 0) {
      setSelectedNode(newNode)
      setIsPropertiesModalOpen(true)
    }
  }

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      let data = event.dataTransfer.getData("application/reactflow")
      if (!data) {
        data = event.dataTransfer.getData("text/plain")
      }
      if (!data) return

      const { nodeDef } = JSON.parse(data) as { nodeDef: NodeDefinition }

      const bounds = reactFlowWrapper.current?.getBoundingClientRect()
      const position = instance.screenToFlowPosition({
        x: event.clientX - (bounds?.left ?? 0),
        y: event.clientY - (bounds?.top ?? 0),
      })

      const nodeType = nodeDef.type === "if" ? "conditionNode" : nodeDef.role === "trigger" ? "triggerNode" : "flowNode"

      const newNode: SimpleNode = {
        id: uuidv4(),
        type: nodeType,
        position,
        data: { 
          label: nodeDef.displayName, 
          type: nodeDef.type, 
          role: nodeDef.role,
          inputs: {}
        },
      }

      setNodes((nds) => nds.concat(newNode))
      
      // Open properties modal for the dropped node if it has properties
      if (nodeDef.properties && nodeDef.properties.length > 0) {
        setSelectedNode(newNode)
        setIsPropertiesModalOpen(true)
      }
    },
    [instance, setNodes, nodes],
  )

  useEffect(() => {
    const doc = (typeof document !== "undefined" ? document : null) as Document | null // eslint-disable-line no-undef
    if (!doc) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { edgeId: string }
      setPendingInsertEdgeId(detail.edgeId)
      setIsSidebarOpen(true)
    }
    doc.addEventListener("edge-insert-select", handler as EventListener)
    return () => doc.removeEventListener("edge-insert-select", handler as EventListener)
  }, [])

  // Handle keyboard events for delete functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Get selected nodes and edges
        const selectedNodes = nodes.filter(node => node.selected)
        const selectedEdges = edges.filter(edge => edge.selected)
        
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault()
          
          // Delete selected nodes
          if (selectedNodes.length > 0) {
            const nodeIds = selectedNodes.map(node => node.id)
            setNodes(prevNodes => prevNodes.filter(node => !nodeIds.includes(node.id)))
            
            // Also remove any edges connected to deleted nodes
            setEdges(prevEdges => prevEdges.filter(edge => 
              !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
            ))
          }
          
          // Delete selected edges
          if (selectedEdges.length > 0) {
            const edgeIds = selectedEdges.map(edge => edge.id)
            setEdges(prevEdges => prevEdges.filter(edge => !edgeIds.includes(edge.id)))
          }
        }
      }
    }

    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [nodes, edges, setNodes, setEdges])

  if (isWorkflowLoading) return <div>...Loading Workflow</div>
  if (!workflowData) return <div>Workflow not found.</div>

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[linear-gradient(180deg,rgba(10,26,32,1)_0%,rgba(10,26,32,1)_100%)]">
      <div className="bg-[rgba(12,32,37,0.85)] backdrop-blur-md border-b border-[rgba(22,73,85,0.5)] px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-zinc-300 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] border border-transparent hover:border-[rgba(255,255,255,0.1)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#4de8e8] rounded-full animate-pulse"></div>
              <h1 className="text-lg font-semibold text-[#4de8e8] tracking-tight">{workflowData.name}</h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-xs text-[#36a5a5]">
              <span className="px-2 py-0.5 bg-[rgba(22,73,85,0.3)] border border-[rgba(22,73,85,0.5)] rounded-md text-[#4de8e8]">Inactive</span>
              <span className="px-2 py-0.5 bg-[rgba(22,73,85,0.2)] border border-[rgba(22,73,85,0.3)] rounded-md text-[#36a5a5] text-[10px]">Press Del to delete selected</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExecutionViewer(!showExecutionViewer)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[#4de8e8] border border-[rgba(22,73,85,0.5)] hover:border-[#4de8e8]/60 hover:text-[#4de8e8] hover:bg-[rgba(77,232,232,0.12)] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Executions</span>
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[#4de8e8] border border-[rgba(22,73,85,0.5)] hover:border-[#4de8e8]/60 hover:text-[#4de8e8] hover:bg-[rgba(77,232,232,0.12)] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Node</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !!saveMutation.isPending}
              className="px-4 py-1.5 rounded-lg bg-[#4de8e8] text-[#0a1a20] hover:bg-[#36a5a5] disabled:bg-[#0f3039]/60 disabled:text-[#36a5a5] disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-[0_6px_20px_rgba(77,232,232,0.25)]"
            >
              {isSaving || saveMutation.isPending ? "Saving..." : "Save"}
            </button>

            {hasManualTrigger && (
              <button
                onClick={handleExecuteManual}
                disabled={isExecuting || !!executeManualMutation.isPending}
                className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-[0_6px_20px_rgba(34,197,94,0.25)]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>{isExecuting || executeManualMutation.isPending ? "Executing..." : "Execute Workflow"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {showExecutionViewer && (
          <div className="w-full bg-[#0c2025] border-r border-[#164955] p-4 overflow-y-auto">
            <ExecutionViewer workflowId={params.workflowId} />
          </div>
        )}
        {!showExecutionViewer && (
        <div ref={reactFlowWrapper} className={`w-full h-full`} onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={handlePaneClick}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            nodeTypes={{ flowNode: FlowNode, conditionNode: ConditionNode, triggerNode: TriggerNode }}
            edgeTypes={{ interactive: InteractiveEdge }}
            style={{ backgroundColor: '#000000' }}
            proOptions={{ hideAttribution: true }}
            fitView
            fitViewOptions={{ padding: 0.05 }}
            defaultViewport={{ x: 0, y: 0, zoom: 0.2 }}
            defaultEdgeOptions={{
              style: {
                stroke: "#000000",
                strokeWidth: 2,
                strokeDasharray: "8,4",
              },
              type: "interactive",
            }}
          >
            <Background color="#000000" gap={28} size={1} style={{ backgroundColor: "#000000" }} />
            <Controls />
            <MiniMap
              nodeColor={() => '#164955'}
              nodeStrokeColor={() => '#4de8e8'}
              nodeStrokeWidth={1}
              maskColor="rgba(10,26,32,0.85)"
              style={{ backgroundColor: '#0a1a20' }}
            />
          </ReactFlow>
        </div>
        )}
        <NodeSidebar onNodeClick={handleAddNode} isOpen={isSidebarOpen} />
      </div>
      
      <PropertiesModal
        selectedNode={selectedNode}
        isOpen={isPropertiesModalOpen}
        onClose={() => setIsPropertiesModalOpen(false)}
        onNodeDataChange={handleNodeDataChange}
        workflowData={workflowData}
        initialTab={propertiesInitialTab}
      />
    </div>
  )
}

export default function EditorPage({
  params,
}: {
  params: { workflowId: string }
}) {
  return (
    <ReactFlowProvider>
      <EditorCanvas params={params} />
    </ReactFlowProvider>
  )
}
