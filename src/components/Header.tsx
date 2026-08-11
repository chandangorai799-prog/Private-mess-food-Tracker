import React from 'react';
import { Settings, Download, FileText, Sparkles, Palette } from 'lucide-react';
import { MessTrackerLogo } from './MessTrackerLogo';
import { ThemePalette } from '../types';

interface HeaderProps {
  messName: string;
  activeTheme?: ThemePalette;
  onOpenSettings: () => void;
  onOpenThemeSelector: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  messName,
  activeTheme = 'emerald',
  onOpenSettings,
  onOpenThemeSelector,
  onExportCSV,
  onExportPDF,
}) => {
  return (
    <header className="sticky top-0 z-30 theme-header-bg backdrop-blur-md border-b shadow-xs px-3 sm:px-5 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Mess Name */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl theme-accent-bg p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
              <MessTrackerLogo className="w-9 h-9" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight theme-text-primary truncate">
                {messName || 'Smart Mess Tracker'}
              </h1>
              <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase theme-badge border border-current/20">
                <Sparkles className="w-2.5 h-2.5" />
                Smart Mess
              </span>
            </div>
            <p className="text-[11px] sm:text-xs theme-text-muted flex items-center gap-1.5 font-medium">
              <span className="inline-block w-2 h-2 rounded-full theme-accent-bg animate-pulse"></span>
              Live Food Tracker
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={onOpenThemeSelector}
            title="Change Theme & Dynamic Colors"
            className="p-2 sm:px-3 py-2 rounded-xl theme-accent-light border transition-all flex items-center gap-1.5 text-xs font-extrabold active:scale-95 shadow-2xs cursor-pointer"
          >
            <Palette className="w-4 h-4 theme-accent-text" />
            <span className="hidden sm:inline">Theme</span>
          </button>
          <button
            onClick={onExportPDF}
            title="Download PDF Report"
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 shadow-2xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={onExportCSV}
            title="Export CSV"
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={onOpenSettings}
            title="Settings & Timings"
            className="p-2 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 shadow-xs cursor-pointer"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

