"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"

type FlowNodeData = {
  label: string
  subtitle?: string
  icon?: string
  tint?: "purple" | "blue" | "green" | "yellow" | "red" | "gray"
  status?: "idle" | "running" | "success" | "error"
}

export default function FlowNode({ data, selected }: NodeProps) {
  const d = (data as unknown as FlowNodeData) || { label: "" }
  const nodeType = (data as any)?.type as string | undefined
  const iconSrc = nodeType ? `/icons/${nodeType}.png` : undefined

  // Tint colors for future use
  // const tintClass =
  //   d.tint === "purple"
  //     ? "bg-purple-500/20 border-purple-400"
  //     : d.tint === "blue"
  //       ? "bg-blue-500/20 border-blue-400"
  //       : d.tint === "green"
  //         ? "bg-green-500/20 border-green-400"
  //         : d.tint === "yellow"
  //           ? "bg-yellow-500/20 border-yellow-400"
  //           : d.tint === "red"
  //             ? "bg-red-500/20 border-red-400"
  //             : "bg-gray-500/20 border-gray-400"

  const statusClass =
    d.status === "running"
      ? "border-[#4de8e8] shadow-lg shadow-[#4de8e8]/20 node-executing"
      : d.status === "success"
        ? "border-[#4de8e8] shadow-lg shadow-[#4de8e8]/30"
        : d.status === "error"
          ? "border-[#e83c3c] shadow-lg shadow-[#e83c3c]/30"
          : ""

  return (
    <div
      className={`w-16 h-16 rounded-theme border-2 shadow-theme backdrop-blur-sm transition-all duration-200 focus:outline-none hover:shadow-xl ${
        selected
          ? "border-[var(--primary)] shadow-[0_0_20px_rgba(203,166,247,0.2)] bg-[var(--card)]"
          : "border-border bg-[var(--card)] hover:border-[var(--primary)]/50"
      } ${statusClass}`}
      role="group"
      aria-label={`${d.label} node`}
      tabIndex={0}
    >
      <div className="flex items-center justify-center h-full p-1 drag-handle" aria-grabbed="false">
        <div className={`w-8 h-8 rounded-md bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/30 border border-[var(--primary)]/30 flex items-center justify-center shadow-inner mb-0.5 overflow-hidden`}>
          {iconSrc ? (
            <span
              aria-hidden
              style={{
                WebkitMaskImage: `url(${iconSrc})`,
                maskImage: `url(${iconSrc})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                backgroundColor: 'var(--primary)',
                display: 'inline-block',
                width: '1.5rem',
                height: '1.5rem',
              }}
            />
          ) : (
            <span className="text-[14px] font-bold text-[var(--primary)]">N</span>
          )}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-[#1da1f2] !border-2 !border-[#1da1f2] hover:!border-[#1c9cf0] hover:!bg-[#1c9cf0] !shadow-lg hover:!shadow-[rgba(28,156,240,0.4)] transition-all duration-200"
        style={{ left: -4 }}
        aria-label="Input handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-[#1da1f2] !border-2 !border-[#1da1f2] hover:!border-[#1c9cf0] hover:!bg-[#1c9cf0] !shadow-lg hover:!shadow-[rgba(28,156,240,0.4)] transition-all duration-200"
        style={{ right: -4 }}
        aria-label="Output handle"
      />
    </div>
  )
}
