import React, { useState, useRef, useEffect } from 'react';
import { MessSettings, DEFAULT_MEAL_PRICE, ThemePalette } from '../types';
import { format12HourTime } from '../utils/dateUtils';
import {
  X,
  Clock,
  Download,
  Upload,
  Trash2,
  Save,
  AlertTriangle,
  Building,
  FileJson,
  FileText,
  IndianRupee,
  CheckCircle2,
  Palette,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: MessSettings;
  onClose: () => void;
  onSaveSettings: (newSettings: MessSettings) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onRestoreJSON: (jsonStr: string) => void;
  onRequestResetData: (allData: boolean) => void;
}

const THEME_ACCENTS: { id: ThemePalette; name: string; color: string; bg: string }[] = [
  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-600', bg: 'bg-emerald-50' },
  { id: 'sapphire', name: 'Sapphire', color: 'bg-blue-600', bg: 'bg-blue-50' },
  { id: 'sunset', name: 'Sunset', color: 'bg-orange-600', bg: 'bg-orange-50' },
  { id: 'purple', name: 'Purple', color: 'bg-violet-600', bg: 'bg-violet-50' },
  { id: 'rose', name: 'Rose', color: 'bg-rose-600', bg: 'bg-rose-50' },
  { id: 'dark', name: 'Dark', color: 'bg-slate-900', bg: 'bg-slate-800' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
  onExportCSV,
  onExportPDF,
  onExportJSON,
  onRestoreJSON,
  onRequestResetData,
}) => {
  const [form, setForm] = useState<MessSettings>(settings);
  const [priceInput, setPriceInput] = useState<string>(
    String(settings.mealPrice ?? DEFAULT_MEAL_PRICE)
  );
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSuccess, setPriceSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(settings);
      setPriceInput(String(settings.mealPrice ?? DEFAULT_MEAL_PRICE));
      setPriceError(null);
      setPriceSuccess(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const validateAndParsePrice = (valStr: string): number | null => {
    if (!valStr.trim()) {
      setPriceError('Please enter a meal price amount.');
      return null;
    }
    const num = parseFloat(valStr);
    if (isNaN(num)) {
      setPriceError('Please enter a valid numeric amount.');
      return null;
    }
    if (num <= 0) {
      setPriceError('Meal price must be greater than ₹0.');
      return null;
    }
    setPriceError(null);
    return num;
  };

  const handleSavePriceOnly = () => {
    const validPrice = validateAndParsePrice(priceInput);
    if (validPrice === null) return;

    const updatedSettings = { ...form, mealPrice: validPrice };
    setForm(updatedSettings);
    onSaveSettings(updatedSettings);
    setPriceSuccess(`Meal price updated to ₹${validPrice} / meal.`);

    setTimeout(() => {
      setPriceSuccess(null);
    }, 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPrice = validateAndParsePrice(priceInput);
    if (validPrice === null) return;

    const updatedSettings = { ...form, mealPrice: validPrice };
    onSaveSettings(updatedSettings);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onRestoreJSON(content);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Mess Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto">
          {/* Meal Price Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                Meal Rate (Per Meal)
              </label>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ₹{form.mealPrice ?? DEFAULT_MEAL_PRICE} / meal
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-semibold">
              Set individual price per meal. New entries will use this rate. Past entries retain their original recorded price.
            </p>

            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={priceInput}
                  onChange={(e) => {
                    setPriceInput(e.target.value);
                    if (priceError) setPriceError(null);
                  }}
                  placeholder="e.g. 44, 50, 60"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                />
              </div>

              <button
                type="button"
                onClick={handleSavePriceOnly}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                Save Rate
              </button>
            </div>

            {/* Price Validation Error */}
            {priceError && (
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {priceError}
              </p>
            )}

            {/* Price Success Feedback */}
            {priceSuccess && (
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {priceSuccess}
              </p>
            )}
          </div>

          {/* Mess Name */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              Mess Name
            </label>
            <input
              type="text"
              value={form.messName || ''}
              onChange={(e) => setForm({ ...form, messName: e.target.value })}
              placeholder="e.g. Unique Mess / Horizon Mess"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
            />
          </div>

          {/* Theme Color Selector */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              App Theme & Colors
            </label>
            <div className="grid grid-cols-3 gap-2">
              {THEME_ACCENTS.map((th) => {
                const isSelected = (form.theme || 'emerald') === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setForm({ ...form, theme: th.id })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20 shadow-2xs font-extrabold'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${th.color} shrink-0`} />
                    <span className="text-xs truncate">{th.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configured Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-1">
              Configured Meal Schedule
            </h4>

            {/* Breakfast Time */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🍳</span> Breakfast Time
                </span>
                <span className="text-[11px] text-emerald-700 font-extrabold block ml-6 mt-0.5">
                  {format12HourTime(form.breakfastTime) || '8:00 AM'}
                </span>
              </div>
              <input
                type="time"
                value={form.breakfastTime}
                onChange={(e) =>
                  setForm({ ...form, breakfastTime: e.target.value })
                }
                required
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            {/* Lunch Time */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🍛</span> Lunch Time
                </span>
                <span className="text-[11px] text-emerald-700 font-extrabold block ml-6 mt-0.5">
                  {format12HourTime(form.lunchTime) || '1:00 PM'}
                </span>
              </div>
              <input
                type="time"
                value={form.lunchTime}
                onChange={(e) => setForm({ ...form, lunchTime: e.target.value })}
                required
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            {/* Dinner Time */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🍽️</span> Dinner Time
                </span>
                <span className="text-[11px] text-emerald-700 font-extrabold block ml-6 mt-0.5">
                  {format12HourTime(form.dinnerTime) || '8:00 PM'}
                </span>
              </div>
              <input
                type="time"
                value={form.dinnerTime}
                onChange={(e) =>
                  setForm({ ...form, dinnerTime: e.target.value })
                }
                required
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Backup, Restore & Reset Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Data Backup & Export
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onExportJSON();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-emerald-600" />
                Backup JSON
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-sky-600" />
                Restore JSON
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onExportPDF();
                  onClose();
                }}
                className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                Download PDF
              </button>

              <button
                type="button"
                onClick={() => {
                  onExportCSV();
                  onClose();
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Export CSV
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onRequestResetData(false);
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-amber-600" />
              Reset Current Month Data
            </button>

            <button
              type="button"
              onClick={() => {
                onRequestResetData(true);
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Clear All Stored Records
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95 transition-all"
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


