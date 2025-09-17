"use client";

import { useRouter } from "next/navigation";
import { IoAdd } from "react-icons/io5";

interface EditorHeaderProps {
  workflowId: string;
  workflowName: string;
  onSave: () => void;
  isSaving: boolean;
  onToggleNodePanel: () => void;
}

export default function EditorHeader({
  workflowName,
  onSave,
  isSaving,
  onToggleNodePanel,
}: EditorHeaderProps) {
  const router = useRouter();

  return (
    <div className="p-3 border-b border-gray-800 bg-gray-900 text-gray-100 flex items-center">
      <div className="flex space-x-4">
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-gray-300 hover:text-white"
        >
          &larr; Back
        </button>
        <h1 className="text-xl font-medium">{workflowName}</h1>
      </div>
      
      <div className="ml-auto flex items-center space-x-3">
        <button
          onClick={onToggleNodePanel}
          className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <IoAdd size={18} />
          <span>Add</span>
        </button>
        
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-700"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
