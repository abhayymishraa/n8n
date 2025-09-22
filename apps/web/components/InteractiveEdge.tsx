"use client";

import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  useReactFlow,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { useRef, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";


export default function InteractiveEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    sourceHandle,
  } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const rf = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const showControls = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setHovered(true);
  };

  const scheduleHideControls = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setHovered(false);
      hideTimerRef.current = null;
    }, 120);
  };

  const removeEdge = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    rf.deleteElements({ edges: [{ id }] });
  };

  const selectEdgeForInsert = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    rf.setViewport(rf.getViewport());
    if (typeof document !== "undefined") {
      document.dispatchEvent(
        new CustomEvent("edge-insert-select", {
          detail: { edgeId: id, x: labelX, y: labelY },
        })
      );
    }
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <path
        d={edgePath}
        stroke="transparent"
        fill="none"
        strokeWidth={20}
        style={{ pointerEvents: "stroke" }}
        onMouseEnter={showControls}
        onMouseLeave={scheduleHideControls}
      />
      <EdgeLabelRenderer>
        {/* Conditional branch label at the end of the edge (near target) */}
        {sourceHandle && (sourceHandle === "true" || sourceHandle === "false") && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${targetX}px, ${targetY}px) translate(-8px, -8px)`,
              pointerEvents: "none",
            }}
          >
            <span
              className={
                sourceHandle === "true"
                  ? "text-[9px] px-1.5 py-0.5 rounded bg-[rgba(34,197,94,0.15)] text-green-300 border border-green-900/40"
                  : "text-[9px] px-1.5 py-0.5 rounded bg-[rgba(239,68,68,0.12)] text-red-300 border border-red-900/40"
              }
            >
              {sourceHandle === "true" ? "True" : "False"}
            </span>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: hovered ? "all" : "none",
            opacity: hovered ? 1 : 0,
            transition: "opacity 120ms ease, transform 120ms ease",
          }}
          onMouseEnter={showControls}
          onMouseLeave={scheduleHideControls}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={selectEdgeForInsert}
              title="Insert node here"
              className="w-6 h-6 flex items-center justify-center rounded-sm cursor-pointer  hover:text-[#4de8e8]/50 bg-[#164955] hover:border hover:border-[#4de8e8]/50"
            >
              <IoIosAdd className=" w-3 h-3  " />
            </button>
            <button
              onClick={removeEdge}
              className="w-6 h-6 flex items-center justify-center rounded-sm hover:text-[#4de8e8]/50  cursor-pointer bg-[#164955] hover:border hover:border-[#4de8e8]/50"
            >
              <FaRegTrashAlt className="text w-3 h-3" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
