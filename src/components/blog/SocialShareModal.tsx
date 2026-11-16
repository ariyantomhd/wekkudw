// src/components/blog/SocialShareModal.tsx
import { useState } from 'react';
import { Check, Copy, ExternalLink, Share2, X } from 'lucide-react';
import type { BlogArticle } from '../../services/blogAPI';

interface SocialShareModalProps {
  article: BlogArticle | null;
  onClose: () => void;
}

const STOREFRONT_BASE_URL =
  import.meta.env.VITE_STOREFRONT_URL || 'https://themavia.com';

export function SocialShareModal({ article, onClose }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const publicUrl = `${STOREFRONT_BASE_URL.replace(/\/$/, '')}/blog/${article.slug}`;
  const encodedUrl = encodeURIComponent(publicUrl);
  const encodedTitle = encodeURIComponent(article.title);
  const encodedSummary = encodeURIComponent(
    article.excerpt || `${article.title} — Read on Themavia Blog`
  );

  const shareChannels = [
    {
      name: 'X (Twitter)',
      bg: 'bg-slate-900 hover:bg-slate-800 text-white',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      bg: 'bg-[#0A66C2] hover:bg-[#0958a8] text-white',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      bg: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      bg: 'bg-[#25D366] hover:bg-[#20bd5a] text-slate-950',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedUrl}`,
    },
    {
      name: 'Telegram',
      bg: 'bg-[#229ED9] hover:bg-[#1d8ec4] text-white',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedSummary}`,
    },
    {
      name: 'Reddit',
      bg: 'bg-[#FF4500] hover:bg-[#e03d00] text-white',
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
  ];

  const handleCopy = () => {
    navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Share2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-black">Share Article to Social Media</h2>
              <p className="text-[11px] text-slate-400 truncate max-w-75">
                {article.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Copy Direct Link */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Public Storefront Article URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-orange-500 text-white px-4 py-2.5 text-xs font-extrabold transition cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* One-Click Social Share Grid */}
          <div className="space-y-2">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              One-Click Social Distribution
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {shareChannels.map((channel) => (
                <a
                  key={channel.name}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition ${channel.bg}`}
                >
                  <span>{channel.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}