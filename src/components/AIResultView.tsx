import { motion } from 'motion/react';
import { 
  AlertCircle, 
  Lightbulb, 
  Terminal, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Bug 
} from 'lucide-react';
import { DebugResult } from '../types';
import { CodeBlock } from './CodeBlock';
import { cn } from '../lib/utils';

interface AIResultViewProps {
  result: DebugResult;
  language: string;
}

export function AIResultView({ result, language }: AIResultViewProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      {/* Summary & Beginner Explainer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/60 backdrop-blur-md hover:bg-slate-900/50 transition-colors shadow-2xl">
          <div className="flex items-center gap-2.5 mb-4 text-brand-light">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-500">Executive Summary</h3>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-200 font-medium">{result.summary}</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/60 backdrop-blur-md hover:bg-slate-900/50 transition-colors shadow-2xl">
          <div className="flex items-center gap-2.5 mb-4 text-emerald-400">
            <Lightbulb className="w-4 h-4" />
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-500">Conceptual Model</h3>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-400 italic">"{result.beginnerExplanation}"</p>
        </div>
      </div>

      {/* Root Cause Detail */}
      <div className="relative p-8 rounded-3xl border border-slate-800 bg-[#0b1120] shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity">
          <Bug className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h3 className="text-[10px] font-extrabold text-brand-light uppercase tracking-[0.25em] mb-4">Deep Root Cause</h3>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-3xl font-mono">
            {result.rootCause}
          </p>
        </div>
      </div>

      {/* Corrected Code Block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[#010409] border border-slate-800 flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Corrected Implementation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 px-2 py-1 bg-slate-800/50 rounded-md">
              {language.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="p-2">
           <CodeBlock code={result.correctedCode} language={language} className="border-0 rounded-xl bg-transparent" />
        </div>
      </motion.div>

      {/* Suggested Fix */}
      <div className="p-8 rounded-2xl bg-slate-900/20 border border-slate-800/60 transition-all hover:border-slate-700">
        <div className="flex items-center gap-3 mb-6 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Resolution Strategy</h3>
        </div>
        <div className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-wrap space-y-4">
          {result.suggestedFix.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>

      {/* Prevention Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.preventionTips.split('\n').filter(t => t.trim()).slice(0, 3).map((tip, i) => (
          <div key={i} className="flex flex-col p-6 rounded-2xl bg-slate-900/10 border border-slate-800/40 hover:border-brand/40 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-emerald-500 group-hover:bg-brand/10 group-hover:text-brand transition-all">
               <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[13px] text-slate-400 leading-normal font-medium group-hover:text-slate-200 transition-colors">
              {tip.startsWith('-') || tip.match(/^\d\./) ? tip.replace(/^[- \d\.]+/, '').trim() : tip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
