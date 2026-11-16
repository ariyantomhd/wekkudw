// src/components/layout/AdminLayout.tsx
import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  FileText,
  Flame,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  ReceiptText,
  Star,
  TicketPercent,
  UploadCloud,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import type { User } from '../../types/auth';

export interface AdminBreadcrumbItem {
  label: string;
  to?: string;
}

export interface AdminPrimaryAction {
  label: string;
  to: string;
}

export interface AdminLayoutProps {
  title: string;
  breadcrumbs: AdminBreadcrumbItem[];
  primaryAction?: AdminPrimaryAction;
  adminUser?: Pick<User, 'username' | 'email'> | null;
  signingOut?: boolean;
  onLogout?: () => void;
  children: ReactNode;
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Users',
    to: '/admin/users',
    icon: UserCog,
    exact: false,
  },
  {
    label: 'Products',
    to: '/admin/products',
    icon: Package,
    exact: true,
  },
  {
    label: 'Reviews',
    to: '/admin/reviews',
    icon: Star,
    exact: false,
  },
  {
    label: 'Upload Product',
    to: '/admin/products/create',
    icon: UploadCloud,
    exact: true,
  },
  {
    label: 'Orders',
    to: '/admin/orders',
    icon: ReceiptText,
    exact: false,
  },
  {
    label: 'Licenses',
    to: '/admin/licenses',
    icon: KeyRound,
    exact: false,
  },
  {
    label: 'Deals & Flash Sale',
    to: '/admin/deals',
    icon: Flame,
    exact: false,
  },
  {
    label: 'Coupons',
    to: '/admin/coupons',
    icon: TicketPercent,
    exact: false,
  },
  {
    label: 'Blog',
    to: '/admin/blog',
    icon: FileText,
    exact: false,
  },
  {
    label: 'Affiliates',
    to: '/admin/affiliates',
    icon: Users,
    exact: false,
  },
];

export function AdminLayout({
  title,
  breadcrumbs,
  primaryAction,
  adminUser = null,
  signingOut = false,
  onLogout,
  children,
}: AdminLayoutProps) {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActiveRoute = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dark Navy Sidebar Navigation (Themavia Signature Theme) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-150 ease-out lg:static lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-orange-500 rounded-lg"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-sm font-black text-white shadow-md shadow-orange-500/25">
              T
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white leading-none">
                Themavia
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400 mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
          <p className="px-3.5 pb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
            Marketplace Control
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? 'text-white' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Session Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-3">
          <div className="px-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-xs font-extrabold text-white truncate">
                {adminUser?.username || 'Administrator'}
              </p>
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5 pl-4">
              {adminUser?.email || 'Authenticated Session'}
            </p>
          </div>
          {onLogout && (
            <button
              type="button"
              disabled={signingOut}
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden shrink-0 cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs min-w-0">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div key={`${crumb.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
                    {index > 0 && (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                    {crumb.to && !isLast ? (
                      <Link
                        to={crumb.to}
                        className="font-medium text-slate-500 hover:text-orange-600 transition-colors whitespace-nowrap truncate"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={`whitespace-nowrap truncate ${
                          isLast ? 'font-extrabold text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {primaryAction && (
            <Link
              to={primaryAction.to}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs sm:text-sm font-extrabold text-white hover:bg-orange-600 transition-colors whitespace-nowrap shrink-0 shadow-xs shadow-orange-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              <Plus className="h-4 w-4" />
              <span>{primaryAction.label}</span>
            </Link>
          )}
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-340 w-full mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 text-balance">
              {title}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}