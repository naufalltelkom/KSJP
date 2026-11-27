import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PwaContext = createContext(null);

function detectPlatform() {
  if (typeof window === 'undefined') {
    return { isIos: false, isAndroid: false, isMobileDevice: false, isStandalone: false };
  }
  const ua = window.navigator.userAgent || '';
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobileDevice =
    isIos || isAndroid || /Mobile|Tablet|Silk|Kindle|Opera Mini|IEMobile/i.test(ua);
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator.standalone === true;

  return { isIos, isAndroid, isMobileDevice, isStandalone };
}

export function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installed, setInstalled] = useState(() => detectPlatform().isStandalone);

  const platform = useMemo(() => detectPlatform(), []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
      setGuideOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      if (choice?.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      return;
    }
    setGuideOpen(true);
  };

  const copyAppUrl = async () => {
    try {
      await window.navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard fallback failures on restricted webviews
    }
  };

  const value = {
    canNativePrompt: Boolean(deferredPrompt),
    installed,
    isIos: platform.isIos,
    isAndroid: platform.isAndroid,
    isMobileDevice: platform.isMobileDevice,
    triggerInstall,
    openGuide: () => setGuideOpen(true),
  };

  return (
    <PwaContext.Provider value={value}>
      {children}

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in">
            <div className="bg-gradient-to-r from-primary to-primary-container text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">install_mobile</span>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                    Aplikasi Web (Android &amp; iOS)
                  </div>
                  <h3 className="text-base font-extrabold leading-tight">
                    Install KSJP Stematel di HP
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
                aria-label="Tutup panduan"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-secondary leading-relaxed">
                Aplikasi ini menggunakan teknologi <strong>Web App (PWA)</strong> sehingga
                tampilannya <strong>100% sama dengan website</strong>, ringan, tanpa APK pihak
                ketiga, dan langsung terpasang di layar utama <strong>Android</strong> maupun{' '}
                <strong>iPhone / iPad (iOS)</strong>.
              </p>

              {/* iOS Instructions */}
              <div
                className={`rounded-2xl p-4 border space-y-2 ${
                  platform.isIos
                    ? 'bg-primary-fixed/35 border-primary/30'
                    : 'bg-surface-low border-surface-high/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      phone_iphone
                    </span>
                    Pengguna iPhone / iPad (iOS Safari)
                  </span>
                  {platform.isIos && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-container text-white text-[10px] font-bold">
                      Perangkat Anda
                    </span>
                  )}
                </div>
                <ol className="text-xs text-on-surface-variant space-y-1.5 list-decimal list-inside">
                  <li>
                    Buka halaman ini lewat browser <strong>Safari</strong> (bukan browser dalam
                    WhatsApp/IG).
                  </li>
                  <li>
                    Ketuk ikon <strong>Bagikan (Share)</strong>{' '}
                    <span className="inline-flex align-middle material-symbols-outlined text-[15px] text-primary">
                      ios_share
                    </span>{' '}
                    di bagian bawah layar.
                  </li>
                  <li>
                    Pilih <strong>&ldquo;Tambah ke Layar Utama&rdquo; (Add to Home Screen)</strong> →{' '}
                    <strong>Tambah</strong>.
                  </li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div
                className={`rounded-2xl p-4 border space-y-2 ${
                  platform.isAndroid
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-surface-low border-surface-high/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-700">
                      android
                    </span>
                    Pengguna Android (Chrome / Edge)
                  </span>
                  {platform.isAndroid && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      Perangkat Anda
                    </span>
                  )}
                </div>
                <ol className="text-xs text-on-surface-variant space-y-1.5 list-decimal list-inside">
                  <li>Buka halaman ini di browser <strong>Google Chrome</strong>.</li>
                  <li>
                    Ketuk tombol menu <strong>⋮</strong> di pojok kanan atas.
                  </li>
                  <li>
                    Pilih <strong>&ldquo;Instal aplikasi&rdquo;</strong> atau{' '}
                    <strong>&ldquo;Tambahkan ke layar utama&rdquo;</strong> →{' '}
                    <strong>Instal</strong>.
                  </li>
                </ol>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={copyAppUrl}
                  className="flex-1 rounded-xl bg-surface-container hover:bg-surface-high text-on-surface py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Link Tersalin!' : 'Salin Link untuk Safari/Chrome'}
                </button>
                <button
                  type="button"
                  onClick={() => setGuideOpen(false)}
                  className="rounded-xl bg-primary-container text-white py-2.5 px-5 text-xs font-bold cursor-pointer"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}

export function usePwaInstall() {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    throw new Error('usePwaInstall must be used inside PwaProvider');
  }
  return ctx;
}
