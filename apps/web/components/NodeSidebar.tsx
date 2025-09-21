"use client"

import type React from "react"
import { type NodeDefinition, NODES_REGISTRY } from "@repo/nodes-registry"
import { useState } from "react"
import {
  IoSearch,
  IoCodeSlash,
  IoLayers,
  IoServer,
  IoFlash,
  IoRocket,
  IoGitBranch,
  IoChevronDown,
  IoChevronForward,
} from "react-icons/io5"

interface NodeSidebarProps {
  // eslint-disable-next-line no-unused-vars
  onNodeClick: (node: NodeDefinition) => void
  isOpen: boolean
}

type NodeCategory = {
  title: string
  description: string
  icon?: React.ReactNode
  group: string
  nodes: NodeDefinition[]
}

export default function NodeSidebar({ onNodeClick, isOpen }: NodeSidebarProps) {
  const [searchText, setSearchText] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const availableNodes = NODES_REGISTRY

  // Group nodes by category
  const categories: NodeCategory[] = [
    {
      title: "AI",
      description: "Build autonomous agents, summarize or search documents, etc.",
      group: "ai",
      nodes: availableNodes.filter((node) => node.group === "ai"),
    },
    {
      title: "Action in an app",
      description: "Do something in an app or service like Google Sheets, Telegram or Notion",
      group: "action",
      nodes: availableNodes.filter((node) => node.group === "action"),
    },
    {
      title: "Data transformation",
      description: "Manipulate, filter or convert data",
      group: "data",
      nodes: availableNodes.filter((node) => node.group === "data"),
    },
    {
      title: "Flow",
      description: "Branch, merge or loop the flow, etc.",
      group: "flow",
      nodes: availableNodes.filter((node) => node.group === "flow"),
    },
    {
      title: "Core",
      description: "Run code, make HTTP requests, set webhooks, etc.",
      group: "core",
      nodes: availableNodes.filter((node) => node.group === "core"),
    },
    {
      title: "Trigger",
      description: "Start your workflow with events or triggers",
      group: "trigger",
      nodes: availableNodes.filter((node) => node.group === "trigger"),
    },
  ]

  // Filter categories based on search
  const filteredCategories = searchText
    ? categories
        .map((category) => ({
          ...category,
          nodes: category.nodes.filter(
            (node) =>
              node.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
              node.description.toLowerCase().includes(searchText.toLowerCase()),
          ),
        }))
        .filter((category) => category.nodes.length > 0)
    : categories

  const toggleCategory = (categoryGroup: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryGroup)) {
        newSet.delete(categoryGroup)
      } else {
        newSet.add(categoryGroup)
      }
      return newSet
    })
  }

  const onDragStart = (event: React.DragEvent, nodeDef: NodeDefinition) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({ nodeDef }))
    event.dataTransfer.effectAllowed = "move"

    // Add visual feedback
    const target = event.target as HTMLElement
    target.style.opacity = "0.5"
    target.style.transform = "scale(0.98)"
  }

  const onDragEnd = (event: React.DragEvent) => {
    // Reset visual feedback
    const target = event.target as HTMLElement
    target.style.opacity = "1"
    target.style.transform = "scale(1)"
  }

  if (!isOpen) return null

  return (
    <aside className="w-80 h-full bg-[rgba(10,26,32,0.9)] backdrop-blur-md border-l border-[rgba(22,73,85,0.5)] shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-[#4de8e8] tracking-tight">What happens next?</h2>
        </div>

        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="text-[#36a5a5]" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-[#4de8e8] placeholder-[#36a5a5] bg-[rgba(15,48,57,0.85)] border border-[rgba(22,73,85,0.5)] focus:outline-none focus:ring-2 focus:ring-[#4de8e8]/70 focus:border-[#4de8e8]/50 transition-all"
            placeholder="Search nodes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.group) || searchText
            const shouldShowNodes = isExpanded && category.nodes.length > 0

            return (
              <div
                key={category.group}
                className="rounded-xl overflow-hidden border border-[rgba(22,73,85,0.5)] bg-[rgba(12,32,37,0.7)] hover:border-[#4de8e8]/40 transition-colors"
              >
                <div
                  className="flex items-center p-4 cursor-pointer hover:bg-[rgba(77,232,232,0.05)] transition-colors group"
                  onClick={() => toggleCategory(category.group)}
                >
                  <div className="w-6 h-6 mr-3 flex-shrink-0 text-[#4de8e8] group-hover:text-[#4de8e8] transition-colors">
                    {category.group === "ai" && <IoRocket className="w-5 h-5" />}
                    {category.group === "action" && <IoServer className="w-5 h-5" />}
                    {category.group === "data" && <IoLayers className="w-5 h-5" />}
                    {category.group === "flow" && <IoGitBranch className="w-5 h-5" />}
                    {category.group === "core" && <IoCodeSlash className="w-5 h-5" />}
                    {category.group === "trigger" && <IoFlash className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#4de8e8] group-hover:text-[#4de8e8] transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-[11px] text-[#36a5a5] mt-0.5">{category.description}</p>
                  </div>
                  <div className="ml-auto text-[#36a5a5] group-hover:text-[#4de8e8] transition-colors">
                    {isExpanded ? <IoChevronDown className="h-5 w-5" /> : <IoChevronForward className="h-5 w-5" />}
                  </div>
                </div>

                {shouldShowNodes && (
                  <div className="p-3 border-t border-[rgba(22,73,85,0.5)] bg-[rgba(10,26,32,0.75)]">
                    {category.nodes.map((node) => (
                      <div
                        key={node.type}
                        className="p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all border border-[rgba(22,73,85,0.3)] hover:border-[#4de8e8]/50 hover:bg-[rgba(77,232,232,0.12)] hover:shadow-[0_6px_20px_rgba(77,232,232,0.18)] group mb-2"
                        draggable
                        onDragStart={(e) => onDragStart(e, node)}
                        onDragEnd={onDragEnd}
                        onClick={() => onNodeClick(node)}
                      >
                        <div className="flex items-center">
                          <span className="w-8 h-8 mr-3 flex items-center justify-center bg-[#4de8e8]/20 border border-[#4de8e8]/30 rounded-lg text-xs font-bold text-[#4de8e8] group-hover:bg-[#4de8e8]/30 group-hover:text-[#4de8e8] transition-colors">
                            {node.icon.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-[#4de8e8] group-hover:text-[#4de8e8] transition-colors">
                              {node.displayName}
                            </p>
                            <p className="text-[11px] text-[#36a5a5]">{node.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <div className="rounded-xl overflow-hidden border border-[rgba(22,73,85,0.5)] mt-5 bg-[rgba(12,32,37,0.7)]">
            <div className="flex items-center p-4 cursor-pointer hover:bg-[rgba(77,232,232,0.05)] transition-colors group">
              <div className="w-6 h-6 mr-3 flex-shrink-0">
                <IoFlash className="h-5 w-5 text-[#4de8e8] group-hover:text-[#4de8e8] transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-[#4de8e8] group-hover:text-[#4de8e8] transition-colors">
                  Add another trigger
                </h3>
                <p className="text-[11px] text-[#36a5a5] mt-0.5">
                  Triggers start your workflow. Workflows can have multiple triggers.
                </p>
              </div>
              <div className="ml-auto text-[#36a5a5] group-hover:text-[#4de8e8] transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
