import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { 
  Bug, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Code2, 
  Github,
  Zap,
  Terminal
} from 'lucide-react';
import { cn } from './lib/utils';
import { explainError } from './services/gemini';
import { DebugResult, DebugHistoryItem, LoadingState } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LanguageSelector } from './components/LanguageSelector';
import { ImageUpload } from './components/ImageUpload';
import { AIResultView } from './components/AIResultView';
import { HistoryList } from './components/HistoryList';
import confetti from 'canvas-confetti';

const EXAMPLE_ERRORS = [
  { img: null, lang: 'Python', text: 'TypeError: can only concatenate str (not "int") to str' },
  { img: null, lang: 'JavaScript', text: 'Uncaught TypeError: Cannot read properties of undefined (reading "map") tại processData (index.js:42)' },
];

export default function App() {
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [result, setResult] = useState<DebugResult | null>(null);
  const [history, setHistory] = useLocalStorage<DebugHistoryItem[]>('debug-mate-history', []);

  const handleAnalyze = async () => {
    if (!input && !image) {
      toast.error('Please paste an error or upload a screenshot.');
      return;
    }

    setResult(null);
    setLoading('analyzing');
    
    try {
      const response = await explainError(input, language, image || undefined);
      setResult(response);
      setLoading('idle');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#1e40af', '#ffffff']
      });

      // Save to history
      const newItem: DebugHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        input: input.substring(0, 100) || (image ? "Screenshot Analysis" : "Error Analysis"),
        language,
        hasImage: !!image,
        result: response
      };
      setHistory(prev => [newItem, ...prev].slice(0, 20));

    } catch (err: any) {
      setLoading('error');
      toast.error(err.message || 'Failed to analyze. Please try again.');
    }
  };

  const loadFromHistory = (item: DebugHistoryItem) => {
    setInput(item.input);
    setLanguage(item.language);
    setResult(item.result);
    // Scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="h-screen flex flex-col bg-[#020617] font-sans text-slate-200 overflow-hidden">
      <Toaster position="top-right" theme="dark" richColors />
      
      {/* Header */}
      <header className="h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-brand to-indigo-700 rounded-xl flex items-center justify-center shadow-2xl shadow-brand/20 group hover:scale-105 transition-transform cursor-pointer">
            <Bug className="w-5 h-5 text-white group-hover:animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold tracking-tight text-white leading-tight">
              DebugMate <span className="text-brand-light">AI</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">v2.4.0 Experimental</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center space-x-1">
          {['Debugger', 'History', 'Docs', 'Settings'].map((item) => (
            <button
              key={item}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                item === 'Debugger' 
                  ? "text-brand-light bg-brand/10 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Gemini Turbo 1.5</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors">
            <div className="w-5 h-5 text-slate-400">
               <Zap className="w-full h-full fill-current" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Input */}
        <section className="w-full max-w-[440px] border-r border-slate-800/60 p-8 flex flex-col bg-slate-950/50 overflow-y-auto custom-scrollbar">
          <div className="space-y-8 h-full flex flex-col">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="sidebar-label">Stack Context</label>
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {['JS', 'PY', 'GO'].map(abbr => (
                    <button
                      key={abbr}
                      onClick={() => setLanguage(abbr === 'JS' ? 'JavaScript' : abbr === 'PY' ? 'Python' : 'Go')}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all",
                        (language.startsWith(abbr)) ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {abbr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-indigo-500 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition-all duration-500" />
                  <div className="relative rounded-2xl border border-slate-800 bg-[#0b1120] overflow-hidden focus-within:border-brand/40 transition-colors shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border-b border-slate-800/50">
                      <Terminal className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold">Terminal / Code Buffer</span>
                    </div>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="// Drop your code or stack trace here..."
                      className="w-full h-64 bg-transparent p-5 text-[13px] font-mono text-slate-300 placeholder:text-slate-700 resize-none outline-none leading-relaxed selection:bg-brand/20"
                    />
                  </div>
                </div>

                <ImageUpload 
                  onImageSelect={setImage} 
                  className="rounded-xl overflow-hidden h-32"
                />

                <button
                  onClick={handleAnalyze}
                  disabled={loading === 'analyzing'}
                  className={cn(
                    "w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-sm uppercase tracking-[0.1em] transition-all relative overflow-hidden",
                    loading === 'analyzing'
                      ? "bg-slate-900 text-slate-600 cursor-not-allowed"
                      : "bg-white text-black hover:bg-brand hover:text-white shadow-2xl shadow-brand/10 active:scale-[0.98] group"
                  )}
                >
                  <div className="absolute inset-0 bg-white group-hover:bg-brand pointer-events-none transition-colors" />
                  <span className="relative z-10 flex items-center gap-3">
                    {loading === 'analyzing' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Neural Model...</span>
                      </>
                    ) : (
                      <>
                        <span>Explain Issue</span>
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 mt-4">
              <HistoryList 
                items={history} 
                onSelect={loadFromHistory} 
                onClear={() => setHistory([])} 
              />
            </div>
          </div>
        </section>

        {/* Right Panel: Analysis Result */}
        <section className="flex-1 p-10 overflow-y-auto bg-[#020617] scroll-smooth custom-scrollbar">
          <AnimatePresence mode="wait">
            {!result && loading === 'idle' && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 rotate-3 border border-slate-800">
                  <Sparkles className="w-10 h-10 text-slate-700" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 tracking-tight">System Ready</h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                  Provide an input on the left to begin analysis. Gemini 1.5 will generate a deep report.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  {EXAMPLE_ERRORS.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(ex.text); setLanguage(ex.lang); }}
                      className="text-left p-4 rounded-xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 transition-all group"
                    >
                      <span className="text-[10px] font-mono text-brand-light mb-2 block font-bold">{ex.lang}</span>
                      <p className="text-[11px] text-slate-400 line-clamp-2 group-hover:text-slate-300">"{ex.text}"</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="flex items-end justify-between pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-brand-light mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Analysis Pipeline v2.4</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Debug Report</h2>
                  </div>
                  <button 
                    onClick={() => { setInput(''); setImage(null); setResult(null); }}
                    className="px-4 py-2 border border-slate-800 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:border-slate-700 transition-all"
                  >
                    Clear Analysis
                  </button>
                </div>

                <AIResultView result={result} language={language} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-600 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-emerald-500 font-bold tracking-tighter">● AI AGENT READY</span>
          <span className="opacity-50">CONTEXT: ACTIVE</span>
        </div>
        <div className="flex items-center gap-4 uppercase tracking-widest">
          <span>UTF-8</span>
          <span className="text-indigo-400">DEBUGMATE v2.4.0</span>
        </div>
      </footer>
    </div>
  );
}
