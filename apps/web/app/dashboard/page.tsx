"use client";

import Link from "next/link";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const { data: workflows, isLoading, error } = trpc.workflow.list.useQuery();
  const createWorkflow = trpc.workflow.create.useMutation();
  const router = useRouter();

  const [showNameModal, setShowNameModal] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkflow = () => {
    setWorkflowName("");
    setShowNameModal(true);
  };

  const handleSubmitWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowName.trim()) return;

    setIsCreating(true);
    try {
      const newWorkflow = await createWorkflow.mutateAsync({
        name: workflowName.trim(),
      });
      setShowNameModal(false);
      setWorkflowName("");
      router.push(`/editor/${newWorkflow.id}`);
    } catch (err) {
      console.error("Failed to create workflow:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setShowNameModal(false);
    setWorkflowName("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Failed to load workflows: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-black">Workflows</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage your automation workflows
              </p>
            </div>
            <button
              onClick={handleCreateWorkflow}
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200 font-medium"
            >
              Create Workflow
            </button>
          </div>
        </div>
      </div>

      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Create New Workflow
            </h2>
            <form onSubmit={handleSubmitWorkflow}>
              <div className="mb-4">
                <label
                  htmlFor="workflowName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Workflow Name
                </label>
                <input
                  type="text"
                  id="workflowName"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !workflowName.trim()}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black transition-colors duration-200"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {workflows && workflows.length > 0 ? (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white border border-gray-200 rounded-lg hover:border-black transition-colors duration-200"
              >
                <Link href={`/editor/${workflow.id}`} className="block">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-black truncate">
                          {workflow.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Last updated:{" "}
                          {new Date(workflow.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            workflow.active
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {workflow.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">
              No workflows yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first workflow
            </p>
            <button
              onClick={handleCreateWorkflow}
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200 font-medium"
            >
              Create your first workflow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
