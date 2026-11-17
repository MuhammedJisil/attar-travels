"use client";

import React, { useState } from "react";
import { ServiceType } from "@/lib/types";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Layers,
  Plane,
  Train,
  Bus,
  FileText,
  Building,
  Compass,
  Clock,
  Calendar,
  Settings2,
} from "lucide-react";
import {
  DEFAULT_TEMPLATES,
  ServiceTemplateType,
  getServiceFieldConfig,
  getServiceDisplayDescription,
  ServiceFieldDefinition,
  CustomFieldDefinition,
} from "@/lib/service-config";

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
  // Mode: "list" | "create" | "edit"
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [serviceTemplate, setServiceTemplate] = useState<ServiceTemplateType>("flight");

  // Custom Form Field configuration
  const [title, setTitle] = useState("");
  const [routeLabel, setRouteLabel] = useState("");
  const [numberLabel, setNumberLabel] = useState("");
  const [pnrLabel, setPnrLabel] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [hasTime, setHasTime] = useState(true);
  const [dateLabel, setDateLabel] = useState("Travel / Departure Date");
  const [hasReturnDate, setHasReturnDate] = useState(true);
  const [hasPax, setHasPax] = useState(true);
  const [customDesc, setCustomDesc] = useState("");
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setServiceName("");
    setServiceCode("");
    setServiceTemplate("flight");
    applyTemplate("flight");
    setCustomDesc("");
    setCustomFields([]);
    setEditingId(null);
    setError(null);
  };

  const handleAddCustomField = () => {
    const newId = `fld_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setCustomFields((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        type: "text",
        required: false,
        placeholder: "",
      },
    ]);
  };

  const handleUpdateCustomField = (id: string, updates: Partial<CustomFieldDefinition>) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const applyTemplate = (templateKey: ServiceTemplateType) => {
    const tmpl = DEFAULT_TEMPLATES[templateKey];
    setServiceTemplate(templateKey);
    setTitle(tmpl.title);
    setRouteLabel(tmpl.routeLabel);
    setNumberLabel(tmpl.numberLabel);
    setPnrLabel(tmpl.pnrLabel);
    setTimeLabel(tmpl.timeLabel);
    setHasTime(tmpl.hasTime);
    setDateLabel(tmpl.dateLabel);
    setHasReturnDate(tmpl.hasReturnDate);
    setHasPax(tmpl.hasPax);
    setCustomFields(tmpl.customFields ? JSON.parse(JSON.stringify(tmpl.customFields)) : []);
  };

  const handleOpenCreate = () => {
    resetForm();
    setViewMode("create");
  };

  const handleStartEdit = (service: ServiceType) => {
    const config = getServiceFieldConfig(service);
    setEditingId(service.id);
    setServiceName(service.name);
    setServiceCode(service.code || "");
    setServiceTemplate(config.template);
    setTitle(config.title);
    setRouteLabel(config.routeLabel);
    setNumberLabel(config.numberLabel);
    setPnrLabel(config.pnrLabel);
    setTimeLabel(config.timeLabel);
    setHasTime(config.hasTime);
    setDateLabel(config.dateLabel);
    setHasReturnDate(config.hasReturnDate);
    setHasPax(config.hasPax);
    setCustomFields(config.customFields || []);

    // Extract human description if present
    if (service.description) {
      if (service.description.startsWith("{")) {
        try {
          const parsed = JSON.parse(service.description);
          setCustomDesc(parsed.userDescription || "");
        } catch {
          setCustomDesc("");
        }
      } else {
        setCustomDesc(service.description);
      }
    } else {
      setCustomDesc("");
    }

    setViewMode("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    setLoading(true);
    setError(null);

    const configPayload: Partial<ServiceFieldDefinition> = {
      template: serviceTemplate,
      title: title || `${serviceName.trim()} Details`,
      routeLabel: routeLabel.trim() || DEFAULT_TEMPLATES[serviceTemplate].routeLabel,
      numberLabel: numberLabel.trim() || DEFAULT_TEMPLATES[serviceTemplate].numberLabel,
      pnrLabel: pnrLabel.trim() || DEFAULT_TEMPLATES[serviceTemplate].pnrLabel,
      timeLabel: timeLabel.trim() || DEFAULT_TEMPLATES[serviceTemplate].timeLabel,
      hasTime,
      dateLabel: dateLabel.trim() || DEFAULT_TEMPLATES[serviceTemplate].dateLabel,
      hasReturnDate,
      hasPax,
      userDescription: customDesc.trim() || undefined,
      customFields: customFields.filter((f) => f.name.trim() !== ""),
    };

    const finalDescription = JSON.stringify(configPayload);

    try {
      if (viewMode === "edit" && editingId) {
        const res = await fetch(`/api/services/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: serviceName.trim(),
            code: serviceCode.trim().toUpperCase() || serviceName.substring(0, 4).toUpperCase(),
            description: finalDescription,
          }),
        });
        if (!res.ok) throw new Error("Failed to update service");
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: serviceName.trim(),
            code: serviceCode.trim().toUpperCase() || serviceName.substring(0, 4).toUpperCase(),
            description: finalDescription,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Failed to create service");
        }
      }

      resetForm();
      setViewMode("list");
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving service");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the services list?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service");
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-600 text-white rounded-xl shadow-sm">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {viewMode === "list"
                  ? "Manage Services & Custom Form Fields"
                  : viewMode === "create"
                  ? "Create New Service with Custom Fields"
                  : "Edit Service & Form Fields"}
              </h3>
              <p className="text-xs text-slate-500">
                {viewMode === "list"
                  ? "Customize field labels, calendar, and time setter for each service"
                  : "Choose a template and configure labels (Flight Time, Train Time, PNR, Route...)"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (viewMode !== "list") setViewMode("list");
              else onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* VIEW 1: Service List */}
        {viewMode === "list" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                Active Services ({serviceTypes.length})
              </span>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-xs shadow-sm transition active:scale-95"
              >
                <Plus size={14} />
                <span>+ Add New Service</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {serviceTypes.map((st) => {
                const cfg = getServiceFieldConfig(st);
                return (
                  <div
                    key={st.id}
                    className="p-4 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-sky-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-sky-100 text-sky-700 mt-0.5">
                        {cfg.template === "flight" ? (
                          <Plane size={16} />
                        ) : cfg.template === "train" ? (
                          <Train size={16} />
                        ) : cfg.template === "bus" ? (
                          <Bus size={16} />
                        ) : cfg.template === "hotel" ? (
                          <Building size={16} />
                        ) : cfg.template === "passport" || cfg.template === "visa" ? (
                          <FileText size={16} />
                        ) : (
                          <Compass size={16} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            {st.code || "SRV"}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                            {cfg.template}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-slate-500 text-xs">
                          <span>{getServiceDisplayDescription(st)}</span>
                          {cfg.customFields && cfg.customFields.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                {cfg.customFields.length} Form Fields
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleStartEdit(st)}
                        className="p-2 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                        title="Configure form fields"
                      >
                        <Settings2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(st.id, st.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete service"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: Create / Edit Service Form */}
        {viewMode !== "list" && (
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
            {/* Step 1: Basic Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                1. Service Identity
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">
                    Service Name * (e.g. Flight Ticket, Train Ticket, Tatkal Passport)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Train Ticket"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">
                    Service Short Code (e.g. TRAIN, FLIGHT, BUS)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRAIN"
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Service Description (Human Friendly)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Domestic & International airline tickets, Tatkal bookings, Visa assistance..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Template Picker */}
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Choose Base Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: "flight", label: "Flight Ticket", icon: Plane },
                      { key: "train", label: "Train Ticket", icon: Train },
                      { key: "bus", label: "Bus Ticket", icon: Bus },
                      { key: "passport", label: "Passport", icon: FileText },
                      { key: "visa", label: "Visa Processing", icon: FileText },
                      { key: "hotel", label: "Hotel / Stay", icon: Building },
                      { key: "tour", label: "Tour Package", icon: Compass },
                      { key: "custom", label: "Custom Service", icon: Settings2 },
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon;
                    const isSelected = serviceTemplate === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => applyTemplate(t.key)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                          isSelected
                            ? "bg-sky-600 text-white border-sky-600 shadow-sm font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-white" : "text-sky-600"} />
                        <span className="text-xs">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2: Service Fields (Unified Custom Fields Builder) */}
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-sky-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Plus size={15} className="text-sky-600" />
                    2. Service Form Fields ({customFields.length})
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Add any fields you need (Time Setter, Calendar Date, Text, Number, Dropdown)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-xs transition self-start sm:self-auto active:scale-95"
                >
                  <Plus size={14} />
                  <span>+ Add Field</span>
                </button>
              </div>

              {customFields.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border border-dashed border-sky-200 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    No custom fields added yet for this service.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-lg text-xs font-bold transition"
                  >
                    <Plus size={13} />
                    <span>Click here to add your first field</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3.5 bg-white rounded-xl border border-sky-200 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {field.name || `Field #${idx + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(field.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                          title="Delete field"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Field Label */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Field Name / Label *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Flight Time, Travel Date, Train Route, PNR..."
                            value={field.name}
                            onChange={(e) => handleUpdateCustomField(field.id, { name: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                          />
                        </div>

                        {/* Field Type Selector */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Field Input Type *
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) =>
                              handleUpdateCustomField(field.id, {
                                type: e.target.value as CustomFieldDefinition["type"],
                              })
                            }
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="time">🕒 Time Setter (Clock)</option>
                            <option value="date">📅 Date Picker (Calendar)</option>
                            <option value="text">🔤 Text Input</option>
                            <option value="number">🔢 Number</option>
                            <option value="select">📋 Dropdown List</option>
                          </select>
                        </div>
                      </div>

                      {/* Dropdown Options if select type */}
                      {field.type === "select" && (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Dropdown Choices (Separated by comma)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Sleeper, 3A, 2A, 1A or Economy, Business"
                            value={field.options?.join(", ") || ""}
                            onChange={(e) =>
                              handleUpdateCustomField(field.id, {
                                options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl"
              >
                Back to List
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {loading ? "Saving Service..." : viewMode === "edit" ? "Update Service" : "Create Service"}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>All custom service configurations are saved directly to your Neon database.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
