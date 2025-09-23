"use client";

import type React from "react";
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
    data: sourceHandle,
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
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setHovered(true);
  };

  const scheduleHideControls = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setHovered(false);
      hideTimerRef.current = null;
    }, 120) as unknown as number;
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

  // Interpret edge data as a conditional handle id if it's a string
  const handleId = typeof sourceHandle === "string" ? (sourceHandle as string) : undefined;

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
        {handleId && (handleId === "true" || handleId === "false") && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${targetX}px, ${targetY}px) translate(-8px, -8px)`,
              pointerEvents: "none",
            }}
          >
            <span
              className={
                handleId === "true"
                  ? "text-[9px] px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.12)] text-emerald-300 border border-emerald-900/40"
                  : "text-[9px] px-1.5 py-0.5 rounded bg-[rgba(244,63,94,0.12)] text-rose-300 border border-rose-900/40"
              }
            >
              {handleId === "true" ? "True" : "False"}
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
              className="w-6 h-6 flex items-center justify-center rounded-sm cursor-pointer hover:text-[#1c9cf0] bg-[#061622] hover:border hover:border-[#1da1f2]"
            >
              <IoIosAdd className=" w-3 h-3  " />
            </button>
            <button
              onClick={removeEdge}
              className="w-6 h-6 flex items-center justify-center rounded-sm hover:text-[#1c9cf0] cursor-pointer bg-[#061622] hover:border hover:border-[#1da1f2]"
            >
              <FaRegTrashAlt className="w-3 h-3" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
