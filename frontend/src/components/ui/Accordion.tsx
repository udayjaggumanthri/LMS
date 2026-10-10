import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = true,
  className = ''
}) => {
  const [openIds, setOpenIds] = useState<string[]>(() => {
    return items.filter(i => i.defaultOpen).map(i => i.id);
  });

  const toggle = (id: string) => {
    setOpenIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return allowMultiple ? [...prev, id] : [id];
    });
  };

  return (
    <div className={`divide-y divide-slate-200 border border-slate-200 rounded ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="bg-white">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              aria-expanded={isOpen}
            >
              <div className="flex-1 pr-4">
                <div className="font-semibold text-sm text-slate-900">{item.title}</div>
                {item.subtitle && <div className="text-xs text-slate-500 mt-0.5">{item.subtitle}</div>}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && <div className="px-4 pb-4 pt-1 text-sm text-slate-600 bg-white">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
};
