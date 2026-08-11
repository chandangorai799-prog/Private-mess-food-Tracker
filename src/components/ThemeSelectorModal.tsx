import React from 'react';
import { ThemePalette } from '../types';
import { Palette, X, Check, Sparkles, Moon, Sun, Flame, Gem, Compass } from 'lucide-react';

interface ThemeOption {
  id: ThemePalette;
  name: string;
  description: string;
  primaryColor: string;
  lightBg: string;
  icon: React.ReactNode;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  isDark?: boolean;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'emerald',
    name: 'Emerald Fresh',
    description: 'Classic healthy green theme for meal & food tracking',
    primaryColor: '#059669',
    lightBg: '#ecfdf5',
    icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
    gradient: 'from-emerald-600 to-teal-500',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Ocean',
    description: 'Cool blue & professional financial aesthetic',
    primaryColor: '#2563eb',
    lightBg: '#eff6ff',
    icon: <Gem className="w-4 h-4 text-blue-600" />,
    gradient: 'from-blue-600 to-sky-500',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
  },
  {
    id: 'sunset',
    name: 'Sunset Spice',
    description: 'Warm orange & golden food dining vibes',
    primaryColor: '#ea580c',
    lightBg: '#fff7ed',
    icon: <Flame className="w-4 h-4 text-orange-600" />,
    gradient: 'from-orange-600 to-amber-500',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
  },
  {
    id: 'purple',
    name: 'Royal Violet',
    description: 'Modern indigo & purple luxury theme',
    primaryColor: '#7c3aed',
    lightBg: '#f5f3ff',
    icon: <Palette className="w-4 h-4 text-violet-600" />,
    gradient: 'from-violet-600 to-indigo-500',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
  },
  {
    id: 'rose',
    name: 'Rose Crimson',
    description: 'Bold ruby rose & warm aesthetic',
    primaryColor: '#e11d48',
    lightBg: '#fff1f2',
    icon: <Sun className="w-4 h-4 text-rose-600" />,
    gradient: 'from-rose-600 to-pink-500',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    description: 'Sleek OLED dark mode with neon emerald accents',
    primaryColor: '#10b981',
    lightBg: '#1f2937',
    icon: <Moon className="w-4 h-4 text-emerald-400" />,
    gradient: 'from-slate-900 to-emerald-950',
    badgeBg: 'bg-slate-800',
    badgeText: 'text-emerald-400',
    isDark: true,
  },
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  activeTheme: ThemePalette;
  onSelectTheme: (theme: ThemePalette) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  activeTheme,
  onSelectTheme,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">Choose Theme & Color</h3>
              <p className="text-xs text-slate-500 font-semibold">Select your dynamic color scheme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Options Grid */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onSelectTheme(theme.id);
                  document.documentElement.setAttribute('data-theme', theme.id);
                  document.body.setAttribute('data-theme', theme.id);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50 shadow-xs ring-2 ring-slate-900/10'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Swatch Circle */}
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {theme.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">
                        {theme.name}
                      </span>
                      {theme.isDark && (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-100 border border-slate-700">
                          Dark Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {theme.description}
                    </p>
                  </div>
                </div>

                {/* Selection Radio / Check Indicator */}
                <div
                  style={{
                    backgroundColor: isSelected ? theme.primaryColor : 'transparent',
                    borderColor: isSelected ? theme.primaryColor : '#cbd5e1',
                  }}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'text-white shadow-xs' : 'bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Themes save automatically</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
