import { FormEvent, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export interface LoginFormCardProps {
  email: string;
  password: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  apiBaseUrl?: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function LoginFormCard({
  email,
  password,
  isSubmitting,
  errorMessage,
  apiBaseUrl,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-800 flex items-start gap-2.5"
          >
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="admin@themavia.com"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-[#583cf0]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#583cf0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#492de0] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#583cf0] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span className="truncate font-mono">{apiBaseUrl || 'API endpoint configured by parent'}</span>
        <span className="whitespace-nowrap shrink-0 text-slate-400">Protected Admin</span>
      </div>
    </div>
  );
}
