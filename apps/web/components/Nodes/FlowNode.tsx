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
      className={`w-16 h-16 rounded-lg border-2 shadow-lg backdrop-blur-sm transition-all duration-200 focus:outline-none hover:shadow-xl hover:shadow-[#4de8e8]/10 ${
        selected
          ? "border-[#4de8e8] shadow-xl shadow-[#4de8e8]/20 bg-[rgba(12,32,37,0.9)]"
          : "border-[rgba(22,73,85,0.5)] bg-[rgba(12,32,37,0.8)] hover:border-[#4de8e8]/50"
      } ${statusClass}`}
      role="group"
      aria-label={`${d.label} node`}
      tabIndex={0}
    >
      <div className="flex flex-col items-center justify-center h-full p-1 drag-handle" aria-grabbed="false">
        <div className={`w-4 h-4 rounded-md bg-gradient-to-br from-[#4de8e8]/20 to-[#4de8e8]/30 border border-[#4de8e8]/30 flex items-center justify-center text-[10px] font-bold text-[#4de8e8] shadow-inner mb-0.5`}>
          {d.icon ? d.icon.charAt(0).toUpperCase() : "N"}
        </div>
        <div className="text-center">
          <div className="text-[8px] font-semibold text-[#4de8e8] leading-tight">{d.label}</div>
          {d.status && d.status !== "idle" && (
            <div className="flex items-center justify-center mt-1">
              <div
                className={`w-1.5 h-1.5 rounded-full mr-1 ${
                  d.status === "running"
                    ? "bg-[#4de8e8] animate-pulse"
                    : d.status === "success"
                      ? "bg-[#4de8e8]"
                      : d.status === "error"
                        ? "bg-[#e83c3c]"
                        : "bg-[#36a5a5]"
                }`}
              ></div>
              <span className="text-[7px] text-[#4de8e8] capitalize">{d.status}</span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-[#0a1a20] !border-2 !border-[#4de8e8]/60 hover:!border-[#4de8e8] !shadow-lg hover:!shadow-[#4de8e8]/30 transition-all duration-200"
        style={{ left: -4 }}
        aria-label="Input handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-[#0a1a20] !border-2 !border-[#4de8e8]/60 hover:!border-[#4de8e8] !shadow-lg hover:!shadow-[#4de8e8]/30 transition-all duration-200"
        style={{ right: -4 }}
        aria-label="Output handle"
      />
    </div>
  )
}
