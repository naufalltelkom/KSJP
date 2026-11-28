import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePwaInstall } from '../context/PwaContext';
import KsjpSplashOverlay from './KsjpSplashOverlay';

const DEMO_ACCOUNTS = [
  {
    label: 'Naufal Azka Ilhami',
    identifier: '541251216',
    password: 'stematel2026',
    desc: 'Siswa XI PPLG 4 • NIS 541251216',
  },
  {
    label: 'Naufal Mirza Nugraha',
    identifier: '541251217',
    password: 'stematel2026',
    desc: 'Siswa XI PPLG 4 • NIS 541251217',
  },
  {
    label: 'Rafasyah Javas Nararya',
    identifier: '541251248',
    password: 'stematel2026',
    desc: 'Siswa XI PPLG 4 • NIS 541251248',
  },
];

const STAFF_ACCOUNTS = [
  {
    label: 'Firda Ayu Nirmala, S.Kom',
    identifier: 'firda@smktelkom-pwt.sch.id',
    password: 'guru123',
    desc: 'Guru / Wali Kelas XI PPLG 4',
  },
  {
    label: 'Pengurus OSIS (OSIS)',
    identifier: 'osis@smktelkom-pwt.sch.id',
    password: 'org123',
    desc: 'Organisasi Siswa • Kalender & Kegiatan',
  },
  {
    label: 'Pengurus MPK (MPK)',
    identifier: 'mpk@smktelkom-pwt.sch.id',
    password: 'org123',
    desc: 'Organisasi Siswa • Kalender & Kegiatan',
  },
  {
    label: 'Dewan Ambalan Pramuka',
    identifier: 'pramuka@smktelkom-pwt.sch.id',
    password: 'org123',
    desc: 'Organisasi Siswa • Kalender & Kegiatan',
  },
];

export default function LoginView() {
  const { login, commitAuth } = useAuth();
  const { triggerInstall, installed, isMobileDevice } = usePwaInstall();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Decoy "Kelompok 5" hidden Admin drawer toggle
  const [kelompokRevealed, setKelompokRevealed] = useState(false);

  // Morph CTA & Animated Splash state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [splashVisible, setSplashVisible] = useState(false);
  const [splashStatus, setSplashStatus] = useState('loading');
  const pendingAuthRef = useRef(null);

  const runAuthWithSplash = async (authPromiseFactory, { targetTab = 'dashboard' } = {}) => {
    setError('');
    setLoading(true);
    setSplashVisible(true);
    setSplashStatus('loading');
    const startedAt = Date.now();

    try {
      const data = await authPromiseFactory();
      pendingAuthRef.current = data;
      const resolvedTab =
        targetTab === 'admin' || data?.user?.role === 'guru' || data?.user?.role === 'admin_organisasi'
          ? 'admin'
          : targetTab;
      try {
        localStorage.setItem('ksjp_post_login_tab', resolvedTab);
      } catch {
        // Abaikan
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < 900) {
        await new Promise((resolve) => setTimeout(resolve, 900 - elapsed));
      }
      setSplashStatus('done');
    } catch (err) {
      setSplashStatus('error');
      setSplashVisible(false);
      setLoading(false);
      setError(err.message || 'Gagal masuk. Periksa kembali NIS/Username dan kata sandi.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('NIS/Username dan kata sandi wajib diisi.');
      return;
    }

    await runAuthWithSplash(
      () => login(identifier.trim(), password, { deferCommit: true }),
      { targetTab: 'dashboard' }
    );
  };

  const applyDemo = (acc) => {
    setIdentifier(acc.identifier);
    setPassword(acc.password);
    setError('');
  };

  const loginAsStaff = async (staffAcc) => {
    setIdentifier(staffAcc.identifier);
    setPassword(staffAcc.password);
    await runAuthWithSplash(
      () => login(staffAcc.identifier, staffAcc.password, { deferCommit: true }),
      { targetTab: 'admin' }
    );
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <KsjpSplashOverlay
        visible={splashVisible}
        status={splashStatus}
        onComplete={() => {
          if (pendingAuthRef.current) {
            commitAuth(pendingAuthRef.current);
            pendingAuthRef.current = null;
          }
          setSplashVisible(false);
          setLoading(false);
        }}
      />

      {/* iOS Liquid Glass Top Navbar (Grey Glass + Black Typography) */}
      <header className="mx-3 sm:mx-6 mt-3.5 h-16 sticky top-3.5 z-20 ios-liquid-glass-nav">
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/images/ksjp-logo.png"
              alt="Logo KSJP"
              className="w-10 h-10 rounded-xl shadow-sm object-cover shrink-0 border border-white/60"
            />
            <div className="min-w-0">
              <div className="text-sm font-extrabold tracking-tight text-[#111827] truncate">
                SMK TELKOM PURWOKERTO
              </div>
              <div className="text-[11px] font-bold text-[#111827]/75 tracking-wide uppercase truncate">
                KSJP • Kalender Siswa &amp; Jadwal Pelajaran
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
            <span className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-white/50 border border-white/70 text-[#111827] font-extrabold">
              Tahun Pelajaran 2026/2027
            </span>
            {isMobileDevice && (
              <button
                type="button"
                onClick={triggerInstall}
                className="px-3.5 py-1.5 rounded-full bg-primary-container text-white hover:bg-surface-tint transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {installed ? 'check_circle' : 'install_mobile'}
                </span>
                {installed ? 'Aplikasi Aktif' : 'Install App (Android & iOS)'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Compact Red Hero */}
      <main className="flex-1">
        <div className="bg-gradient-to-br from-primary via-primary-container to-tertiary text-white pt-6 pb-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SISTEM AKADEMIK REAL-TIME • LIVE SYNC SANCTUM
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight leading-tight">
                Pusat Kalender Siswa &amp; Jadwal Pelajaran Digital
              </h1>

              <p className="text-white/85 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Akses jadwal pelajaran harian, perubahan kelas dinamis, serta kalender resmi SMK
                Telkom Purwokerto 2026/2027 cukup dengan 1x login persisten.
              </p>
            </div>

            {/* Right Info Preview on Desktop */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/80">
                  <span>Kelas Percontohan Aktif</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100">
                    29 Siswa Terdaftar
                  </span>
                </div>
                <div>
                  <div className="text-lg font-bold">XI PPLG 4</div>
                  <div className="text-xs sm:text-sm text-white/85">
                    Konsentrasi Rekayasa Perangkat Lunak
                  </div>
                </div>
                <div className="rounded-xl bg-black/15 p-2.5 text-xs space-y-0.5">
                  <div className="text-white/70">Wali Kelas</div>
                  <div className="font-semibold text-sm">Firda Ayu Nirmala, S.Kom</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping White Login Card + Right Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-10 pb-12">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left Auth Card (Masuk) */}
            <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 border border-surface-high/60">
              <div className="space-y-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  Simpan Sesi Login (1x Masuk Persisten)
                </span>

                <div>
                  <h2 className="text-2xl font-bold text-on-surface">
                    Masuk Portal Siswa &amp; Akademik
                  </h2>
                  <p className="text-sm text-secondary mt-1">
                    Gunakan NIS (contoh: <code className="font-semibold text-primary">541251004</code>)
                    atau Username/Email akun KSJP Anda.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#ba1a1a] flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="ksjp-identifier"
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                  >
                    NIS / Username
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                      badge
                    </span>
                    <input
                      id="ksjp-identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Masukkan NIS atau Username (misal 541251004)"
                      className="w-full rounded-xl bg-surface-low border border-surface-high pl-11 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ksjp-password"
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                  >
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                      lock
                    </span>
                    <input
                      id="ksjp-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full rounded-xl bg-surface-low border border-surface-high pl-11 pr-11 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-1"
                      aria-label="Tampilkan kata sandi"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Morphing CTA Button */}
                <div className="flex justify-center pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`h-12 bg-primary-container hover:bg-surface-tint text-white font-semibold text-sm shadow-md shadow-primary-container/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      loading ? 'w-12 rounded-full px-0' : 'w-full rounded-xl px-5'
                    }`}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">login</span>
                        <span>Masuk Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Akun Siswa Cepat + Hidden Kelompok 5 */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 border border-surface-high/60 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">key</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-on-surface">
                      Akun Siswa Cepat (XI PPLG 4)
                    </h3>
                    <p className="text-xs text-secondary">
                      Klik salah satu siswa untuk mengisi NIS dan kata sandi otomatis.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.identifier}
                      type="button"
                      onClick={() => applyDemo(acc)}
                      className="w-full text-left rounded-2xl bg-surface-low hover:bg-primary-fixed/40 border border-surface-high/70 p-3.5 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-bold text-on-surface">{acc.label}</div>
                        <div className="text-xs text-secondary mt-0.5">{acc.desc}</div>
                        <div className="text-[11px] font-mono text-primary mt-1">
                          {acc.identifier} / {acc.password}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl bg-surface-low p-3.5 text-xs text-secondary leading-relaxed">
                  <strong className="text-on-surface">Info Siswa:</strong> Login 1x menggunakan NIS
                  masing-masing untuk memantau jadwal pelajaran real-time, Kalender Pendidikan
                  2026/2027, dan notifikasi kelas XI PPLG 4.
                </div>

                {/* Discreet Decoy "Kelompok 5" + Eye Button Revealing Hidden Admin Shortcuts */}
                <div className="pt-1 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setKelompokRevealed((prev) => !prev)}
                    aria-label="Kelompok 5"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-secondary/75 hover:text-on-surface hover:bg-surface-low transition cursor-pointer"
                  >
                    <span>Kelompok 5</span>
                    <span className="material-symbols-outlined text-[15px]">
                      {kelompokRevealed ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>

                  {kelompokRevealed && (
                    <div className="mt-3 w-full rounded-2xl bg-[#111216] text-white p-4 space-y-3 border border-rose-500/35 shadow-lg">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                          Akses Pengelola (Guru • OSIS • MPK • Pramuka)
                        </div>
                        <div className="text-xs font-bold mt-0.5">
                          Pintasan Masuk Halaman Admin (Filament Langsung)
                        </div>
                      </div>

                      <div className="space-y-2">
                        {STAFF_ACCOUNTS.map((st) => (
                          <button
                            key={st.identifier}
                            type="button"
                            onClick={() => loginAsStaff(st)}
                            className="w-full text-left rounded-xl bg-white/8 hover:bg-rose-500/20 border border-white/10 p-2.5 transition flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                {st.label}
                              </div>
                              <div className="text-[10px] text-rose-100/75 truncate">{st.desc}</div>
                              <div className="text-[10px] font-mono text-amber-300/90 truncate mt-0.5">
                                {st.identifier} • {st.password}
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-primary-container text-white text-[10px] font-extrabold shrink-0">
                              Masuk Admin
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
