import { useAuth } from '../context/AuthContext';
import { usePwaInstall } from '../context/PwaContext';
import { getRoleLabel } from '../utils/date';

export default function ProfilPage() {
  const { user, logout, syncProfile } = useAuth();
  const { triggerInstall, installed } = usePwaInstall();

  const initials = (user?.nama_lengkap || 'KS')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header Identity Card */}
      <section className="rounded-3xl bg-gradient-to-br from-primary via-primary-container to-tertiary text-white p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs text-white text-2xl font-extrabold flex items-center justify-center border border-white/25">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-50">
                  {getRoleLabel(user?.role)} Aktif
                </span>
                {user?.kelas?.nama_kelas && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20">
                    {user.kelas.nama_kelas}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold mt-1">{user?.nama_lengkap}</h1>
              <p className="text-sm text-white/85">
                NIS/Kode: {user?.nis || '-'} • Username: {user?.username}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={syncProfile}
            className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Refresh Profil
          </button>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Academic & User Info */}
        <section className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 space-y-4">
          <h2 className="text-lg font-bold text-on-surface">Data Akademik &amp; Akun</h2>

          <div className="divide-y divide-surface-high/60 text-sm">
            <div className="py-3 flex justify-between gap-4">
              <span className="text-secondary">Nama Lengkap</span>
              <span className="font-semibold text-on-surface text-right">{user?.nama_lengkap}</span>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <span className="text-secondary">NIS / Kode</span>
              <span className="font-mono font-semibold text-on-surface">{user?.nis || '-'}</span>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <span className="text-secondary">Jenis Kelamin</span>
              <span className="font-semibold text-on-surface">
                {user?.jenis_kelamin === 'L'
                  ? 'Laki-laki (L)'
                  : user?.jenis_kelamin === 'P'
                    ? 'Perempuan (P)'
                    : '-'}
              </span>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <span className="text-secondary">Email</span>
              <span className="font-semibold text-on-surface">{user?.email || '-'}</span>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <span className="text-secondary">Peran RBAC</span>
              <span className="font-semibold text-primary">{getRoleLabel(user?.role)}</span>
            </div>
            {user?.jabatan_organisasi && (
              <div className="py-3 flex justify-between gap-4">
                <span className="text-secondary">Jabatan / Organisasi</span>
                <span className="font-semibold text-on-surface">{user.jabatan_organisasi}</span>
              </div>
            )}
          </div>
        </section>

        {/* Class & Persistent Session */}
        <div className="space-y-6">
          {user?.kelas && (
            <section className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 space-y-4">
              <h2 className="text-lg font-bold text-on-surface">Informasi Kelas</h2>
              <div className="divide-y divide-surface-high/60 text-sm">
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-secondary">Kelas</span>
                  <span className="font-bold text-on-surface">{user.kelas.nama_kelas}</span>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-secondary">Konsentrasi</span>
                  <span className="font-semibold text-on-surface">{user.kelas.konsentrasi}</span>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-secondary">Wali Kelas</span>
                  <span className="font-semibold text-on-surface">{user.kelas.wali_kelas}</span>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-secondary">Tahun Pelajaran</span>
                  <span className="font-semibold text-on-surface">{user.kelas.tahun_ajaran}</span>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-surface">Keamanan &amp; Sesi Persisten</h2>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                1x Login Aktif
              </span>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Token Laravel Sanctum tersimpan aman di perangkat ini sehingga Anda tidak perlu
              login berulang kali setiap membuka portal KSJP.
            </p>
            <button
              type="button"
              onClick={triggerInstall}
              className="w-full rounded-xl bg-primary-fixed/50 hover:bg-primary-fixed text-primary-container border border-primary/20 font-bold py-3 text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {installed ? 'check_circle' : 'install_mobile'}
              </span>
              {installed ? 'Aplikasi Terpasang di Perangkat' : 'Install Aplikasi HP (Android & iOS)'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-xl bg-primary-container hover:bg-surface-tint text-white font-bold py-3 text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Keluar Sesi Akun
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
