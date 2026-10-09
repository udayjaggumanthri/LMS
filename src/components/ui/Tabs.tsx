import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'segmented' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  className = ''
}) => {
  if (variant === 'underline') {
    return (
      <div className={`border-b border-slate-200 ${className}`}>
        <nav className="flex space-x-6 -mb-px overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                  isActive
                    ? 'border-emerald-800 text-emerald-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-2 text-xs tabular-nums text-slate-400">
                    ({tab.count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 bg-slate-100 rounded border border-slate-200 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
              isActive
                ? 'bg-white text-slate-900 border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={isActive}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1.5 opacity-75 tabular-nums">
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
