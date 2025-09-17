"use client";

import Link from "next/link";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: workflows, isLoading, error } = trpc.workflow.list.useQuery();
  const createWorkflow = trpc.workflow.create.useMutation();
  const router = useRouter();

  const handleCreateWorkflow = async () => {
    try {
      const newWorkflow = await createWorkflow.mutateAsync({
        name: "Untitled Workflow",
      });
      router.push(`/editor/${newWorkflow.id}`);
    } catch (err) {
      console.error("Failed to create workflow:", err);
      // In a real application, you would show an error message to the user
    }
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Workflows</h1>
          <button
            onClick={handleCreateWorkflow}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Workflow
          </button>
        </div>

        {workflows && workflows.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {workflows.map((workflow) => (
                <li key={workflow.id}>
                  <Link
                    href={`/editor/${workflow.id}`}
                    className="block hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-indigo-600 truncate">
                          {workflow.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              workflow.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {workflow.active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          {/* Additional workflow details could go here */}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          {/* Last updated information could go here */}
                          <p>Last updated: {workflow.updatedAt}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">No workflows found</p>
            <button
              onClick={handleCreateWorkflow}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create your first workflow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
