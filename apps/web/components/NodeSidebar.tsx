"use client";

import { NodeDefination, NODES_REGISTRY } from "@repo/nodes-registry";
import { useState } from "react";
import { IoSearch, IoCodeSlash, IoLayers, IoServer, IoFlash, IoRocket, IoGitBranch } from "react-icons/io5";

interface NodeSidebarProps {
  // eslint-disable-next-line no-unused-vars
  onNodeClick: (node: NodeDefination) => void;
  isOpen: boolean;
}

type NodeCategory = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  group: string;
  nodes: NodeDefination[];
};

export default function NodeSidebar({ onNodeClick, isOpen }: NodeSidebarProps) {
  const [searchText, setSearchText] = useState("");
  const availableNodes = NODES_REGISTRY;

  // Group nodes by category
  const categories: NodeCategory[] = [
    {
      title: "AI",
      description: "Build autonomous agents, summarize or search documents, etc.",
      group: "ai",
      nodes: availableNodes.filter(node => node.group === "ai")
    },
    {
      title: "Action in an app",
      description: "Do something in an app or service like Google Sheets, Telegram or Notion",
      group: "action",
      nodes: availableNodes.filter(node => node.group === "action")
    },
    {
      title: "Data transformation",
      description: "Manipulate, filter or convert data",
      group: "data",
      nodes: availableNodes.filter(node => node.group === "data")
    },
    {
      title: "Flow",
      description: "Branch, merge or loop the flow, etc.",
      group: "flow",
      nodes: availableNodes.filter(node => node.group === "flow")
    },
    {
      title: "Core",
      description: "Run code, make HTTP requests, set webhooks, etc.",
      group: "core",
      nodes: availableNodes.filter(node => node.group === "core")
    },
    {
      title: "Trigger",
      description: "Start your workflow with events or triggers",
      group: "trigger",
      nodes: availableNodes.filter(node => node.group === "trigger")
    },
  ];

  // Filter categories based on search
  const filteredCategories = searchText 
    ? categories.map(category => ({
        ...category,
        nodes: category.nodes.filter(node => 
          node.displayName.toLowerCase().includes(searchText.toLowerCase()) || 
          node.description.toLowerCase().includes(searchText.toLowerCase())
        )
      })).filter(category => category.nodes.length > 0)
    : categories;

  if (!isOpen) return null;

  const onDragStart = (event: React.DragEvent, nodeDef: NodeDefination) => {
    const payload = JSON.stringify({ nodeDef });
    event.dataTransfer.setData("application/reactflow", payload);
    // also set text/plain for better cross-browser support (e.g., Firefox)
    event.dataTransfer.setData("text/plain", payload);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-80 bg-gray-900 text-gray-100 border-l border-gray-800 overflow-y-auto h-full shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">What happens next?</h2>
          {/* We'll rely on clicking outside to close for now */}
        </div>
        
        {/* Search bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search nodes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        {/* Node categories */}
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.group} className="border border-gray-800 rounded-md overflow-hidden hover:border-indigo-500">
              <div className="flex items-center p-3 bg-gray-800 cursor-pointer">
                <div className="w-6 h-6 mr-3 flex-shrink-0">
                  {category.group === "ai" && <IoRocket className="w-5 h-5 text-purple-400" />}
                  {category.group === "action" && <IoServer className="w-5 h-5 text-blue-400" />}
                  {category.group === "data" && <IoLayers className="w-5 h-5 text-green-400" />}
                  {category.group === "flow" && <IoGitBranch className="w-5 h-5 text-yellow-400" />}
                  {category.group === "core" && <IoCodeSlash className="w-5 h-5 text-gray-300" />}
                  {category.group === "trigger" && <IoFlash className="w-5 h-5 text-red-400" />}
                </div>
                <div>
                  <h3 className="font-medium">{category.title}</h3>
                  <p className="text-xs text-gray-400">{category.description}</p>
                </div>
                <div className="ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Node list */}
              {category.nodes.length > 0 && (
                <div className="p-2 border-t border-gray-800">
                  {category.nodes.map((node) => (
                    <div 
                      key={node.type}
                      className="p-2 rounded hover:bg-gray-700 cursor-grab"
                      draggable
                      onDragStart={(e) => onDragStart(e, node)}
                      onClick={() => onNodeClick(node)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Add ${node.displayName} node`}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onNodeClick(node); }}
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-2 flex items-center justify-center bg-gray-700 rounded-sm text-xs text-gray-200">
                          {node.icon.charAt(0)}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{node.displayName}</p>
                          <p className="text-xs text-gray-400">{node.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Add another trigger section */}
          <div className="border border-gray-800 rounded-md overflow-hidden hover:border-indigo-500 mt-6">
            <div className="flex items-center p-3 bg-gray-800 cursor-pointer">
              <div className="w-6 h-6 mr-3 flex-shrink-0">
                <IoFlash className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-medium">Add another trigger</h3>
                <p className="text-xs text-gray-400">Combine multiple inputs and triggers. Workflows can have multiple triggers.</p>
              </div>
              <div className="ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
