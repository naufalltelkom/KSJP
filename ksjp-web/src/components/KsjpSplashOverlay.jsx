import { useEffect, useState } from 'react';

/**
 * Splash & Logo Assembly Animation terinspirasi oleh @dailyflutterui (TikTok).
 * Elemen ikon KSJP & huruf K-S-J-P dimulai terpisah pada blueprint grid gelap,
 * lalu menyatu menjadi logo KSJP + "Kalender Siswa & Jadwal Pelajaran",
 * diikuti progress persentase 0% -> 100% sesuai kecepatan login ke server.
 */
export default function KsjpSplashOverlay({
  visible,
  status = 'loading', // 'loading' | 'done' | 'error'
  onComplete,
}) {
  const [assembled, setAssembled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setAssembled(false);
      setProgress(0);
      return undefined;
    }

    const assembleTimer = setTimeout(() => setAssembled(true), 80);
    return () => clearTimeout(assembleTimer);
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;

    let rafId;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;

      if (status === 'error') {
        return;
      }

      if (status === 'done') {
        setProgress((prev) => {
          const next = prev + Math.max(2, (100 - prev) * 0.22);
          if (next >= 99.5) {
            return 100;
          }
          rafId = requestAnimationFrame(tick);
          return Math.round(next);
        });
        return;
      }

      // Selama API login berjalan: bergerak halus sampai ~88% mengikuti kecepatan nyata
      const targetWhileLoading = Math.min(88, Math.round(88 * (1 - Math.exp(-elapsed / 650))));
      setProgress((prev) => Math.max(prev, targetWhileLoading));
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [visible, status]);

  useEffect(() => {
    if (!visible || status !== 'done' || progress < 100) return undefined;
    const doneTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 360);
    return () => clearTimeout(doneTimer);
  }, [visible, status, progress, onComplete]);

  if (!visible) return null;

  const isCompleted = status === 'done' && progress >= 100;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0c0e13] text-white flex flex-col items-center justify-center px-6 overflow-hidden select-none"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }}
    >
      {/* Blueprint geometric guide rings */}
      <div
        className={`pointer-events-none absolute w-72 h-72 rounded-full border border-dashed border-white/15 transition-all duration-1000 ${
          assembled ? 'scale-100 opacity-30' : 'scale-125 opacity-65'
        }`}
      />
      <div
        className={`pointer-events-none absolute w-96 h-96 rounded-full border border-white/10 transition-all duration-1000 ${
          assembled ? 'scale-95 opacity-15' : 'scale-110 opacity-45'
        }`}
      />

      {/* Assembling Vector Emblem */}
      <div className="relative flex flex-col items-center">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg
            viewBox="0 0 160 160"
            className="w-36 h-36 overflow-visible drop-shadow-[0_18px_40px_rgba(217,30,42,0.42)]"
          >
            {/* 1. Crimson Two-Tone Rounded Square Base */}
            <g
              style={{
                transformOrigin: '80px 80px',
                transform: assembled ? 'translate(0px, 0px) scale(1)' : 'translate(0px, 16px) scale(0.76)',
                opacity: assembled ? 1 : 0.25,
                transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 550ms ease',
              }}
            >
              <defs>
                <clipPath id="ksjpBadgeClip">
                  <rect x="14" y="14" width="132" height="132" rx="30" />
                </clipPath>
              </defs>
              <g clipPath="url(#ksjpBadgeClip)">
                <rect x="14" y="14" width="66" height="132" fill="#e11d2e" />
                <rect x="80" y="14" width="66" height="132" fill="#b80d1e" />
              </g>
              <rect
                x="14"
                y="14"
                width="132"
                height="132"
                rx="30"
                fill="none"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.5"
              />
            </g>

            {/* 2. Calendar Grid + Checkmark Badge (slides from top-left) */}
            <g
              style={{
                transformOrigin: '84px 72px',
                transform: assembled
                  ? 'translate(0px, 0px) rotate(0deg)'
                  : 'translate(-44px, -42px) rotate(-14deg)',
                opacity: assembled ? 1 : 0.15,
                transition: 'transform 760ms cubic-bezier(0.22, 1, 0.36, 1) 70ms, opacity 550ms ease',
              }}
            >
              <rect x="52" y="42" width="64" height="54" rx="10" fill="#ffffff" />
              <path
                d="M52 52a10 10 0 0 1 10-10h44a10 10 0 0 1 10 10v8H52v-8Z"
                fill="#ff3b4a"
              />
              <rect x="64" y="36" width="6" height="12" rx="3" fill="#ffffff" stroke="#6d0611" strokeWidth="2" />
              <rect x="98" y="36" width="6" height="12" rx="3" fill="#ffffff" stroke="#6d0611" strokeWidth="2" />
              {/* Grid squares */}
              <rect x="65" y="66" width="8" height="7" rx="1.5" fill="#d91e2a" />
              <rect x="78" y="66" width="8" height="7" rx="1.5" fill="#d91e2a" />
              <rect x="91" y="66" width="8" height="7" rx="1.5" fill="#d91e2a" />
              <rect x="104" y="66" width="6" height="7" rx="1.5" fill="#d91e2a" />
              <rect x="65" y="77" width="8" height="7" rx="1.5" fill="#d91e2a" />
              <rect x="78" y="77" width="8" height="7" rx="1.5" fill="#d91e2a" />
              {/* Checkmark slot */}
              <rect x="91" y="77" width="9" height="8" rx="2" fill="#930012" />
              <path d="M93.2 81.2l1.6 1.6 3-3.2" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* 3. Analog Clock Dial (slides from far left) */}
            <g
              style={{
                transformOrigin: '48px 80px',
                transform: assembled
                  ? 'translate(0px, 0px) rotate(0deg) scale(1)'
                  : 'translate(-64px, 14px) rotate(-28deg) scale(0.85)',
                opacity: assembled ? 1 : 0.15,
                transition: 'transform 820ms cubic-bezier(0.22, 1, 0.36, 1) 120ms, opacity 550ms ease',
              }}
            >
              <circle cx="48" cy="80" r="20" fill="#ffffff" stroke="#640610" strokeWidth="4" />
              <circle cx="48" cy="80" r="2.2" fill="#640610" />
              <path d="M48 67v13l8-5" stroke="#640610" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* 4. Ringing Bell (swoops from top-right) */}
            <g
              style={{
                transformOrigin: '114px 44px',
                transform: assembled
                  ? 'translate(0px, 0px) rotate(0deg) scale(1)'
                  : 'translate(58px, -48px) rotate(24deg) scale(0.82)',
                opacity: assembled ? 1 : 0.15,
                transition: 'transform 820ms cubic-bezier(0.22, 1, 0.36, 1) 160ms, opacity 550ms ease',
              }}
            >
              <path
                d="M114 29c-6.5 0-11.5 4.8-12 11.2l-1.5 8.5c-.4 1.6.8 3.1 2.4 3.1h22.2c1.6 0 2.8-1.5 2.4-3.1l-1.5-8.5c-.5-6.4-5.5-11.2-12-11.2Z"
                fill="#ff3242"
                stroke="#640610"
                strokeWidth="2.5"
              />
              <circle cx="114" cy="54" r="3.5" fill="#ffffff" />
              <path d="M128 33c2.8 2.2 4.2 5.4 4.2 8.8M100 33c-2.8 2.2-4.2 5.4-4.2 8.8" stroke="#ff7a85" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            </g>

            {/* 5. Open Book Accent (rises from bottom) */}
            <g
              style={{
                transformOrigin: '86px 104px',
                transform: assembled
                  ? 'translate(0px, 0px) scale(1)'
                  : 'translate(0px, 54px) scale(0.75)',
                opacity: assembled ? 1 : 0.15,
                transition: 'transform 780ms cubic-bezier(0.22, 1, 0.36, 1) 190ms, opacity 550ms ease',
              }}
            >
              <path
                d="M54 106c12-4 22-3 32 3 10-6 20-7 32-3l-5-11c-10-3-19-2-27 4-8-6-17-7-27-4l-5 11Z"
                fill="#ffffff"
                stroke="#640610"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path d="M52 108h68" stroke="#ff4b5a" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* Separated K-S-J-P Letters Merging Together */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-3xl sm:text-4xl font-black tracking-[0.18em]">
          {[
            { ch: 'K', offset: 'translate(-36px, -18px) rotate(-15deg)', delay: '140ms' },
            { ch: 'S', offset: 'translate(-16px, 22px) rotate(12deg)', delay: '200ms' },
            { ch: 'J', offset: 'translate(16px, -22px) rotate(-10deg)', delay: '260ms' },
            { ch: 'P', offset: 'translate(36px, 18px) rotate(15deg)', delay: '320ms' },
          ].map((item) => (
            <span
              key={item.ch}
              style={{
                display: 'inline-block',
                transform: assembled ? 'translate(0px, 0px) rotate(0deg)' : item.offset,
                opacity: assembled ? 1 : 0,
                transition: `transform 750ms cubic-bezier(0.22, 1, 0.36, 1) ${item.delay}, opacity 500ms ease ${item.delay}`,
              }}
            >
              {item.ch}
            </span>
          ))}
        </div>

        {/* Full Subtitle */}
        <p
          className="mt-1.5 text-xs sm:text-sm font-semibold tracking-wide text-rose-200/90 text-center"
          style={{
            transform: assembled ? 'translateY(0)' : 'translateY(14px)',
            opacity: assembled ? 1 : 0,
            transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1) 420ms, opacity 500ms ease 420ms',
          }}
        >
          Kalender Siswa &amp; Jadwal Pelajaran
        </p>

        {/* 0% -> 100% Login Speed Percentage Bar */}
        <div
          className="mt-8 w-64 sm:w-72 space-y-2.5"
          style={{
            opacity: assembled ? 1 : 0,
            transform: assembled ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 500ms ease 480ms',
          }}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              {isCompleted ? (
                <>
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white inline-flex items-center justify-center text-[11px]">
                    ✓
                  </span>
                  <span className="text-emerald-400">Sesi Terverifikasi</span>
                </>
              ) : (
                <span>Menghubungkan ke Portal...</span>
              )}
            </span>
            <span className="font-mono text-sm font-extrabold text-rose-400 tabular-nums">
              {progress}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff4d5a] via-[#d91e2a] to-amber-400 transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
