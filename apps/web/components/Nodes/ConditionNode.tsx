"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"

type ConditionNodeData = {
  label: string
}

export default function ConditionNode({ data, selected }: NodeProps) {
  const d = (data as unknown as ConditionNodeData) || { label: "IF" }

  return (
    <div
      className={`w-16 h-16 rounded-lg border-2 shadow-lg backdrop-blur-sm transition-all duration-200 focus:outline-none hover:shadow-xl hover:shadow-[#4de8e8]/10 ${
        selected
          ? "border-[#4de8e8] shadow-xl shadow-[#4de8e8]/20 bg-[rgba(12,32,37,0.9)]"
          : "border-[rgba(22,73,85,0.5)] bg-[rgba(12,32,37,0.8)] hover:border-[#4de8e8]/50"
      } relative`}
      role="group"
      aria-label={`${d.label} node`}
      tabIndex={0}
    >
      <div className="flex flex-col items-center justify-center h-full p-1 drag-handle">
        <div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#4de8e8]/20 to-[#4de8e8]/30 border border-[#4de8e8]/30 flex items-center justify-center text-[10px] font-bold text-[#4de8e8] shadow-inner mb-0.5">
          IF
        </div>
        <div className="text-center">
          <div className="text-[8px] font-semibold text-[#4de8e8] leading-tight">{d.label || "If"}</div>
        </div>
      </div>

      <h3 className="text-[6px] text-[#4de8e8]" style={{ position: 'absolute', right: 2, top: '20%', userSelect: 'none' }}>True</h3>
      <h3 className="text-[6px] text-[#4de8e8]" style={{ position: 'absolute', right: 2, top: '60%', userSelect: 'none' }}>False</h3>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-1.5 !h-1.5 !bg-[#0a1a20] !border !border-[#4de8e8]/60 hover:!border-[#4de8e8] !shadow-lg hover:!shadow-[#4de8e8]/30 transition-all duration-200"
        style={{ left: -4 }}
        aria-label="Input handle"
        id="in"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-1.5 !h-1.5 !bg-[#0a1a20] !border !border-[#4de8e8]/60 hover:!border-[#4de8e8] !shadow-lg hover:!shadow-[#4de8e8]/30 transition-all duration-200"
        style={{ right: -4, top: "30%" }}
        aria-label="True output"
        id="true"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-1.5 !h-1.5 !bg-[#0a1a20] !border !border-[#4de8e8]/60 hover:!border-[#4de8e8] !shadow-lg hover:!shadow-[#4de8e8]/30 transition-all duration-200"
        style={{ right: -4, top: "70%" }}
        aria-label="False output"
        id="false"
      />
    </div>
  )
}


