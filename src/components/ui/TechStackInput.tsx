import { KeyboardEvent, useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface TechStackInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  disabled?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Next.js',
  'Vite',
  'Node.js',
  'Supabase',
  'PostgreSQL',
];

export function TechStackInput({
  value,
  onChange,
  suggestions = DEFAULT_SUGGESTIONS,
  disabled = false,
}: TechStackInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const normalized = raw.trim();
    if (!normalized) return;
    const exists = value.some((item) => item.toLowerCase() === normalized.toLowerCase());
    if (!exists) {
      onChange([...value, normalized]);
    }
    setDraft('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((item) => item !== tagToRemove));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const availableSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#583cf0] focus-within:ring-2 focus-within:ring-[#583cf0]/15 transition-colors">
        {value.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800"
          >
            <span>{tech}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeTag(tech)}
              aria-label={`Remove ${tech}`}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-[#583cf0] disabled:opacity-50"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) addTag(draft);
          }}
          placeholder={
            value.length === 0
              ? 'Type a technology (e.g. React) and press Enter...'
              : 'Add another stack...'
          }
          className="min-w-[180px] flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
        />
        {draft.trim() && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => addTag(draft)}
            className="inline-flex items-center gap-1 rounded-lg bg-[#583cf0] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#492de0] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Quick add:</span>
          {availableSuggestions.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              disabled={disabled}
              onClick={() => addTag(item)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-[#583cf0]/40 hover:text-[#583cf0] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              + {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
