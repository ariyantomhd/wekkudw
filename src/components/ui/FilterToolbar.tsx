// src/components/ui/FilterToolbar.tsx
import { RefreshCw, Search } from 'lucide-react';

export interface FilterTabOption<T extends string> {
  label: string;
  value: T;
}

export interface FilterToolbarProps<T extends string> {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  tabs: Array<FilterTabOption<T>>;
  activeTab: T;
  onTabChange: (value: T) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function FilterToolbar<T extends string>({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  tabs,
  activeTab,
  onTabChange,
  onRefresh,
  refreshing = false,
}: FilterToolbarProps<T>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/70">
          {tabs.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {onRefresh && (
          <button
            type="button"
            disabled={refreshing}
            onClick={onRefresh}
            aria-label="Refresh list"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-orange-500/40 hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-orange-500' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
}