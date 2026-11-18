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
  Loader2,
  ChevronUp,
  ChevronDown,
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
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

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

  const handleMoveCustomField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= customFields.length) return;
    const updated = [...customFields];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setCustomFields(updated);
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
      customFields: customFields
        .filter((f) => f.name.trim() !== "")
        .map((f) => ({
          ...f,
          name: f.name.trim(),
          placeholder: f.placeholder?.trim() || undefined,
          options:
            f.type === "select"
              ? (f.options || []).map((o) => o.trim()).filter(Boolean)
              : undefined,
        })),
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
    setDeletingServiceId(id);
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service");
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting service");
    } finally {
      setDeletingServiceId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-600 text-white rounded-xl shadow-sm">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {viewMode === "list"
                  ? "Manage Services & Custom Form Fields"
                  : viewMode === "create"
                  ? "Create New Service with Custom Fields"
                  : "Edit Service & Form Fields"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* VIEW 1: Service List */}
        {viewMode === "list" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">
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
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 mt-0.5">
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
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 px-1.5 py-0.5 rounded">
                            {st.code || "SRV"}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-900">
                            {cfg.template}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-slate-500 dark:text-slate-400 text-xs">
                          <span>{getServiceDisplayDescription(st)}</span>
                          {cfg.customFields && cfg.customFields.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900">
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
                        disabled={deletingServiceId === st.id}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
                        title="Configure form fields"
                      >
                        <Settings2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(st.id, st.name)}
                        disabled={deletingServiceId === st.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete service"
                      >
                        {deletingServiceId === st.id ? (
                          <Loader2 size={16} className="animate-spin text-rose-500" />
                        ) : (
                          <Trash2 size={16} />
                        )}
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
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">
                1. Service Identity
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">
                    Service Name * (e.g. Flight Ticket, Train Ticket, Tatkal Passport)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Train Ticket"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">
                    Service Short Code (e.g. TRAIN, FLIGHT, BUS)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRAIN"
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">
                  Service Description (Human Friendly)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Domestic & International airline tickets, Tatkal bookings, Visa assistance..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Template Picker */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">
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
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-white" : "text-sky-600 dark:text-sky-400"} />
                        <span className="text-xs">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2: Service Fields (Unified Custom Fields Builder) */}
            <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-sky-950 dark:text-sky-200 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Plus size={15} className="text-sky-600" />
                    2. Service Form Fields ({customFields.length})
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure the input fields for this service
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
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-sky-200 dark:border-sky-800 text-center space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No custom fields added yet for this service.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-lg text-xs font-bold transition"
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
                      className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-slate-800 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Reordering Up/Down controls */}
                          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveCustomField(idx, "up")}
                              className="p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-25 disabled:hover:text-slate-500 rounded hover:bg-white dark:hover:bg-slate-700 transition"
                              title="Move field up"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === customFields.length - 1}
                              onClick={() => handleMoveCustomField(idx, "down")}
                              className="p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-25 disabled:hover:text-slate-500 rounded hover:bg-white dark:hover:bg-slate-700 transition"
                              title="Move field down"
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>

                          <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {field.name || `Field #${idx + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(field.id)}
                          className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete field"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Field Label */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Field Name / Label *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Flight Time, Travel Date, Train Route, PNR..."
                            value={field.name}
                            onChange={(e) => handleUpdateCustomField(field.id, { name: e.target.value })}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500"
                          />
                        </div>

                        {/* Field Type Selector */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Field Input Type *
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) =>
                              handleUpdateCustomField(field.id, {
                                type: e.target.value as CustomFieldDefinition["type"],
                              })
                            }
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-sky-500"
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
                        <div className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Dropdown Choices / Options
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const current = field.options || [];
                                handleUpdateCustomField(field.id, { options: [...current, ""] });
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 bg-sky-50 dark:bg-sky-900/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 px-2.5 py-1 rounded-lg transition"
                            >
                              <Plus size={13} />
                              <span>Add Option</span>
                            </button>
                          </div>

                          {(!field.options || field.options.length === 0) ? (
                            <div className="p-3 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                              <p className="text-xs text-slate-500 dark:text-slate-400">No dropdown choices added yet.</p>
                              <button
                                type="button"
                                onClick={() => handleUpdateCustomField(field.id, { options: [""] })}
                                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                              >
                                <Plus size={12} /> Click here to add first choice
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {field.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 w-5 text-right">
                                    {optIdx + 1}.
                                  </span>
                                  <input
                                    type="text"
                                    placeholder={`e.g. Choice ${optIdx + 1} (e.g. Sleeper, AC 3-Tier)`}
                                    value={opt}
                                    onChange={(e) => {
                                      const next = [...(field.options || [])];
                                      next[optIdx] = e.target.value;
                                      handleUpdateCustomField(field.id, { options: next });
                                    }}
                                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = (field.options || []).filter((_, idx) => idx !== optIdx);
                                      handleUpdateCustomField(field.id, { options: next });
                                    }}
                                    className="p-2 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                                    title="Remove this option"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Each choice will appear individually in the booking dropdown selector.
                          </p>
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
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-xs rounded-xl"
              >
                Back to List
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Saving Service...</span>
                  </>
                ) : viewMode === "edit" ? (
                  "Update Service"
                ) : (
                  "Create Service"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Active services appear directly in new booking forms.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
