import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light theme (White)' : 'Switch to Dark theme (Black)'}
      title={isDark ? 'Switch to Light theme (White)' : 'Switch to Dark theme (Black)'}
      className={`relative inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer border ${
        isDark
          ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-800 hover:border-neutral-700 shadow-2xs'
          : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200 shadow-2xs'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-400 animate-in fade-in zoom-in-75 duration-200" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-neutral-700 animate-in fade-in zoom-in-75 duration-200" />
        )}
      </div>

      {showLabel && (
        <span className="font-mono text-[11px] tracking-tight select-none">
          {isDark ? 'Black' : 'White'}
        </span>
      )}
    </button>
  );
}

/**
 * Floating theme toggle button docked on bottom-right of viewport
 * Visible across all pages for instant 1-click theme switching
 */
export function FloatingThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <aside aria-label="Theme switcher" className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to Light theme (White)' : 'Switch to Dark theme (Black)'}
        title={isDark ? 'Current: Black (Dark). Click to switch to White (Light)' : 'Current: White (Light). Click to switch to Black (Dark)'}
        className={`group flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-200 cursor-pointer border backdrop-blur-md ${
          isDark
            ? 'bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 shadow-black/40'
            : 'bg-white/95 text-neutral-800 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 shadow-neutral-900/10'
        }`}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-700 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </div>
        <span className="text-[11px] font-mono font-medium tracking-tight pr-0.5">
          {isDark ? 'Black' : 'White'}
        </span>
      </button>
    </aside>
  );
}
