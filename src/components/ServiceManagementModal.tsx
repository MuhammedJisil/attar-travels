"use client";

import React, { useState } from "react";
import { ServiceType } from "@/lib/types";
import { X, Plus, Edit2, Trash2, Check, AlertCircle, Layers } from "lucide-react";

interface ServiceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTypes: ServiceType[];
  onRefresh: () => void;
}

export default function ServiceManagementModal({
  isOpen,
  onClose,
  serviceTypes,
  onRefresh,
}: ServiceManagementModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (service: ServiceType) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditDesc(service.description || "");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update service");
      setEditingId(null);
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error updating service");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the services list?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete service");
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting service");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to add service");
      }
      setNewName("");
      setNewDesc("");
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Manage Services Dropdown</h3>
              <p className="text-xs text-slate-400">Add, rename or remove services offered by your office</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Add New Service Form */}
          <form onSubmit={handleCreate} className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl space-y-2">
            <span className="font-bold text-sky-950 uppercase tracking-wider text-[11px] block">
              + Add New Service to Dropdown
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Service Name (e.g. Umrah Package)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
              <input
                type="text"
                placeholder="Short Description (Optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newName.trim()}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs transition disabled:opacity-50"
            >
              Add Service
            </button>
          </form>

          {/* Existing Services List */}
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block mb-2">
              Existing Services ({serviceTypes.length})
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {serviceTypes.map((service) => (
                <div key={service.id} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50">
                  {editingId === service.id ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="p-1.5 border border-sky-400 rounded-md text-xs font-semibold text-slate-900"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                        className="p-1.5 border border-slate-300 rounded-md text-xs text-slate-700"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-slate-900">{service.name}</div>
                      {service.description && (
                        <div className="text-slate-500 text-xs">{service.description}</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {editingId === service.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(service.id)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          title="Save"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(service)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg"
                          title="Edit Service"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service.id, service.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Service"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

