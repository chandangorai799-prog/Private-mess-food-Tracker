import React, { useState } from 'react';
import { MessSettings } from '../types';
import { X, Clock, Download, Trash2, Save, AlertTriangle, Building } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: MessSettings;
  onClose: () => void;
  onSaveSettings: (newSettings: MessSettings) => void;
  onExportCSV: () => void;
  onRequestResetData: (allData: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
  onExportCSV,
  onRequestResetData,
}) => {
  const [form, setForm] = useState<MessSettings>(settings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Mess Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto">
          {/* Mess Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Mess Name
            </label>
            <input
              type="text"
              value={form.messName || ''}
              onChange={(e) => setForm({ ...form, messName: e.target.value })}
              placeholder="e.g. Unique Mess / Horizon Mess"
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Configured Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-1">
              Configured Meal Timings
            </h4>

            {/* Breakfast Time */}
            <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <span className="text-sm font-semibold flex items-center gap-2">
                <span>🍳</span> Breakfast Time
              </span>
              <input
                type="time"
                value={form.breakfastTime}
                onChange={(e) =>
                  setForm({ ...form, breakfastTime: e.target.value })
                }
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Lunch Time */}
            <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <span className="text-sm font-semibold flex items-center gap-2">
                <span>🍛</span> Lunch Time
              </span>
              <input
                type="time"
                value={form.lunchTime}
                onChange={(e) => setForm({ ...form, lunchTime: e.target.value })}
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Dinner Time */}
            <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <span className="text-sm font-semibold flex items-center gap-2">
                <span>🍽️</span> Dinner Time
              </span>
              <input
                type="time"
                value={form.dinnerTime}
                onChange={(e) =>
                  setForm({ ...form, dinnerTime: e.target.value })
                }
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Data Export & Reset Actions */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Data Management
            </h4>

            <button
              type="button"
              onClick={() => {
                onExportCSV();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export Selected Month as CSV
            </button>

            <button
              type="button"
              onClick={() => {
                onRequestResetData(false);
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-amber-400" />
              Reset Current Month Data
            </button>

            <button
              type="button"
              onClick={() => {
                onRequestResetData(true);
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Clear All Stored Records
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
