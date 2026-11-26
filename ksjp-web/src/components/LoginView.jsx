import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

export default function LoginView() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('NIS/Username dan kata sandi wajib diisi.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa kembali NIS/Username dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const applyDemo = (account) => {
    setIdentifier(account.identifier);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navbar */}
      <header className="h-20 bg-white/90 backdrop-blur-xl border-b border-surface-high/60 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-on-surface">
                SMK TELKOM PURWOKERTO
              </div>
              <div className="text-[11px] font-semibold text-on-surface-variant tracking-wide uppercase">
                KSJP • Kalender Siswa & Jadwal Pelajaran
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed">
              Tahun Pelajaran 2026/2027
            </span>
            <a
              href="/downloads/ksjp-stematel.apk"
              download="KSJP-SMK-Telkom-Purwokerto.apk"
              className="px-3.5 py-1.5 rounded-full bg-primary-container text-white hover:bg-surface-tint transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">android</span>
              Download APK HP
            </a>
            <a
              href="http://127.0.0.1:8000/admin"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-high transition"
            >
              Panel Admin Filament
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero + Overlapping Card ("Merah Ditumpuk Putih") */}
      <main className="flex-1">
        <div className="bg-gradient-to-br from-primary via-primary-container to-tertiary text-white pt-10 pb-28 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SISTEM AKADEMIK REAL-TIME • LIVE SYNC SANCTUM
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-tight">
                Pusat Kalender Siswa & Jadwal Pelajaran Digital
              </h1>

              <p className="text-white/85 text-sm sm:text-base max-w-2xl leading-relaxed">
                Pantau jadwal pelajaran reguler, pembaruan mendadak{' '}
                <span className="font-semibold text-white">Jadwal Dinamis (Momentum)</span>,
                kalender pendidikan resmi 2026/2027, serta pengingat pergantian jam secara
                langsung cukup dengan 1x login persisten.
              </p>

              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-2xl bg-white/12 backdrop-blur-sm p-3.5 border border-white/15">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    Jadwal Momentum
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    Otomatis menimpa jadwal reguler saat ada guru pengganti atau pindah lab.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/12 backdrop-blur-sm p-3.5 border border-white/15">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Kalender 2026/2027
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    Matriks 12 bulan lengkap dengan agenda resmi & kegiatan OSIS/Pramuka.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/12 backdrop-blur-sm p-3.5 border border-white/15">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                    Notifikasi Real-time
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    Pengingat pergantian jam dan info perubahan jadwal seketika.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Info Preview on Desktop */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 p-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/80">
                  <span>Kelas Percontohan Aktif</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100">
                    29 Siswa Terdaftar
                  </span>
                </div>
                <div>
                  <div className="text-xl font-bold">XI PPLG 4</div>
                  <div className="text-sm text-white/85">
                    Konsentrasi Rekayasa Perangkat Lunak
                  </div>
                </div>
                <div className="rounded-xl bg-black/15 p-3 text-xs space-y-1">
                  <div className="text-white/70">Wali Kelas</div>
                  <div className="font-semibold text-sm">Firda Ayu Nirmala, S.Kom</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping White Login Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-16 pb-16">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 border border-surface-high/60">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    Simpan Sesi Login (1x Masuk Persisten)
                  </span>
                  <h2 className="text-2xl font-bold text-on-surface mt-3">
                    Masuk Portal Siswa & Akademik
                  </h2>
                  <p className="text-sm text-secondary mt-1">
                    Gunakan NIS (contoh: <code className="font-semibold text-primary">541251004</code>)
                    atau Username akun KSJP Anda.
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary-container hover:bg-surface-tint disabled:opacity-60 text-white font-semibold py-3.5 px-5 text-sm shadow-md shadow-primary-container/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  {loading ? 'Memverifikasi Sesi...' : 'Masuk Sekarang'}
                </button>
              </form>
            </div>

            {/* Quick Test Accounts Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl shadow-md shadow-black/5 p-6 border border-surface-high/60 space-y-4">
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
