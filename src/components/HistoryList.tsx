import { DebugHistoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { History, Trash2, ChevronRight, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface HistoryListProps {
  items: DebugHistoryItem[];
  onSelect: (item: DebugHistoryItem) => void;
  onClear: () => void;
}

export function HistoryList({ items, onSelect, onClear }: HistoryListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-500">
          <History className="w-3.5 h-3.5" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest">History</h3>
        </div>
        <button
          onClick={onClear}
          className="text-slate-600 hover:text-red-400 transition-colors"
          title="Clear history"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onSelect(item)}
              className="w-full text-left p-3 rounded-lg hover:bg-slate-900/50 group flex items-start gap-3 transition-colors border border-transparent hover:border-slate-800"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono text-brand-light bg-brand/10 px-1.5 py-0.5 rounded font-bold">
                    {item.language}
                  </span>
                  <div className="flex items-center gap-1 text-slate-600 text-[10px] font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 truncate group-hover:text-slate-300 transition-colors">
                  {item.input || (item.hasImage ? "Analyzed screenshot" : "Untyped input")}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-brand-light transition-colors self-center" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
