import { cn } from '../lib/utils';

export const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'HTML/CSS', 'Shell/Bash'
];

interface LanguageSelectorProps {
  selected: string;
  onChange: (lang: string) => void;
  className?: string;
}

export function LanguageSelector({ selected, onChange, className }: LanguageSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
            selected === lang
              ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
              : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/10"
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
