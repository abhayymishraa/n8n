"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "../../utils/trpc";
import { CredentialType } from "../../types/credential";
import { Plus, Settings, Trash2, TestTube, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

const CREDENTIAL_TYPES = {
  [CredentialType.TELEGRAM_BOT]: {
    name: "Telegram Bot",
    description: "Send messages via Telegram bot",
    icon: "📱",
    fields: [
      { key: "token", label: "Bot Token", type: "password", placeholder: "1234567890:ABC..." },
    ],
  },
  [CredentialType.RESEND_EMAIL]: {
    name: "Resend Email",
    description: "Send emails via Resend",
    icon: "📧",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "re_..." },
    ],
  },
  [CredentialType.GEMINI_API]: {
    name: "Gemini AI",
    description: "AI text generation via Google Gemini",
    icon: "🤖",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "AI..." },
    ],
  },
  [CredentialType.OPENAI_API]: {
    name: "OpenAI",
    description: "AI text generation via OpenAI",
    icon: "🧠",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-..." },
    ],
  },
  [CredentialType.HTTP_BASIC_AUTH]: {
    name: "HTTP Basic Auth",
    description: "Basic authentication for HTTP requests",
    icon: "🔐",
    fields: [
      { key: "username", label: "Username", type: "text", placeholder: "username" },
      { key: "password", label: "Password", type: "password", placeholder: "password" },
    ],
  },
  [CredentialType.API_KEY]: {
    name: "API Key",
    description: "Generic API key authentication",
    icon: "🔑",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "your-api-key" },
      { key: "headerName", label: "Header Name", type: "text", placeholder: "Authorization" },
    ],
  },
  [CredentialType.WEBHOOK_URL]: {
    name: "Webhook URL",
    description: "Send data to webhook endpoints",
    icon: "🔗",
    fields: [
      { key: "url", label: "Webhook URL", type: "url", placeholder: "https://..." },
    ],
  },
  [CredentialType.OAUTH2]: {
    name: "OAuth 2.0",
    description: "OAuth 2.0 authentication",
    icon: "🔒",
    fields: [
      { key: "clientId", label: "Client ID", type: "text", placeholder: "client-id" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "client-secret" },
      { key: "tokenUrl", label: "Token URL", type: "url", placeholder: "https://..." },
    ],
  },
  [CredentialType.CUSTOM]: {
    name: "Custom",
    description: "Custom credential configuration",
    icon: "⚙️",
    fields: [
      { key: "data", label: "Configuration", type: "textarea", placeholder: '{"key": "value"}' },
    ],
  },
};

export default function CredentialsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<CredentialType>(CredentialType.TELEGRAM_BOT);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const { data: credentials, refetch } = trpc.credentials.list.useQuery();
  const createCredential = trpc.credentials.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      setFormData({});
    },
  });
  const updateCredential = trpc.credentials.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingCredential(null);
      setFormData({});
    },
  });
  const deleteCredential = trpc.credentials.delete.useMutation({
    onSuccess: () => refetch(),
  });
  const testCredential = trpc.credentials.test.useMutation();
  const testConnectivity = trpc.credentials.testConnectivity.useMutation();

  const handleCreate = () => {
    createCredential.mutate({
      name: formData?.name || `${CREDENTIAL_TYPES[selectedType].name} Credential`,
      type: selectedType,
      data: formData || {},
    });
  };

  const handleUpdate = () => {
    if (editingCredential) {
      updateCredential.mutate({
        id: editingCredential.id,
        name: formData?.name || editingCredential.name,
        data: formData || {},
      });
    }
  };

  const handleTest = async () => {
    try {
      const result = await testCredential.mutateAsync({
        type: selectedType,
        data: formData || {},
      });
      alert(result.message);
    } catch (error) {
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTestConnectivity = async () => {
    try {
      const result = await testConnectivity.mutateAsync();
      alert(result.message);
    } catch (error) {
      alert(`Connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openCreateModal = () => {
    setFormData({});
    setShowCreateModal(true);
  };

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const getCredentialTypeInfo = (type: CredentialType) => CREDENTIAL_TYPES[type] || CREDENTIAL_TYPES[CredentialType.CUSTOM];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-black">n8n Agentic</h1>
              <nav className="flex space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-black">
                  Workflows
                </Link>
                <Link href="/credentials" className="text-black font-medium">
                  Credentials
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Credentials</h1>
              <p className="mt-2 text-gray-600">
                Manage your API keys and authentication credentials for workflow nodes
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials?.map((credential: any) => {
            const typeInfo = getCredentialTypeInfo(credential.type);
            return (
              <div
                key={credential.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{credential.name}</h3>
                      <p className="text-sm text-gray-500">{typeInfo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingCredential(credential);
                        setSelectedType(credential.type);
                        setFormData(credential.data as Record<string, string>);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCredential.mutate({ id: credential.id })}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{typeInfo.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(credential.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {credentials?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first credential</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Credential
            </button>
          </div>
        )}
      </div>

      {(showCreateModal || editingCredential) && (
        <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCredential ? "Edit Credential" : "Add New Credential"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCredential(null);
                    setFormData({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-black">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credential Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value as CredentialType);
                      setFormData({});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={!!editingCredential}
                  >
                    {Object.entries(CREDENTIAL_TYPES).map(([type, info]) => (
                      <option key={type} value={type}>
                        {info.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData?.name || ""}
                    onChange={(e) => setFormData(prev => ({ ...(prev || {}), name: e.target.value }))}
                    placeholder="My Telegram Bot"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {getCredentialTypeInfo(selectedType).fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={field.type === "password" && !showPasswords[field.key] ? "password" : "text"}
                        value={formData?.[field.key] || ""}
                        onChange={(e) => setFormData(prev => ({ ...(prev || {}), [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {field.type === "password" && (
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(field.key)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords[field.key] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex w-full items-center justify-between pt-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingCredential(null);
                        setFormData({});
                        setSelectedType(CredentialType.TELEGRAM_BOT);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingCredential ? handleUpdate : handleCreate}
                      disabled={createCredential.isPending || updateCredential.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {createCredential.isPending || updateCredential.isPending
                        ? "Saving..."
                        : editingCredential
                        ? "Update"
                        : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
