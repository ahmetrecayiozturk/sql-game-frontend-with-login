"use client";

import { useState, useEffect } from "react";
import { TableIcon, TrashIcon, PlusIcon, X } from "lucide-react";
import { api } from "@/lib/api";
import { QueryResultDto } from "@/app/game/[id]/query-result.dto";

interface NewField {
  name: string;
  type: string;
}

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAssetModal({ isOpen, onClose, onSuccess }: CreateAssetModalProps) {
  const [newTableName, setNewTableName] = useState("");
  const [fields, setFields] = useState<NewField[]>([{ name: "id", type: "SERIAL" }]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewTableName("");
      setFields([{ name: "id", type: "SERIAL" }]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddField = () => setFields([...fields, { name: "", type: "TEXT" }]);
  
  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: keyof NewField, value: string) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    setIsCreating(true);
    try {
      const data = await api.post(`/creator/t/table`, {
        name: newTableName,
        columns: fields,
      }) as QueryResultDto;

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Failed to create table.");
      }
    } catch (error) {
      console.error("Error creating table:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={onClose} />

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] z-10 flex flex-col max-h-[85vh] border border-gray-200 animate-in fade-in zoom-in duration-200">
        <div className="p-6 pb-2 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TableIcon size={20} className="text-blue-600" /> Create New Asset
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Table Name</label>
              <input
                autoFocus
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="e.g. inventory_items"
                className="w-full border border-gray-300 rounded p-2 text-sm text-black focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Columns</label>
                <button type="button" onClick={handleAddField} className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
                  <PlusIcon size={14} /> Add Column
                </button>
              </div>

              <div className="space-y-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                {fields.map((field, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="column_name"
                      value={field.name}
                      onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                      className="flex-1 border border-gray-300 text-black rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                      className="w-28 border border-gray-300 text-black rounded px-2 py-1.5 text-xs focus:border-blue-500 bg-white"
                    >
                      <option value="SERIAL">ID (Auto)</option>
                      <option value="TEXT">TEXT</option>
                      <option value="INTEGER">NUMBER</option>
                      <option value="BOOLEAN">BOOL</option>
                      <option value="TIMESTAMP">DATE</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded font-medium">Cancel</button>
            <button
              type="submit"
              disabled={!newTableName.trim() || isCreating}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 shadow-sm"
            >
              {isCreating ? "Creating..." : "Create Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}