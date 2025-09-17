"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";

type FlowNodeData = {
  label: string;
  subtitle?: string;
  icon?: string;
  tint?: "purple" | "blue" | "green" | "yellow" | "red" | "gray";
};

export default function FlowNode({ data, selected }: NodeProps) {
  const d = (data as unknown as FlowNodeData) || { label: "" };
  const tintClass =
    d.tint === "purple"
      ? "bg-purple-500"
      : d.tint === "blue"
      ? "bg-blue-500"
      : d.tint === "green"
      ? "bg-green-500"
      : d.tint === "yellow"
      ? "bg-yellow-500"
      : d.tint === "red"
      ? "bg-red-500"
      : "bg-gray-500";

  return (
    <div
      className={`min-w-[240px] rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        selected ? "border-indigo-400 shadow-md" : "border-gray-700"
      } bg-gray-900`}
      role="group"
      aria-label={`${d.label} node`}
      tabIndex={0}
    >
      <div className="flex items-stretch">
        <div className={`w-1 rounded-l-md ${tintClass}`}></div>
        <div className="flex-1 p-3 drag-handle" aria-grabbed="false">
          <div className="flex items-center">
            <div className="mr-2 h-6 w-6 rounded-sm bg-gray-800 flex items-center justify-center text-xs text-gray-300">
              {d.icon ? d.icon.charAt(0) : ""}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-100">{d.label}</div>
              {d.subtitle && (
                <div className="text-[11px] text-gray-400">{d.subtitle}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-400 !border-2 !border-gray-900"
        style={{ left: -4 }}
        aria-label="Input handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-400 !border-2 !border-gray-900"
        style={{ right: -4 }}
        aria-label="Output handle"
      />
    </div>
  );
}


