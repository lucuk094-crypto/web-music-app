import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, ExternalLink, ShieldCheck, UserCheck } from 'lucide-react';

interface AuthRateLimitHelpProps {
  onSwitchToLogin?: () => void;
  onUseDemo?: () => void;
}

export const AuthRateLimitHelp: React.FC<AuthRateLimitHelpProps> = ({
  onSwitchToLogin,
  onUseDemo,
}) => {
  const [copied, setCopied] = useState(false);

  const guideText = `Cara mengatasi 'email rate limit exceeded' di Supabase:
1. Buka https://supabase.com/dashboard dan pilih project Anda.
2. Masuk ke menu 'Authentication' > 'Providers' > 'Email'.
3. Matikan/uncheck 'Confirm email' (Enable email confirmations) lalu klik 'Save'.
4. Sekarang Anda dan pengguna lain bisa mendaftar akun tanpa batas rate limit email!`;

  const handleCopyGuide = () => {
    navigator.clipboard.writeText(guideText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="auth-rate-limit-help-card"
      className="mb-4 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-950/40 to-zinc-900/60 p-4 text-xs text-zinc-300 shadow-lg shadow-amber-950/20"
    >
      <div className="flex items-start space-x-3 mb-2.5">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-amber-300 text-sm">
            Email Rate Limit Exceeded
          </h4>
          <p className="text-zinc-400 mt-0.5 leading-relaxed">
            Supabase membatasi pengiriman email konfirmasi bawaan (hanya 3–4 email per jam).
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-black/40 border border-zinc-800/80 p-3 space-y-2 mb-3">
        <div className="font-semibold text-emerald-400 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Solusi Cepat (Hanya 10 Detik di Supabase):</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-zinc-300 pl-1 leading-relaxed text-[11px]">
          <li>
            Buka dashboard project Anda di{' '}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              supabase.com/dashboard <ExternalLink className="w-2.5 h-2.5 inline" />
            </a>
          </li>
          <li>
            Buka menu <span className="font-semibold text-white">Authentication</span> &rarr;{' '}
            <span className="font-semibold text-white">Providers</span> &rarr;{' '}
            <span className="font-semibold text-white">Email</span>
          </li>
          <li>
            Matikan opsi <span className="font-semibold text-amber-300">&quot;Confirm email&quot;</span> lalu klik{' '}
            <span className="font-semibold text-white">Save</span>.
          </li>
        </ol>
        <p className="text-[10px] text-zinc-400 italic pt-1">
          *Setelah dimatikan, pendaftaran akun langsung aktif seketika tanpa terhalang limit pengiriman email.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopyGuide}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Langkah Solusi</span>
            </>
          )}
        </button>

        {onSwitchToLogin && (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors border border-emerald-500/30"
          >
            <span>Coba Masuk (Login)</span>
          </button>
        )}

        {onUseDemo && (
          <button
            type="button"
            onClick={onUseDemo}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors ml-auto"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Gunakan Akun Tamu</span>
          </button>
        )}
      </div>
    </div>
  );
};
