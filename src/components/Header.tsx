import React from 'react';
import { Utensils, Settings, Download, Calendar } from 'lucide-react';

interface HeaderProps {
  messName: string;
  onOpenSettings: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  messName,
  onOpenSettings,
  onExportCSV,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-100">
              {messName || 'Mess Tracker'}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Food Tracker System
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onExportCSV}
            title="Export CSV"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={onOpenSettings}
            title="Settings & Timings"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
