import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createFilamentSso } from '../services/api';

/**
 * Halaman Admin Terintegrasi yang langsung menampilkan panel Filament Admin
 * (tanpa perlu berpindah ke website eksternal maupun tombol "Buka Filament Admin Penuh").
 */
export default function AdminPortalPage() {
  const { user } = useAuth();
  const [ssoUrl, setSsoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState('');

  const loadFilamentSession = useCallback(async () => {
    setLoading(true);
    setIframeLoaded(false);
    setError('');
    try {
      const res = await createFilamentSso();
      const url = res?.data?.sso_url;
      if (!url) {
        throw new Error('URL sesi Filament Admin tidak tersedia.');
      }
      setSsoUrl(url);
    } catch (err) {
      setError(err?.message || 'Gagal membuka Filament Admin terintegrasi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFilamentSession();
  }, [loadFilamentSession]);

  const isGuru = user?.role === 'guru';

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="flex-1 flex flex-col min-h-[calc(100dvh-185px)] lg:min-h-[calc(100dvh-120px)] rounded-[24px] sm:rounded-[28px] bg-[#09090b] border border-white/12 shadow-2xl overflow-hidden">
        {/* Compact Dark Filament Header Strip */}
        <div className="px-4 py-2.5 bg-[#121216] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)] shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-extrabold tracking-tight truncate">
                {isGuru
                  ? 'Filament Admin • Guru & Wali Kelas'
                  : 'Filament Admin • Organisasi (OSIS / MPK / Pramuka)'}
              </div>
              <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
                {user?.nama_lengkap} • Sinkronisasi Langsung Database KSJP
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadFilamentSession}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 border border-white/15 text-xs font-bold text-white inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            <span>Muat Ulang</span>
          </button>
        </div>

        {error && (
          <div className="m-4 rounded-2xl bg-red-950/60 border border-red-500/35 px-4 py-3 text-xs font-semibold text-rose-200 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadFilamentSession}
              className="px-3 py-1 rounded-full bg-[#d91e2a] text-white text-[11px] font-bold cursor-pointer shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Direct Embedded Filament Admin Viewport */}
        <div className="relative flex-1 min-h-[520px] bg-[#09090b] flex flex-col">
          {(loading || (ssoUrl && !iframeLoaded)) && (
            <div className="absolute inset-0 z-10 bg-[#09090b] flex flex-col items-center justify-center gap-3 text-white p-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d91e2a] to-[#930012] flex items-center justify-center shadow-lg shadow-rose-900/40 animate-pulse">
                <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
              </div>
              <div className="text-sm font-bold">Menyiapkan Filament Admin KSJP...</div>
              <div className="text-xs text-zinc-400 text-center max-w-sm">
                Menghubungkan sesi pengelola langsung ke panel Filament tanpa perlu login ulang.
              </div>
            </div>
          )}

          {ssoUrl && (
            <iframe
              key={ssoUrl}
              src={ssoUrl}
              title="KSJP Stematel — Filament Admin"
              onLoad={() => setIframeLoaded(true)}
              className="w-full flex-1 min-h-[520px] border-0 bg-[#09090b]"
              allow="fullscreen"
            />
          )}
        </div>
      </div>
    </div>
  );
}
