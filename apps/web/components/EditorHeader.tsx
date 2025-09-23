"use client"

import { useRouter } from "next/navigation"
import { IoAdd } from "react-icons/io5"

interface EditorHeaderProps {
  workflowId: string
  workflowName: string
  onSave: () => void
  isSaving: boolean
  onToggleNodePanel: () => void
}

export default function EditorHeader({ workflowName, onSave, isSaving, onToggleNodePanel }: EditorHeaderProps) {
  const router = useRouter()

  return (
    <div className="p-3 border-b border-border bg-sidebar text-[var(--sidebar-foreground)] flex items-center">
      <div className="flex space-x-4">
        <button onClick={() => router.push("/dashboard")} className="text-[var(--muted-foreground)] hover:text-foreground">
          &larr; Back
        </button>
        <h1 className="text-xl font-medium text-foreground">{workflowName}</h1>
      </div>

      <div className="ml-auto flex items-center space-x-3">
        <button
          onClick={onToggleNodePanel}
          className="flex items-center space-x-1 px-3 py-1.5 bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] rounded-theme hover:opacity-90"
        >
          <IoAdd size={18} />
          <span>Add</span>
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] px-4 py-2 rounded-theme hover:opacity-90 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  )
}
