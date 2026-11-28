import { useEffect, useState } from 'react';
import {
  computeLiveSlotStatus,
  formatClockWib,
  formatJamPendek,
  formatRentangTanggal,
  formatTanggalIndo,
  getCategoryStyle,
  getMomentumLabel,
  getRoleLabel,
  toLocalDateString,
} from '../utils/date';
import { useAuth } from '../context/AuthContext';
import { usePwaInstall } from '../context/PwaContext';
import {
  getNotificationStatus,
  requestOsNotificationPermission,
} from '../utils/notifications';

export default function DashboardPage({
  jadwalData,
  kalenderItems,
  notifikasiState,
  onNavigate,
  onRefreshAll,
  loading,
}) {
  const { user } = useAuth();
  const { triggerInstall, installed, isMobileDevice } = usePwaInstall();
  const [notifPerm, setNotifPerm] = useState(() => getNotificationStatus());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const harian = jadwalData?.harian;
  const slots = harian?.jadwal || [];
  const targetDateStr = harian?.tanggal || toLocalDateString(now);

  const slotsWithLive = slots.map((slot) => ({
    slot,
    live: computeLiveSlotStatus(slot, targetDateStr, now),
  }));

  const activeEntry = slotsWithLive.find((entry) => entry.live.isLive) || null;
  const nextEntry =
    slotsWithLive.find((entry) => entry.live.status === 'akan_datang' && !entry.live.isBreak) ||
    slotsWithLive.find((entry) => entry.live.status === 'akan_datang') ||
    null;

  const momentumCount = slots.filter((s) => s.is_momentum).length;
  const pergantian = harian?.pergantian_jam || notifikasiState?.pengingat_pergantian_jam;
  const unreadCount = notifikasiState?.unreadCount || 0;
  const notifList = notifikasiState?.items || [];

  const todayIso = targetDateStr;
  const upcomingAgenda = kalenderItems
    .filter((item) => (item.tanggal_selesai || item.tanggal_mulai) >= todayIso)
    .slice(0, 3);

  const displayAgenda = upcomingAgenda.length > 0 ? upcomingAgenda : kalenderItems.slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Hero Greeting Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-primary via-primary-container to-tertiary text-white p-5 sm:p-6 shadow-lg shadow-primary-container/15">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {user?.kelas?.nama_kelas && (
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs">
                  {user.kelas.nama_kelas}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {getRoleLabel(user?.role)} Aktif
              </span>
              <span className="px-3 py-1 rounded-full bg-black/20 font-mono">
                {formatClockWib(now)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, senang bertemu kembali, {user?.nama_lengkap}!
            </h1>

            <p className="text-sm text-white/85 max-w-2xl">
              {user?.kelas
                ? `Konsentrasi ${user.kelas.konsentrasi} • Tahun Pelajaran ${user.kelas.tahun_ajaran}. Pantau jadwal pelajaran live, momentum guru, dan kalender resmi SMK Telkom Purwokerto.`
                : 'Sistem KSJP terhubung langsung dengan REST API Laravel Sanctum & PostgreSQL.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('jadwal')}
              className="rounded-xl bg-white text-primary font-semibold px-4 py-2.5 text-sm shadow-sm hover:bg-primary-fixed transition cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              Jadwal Hari Ini
            </button>
            {isMobileDevice && (
              <button
                type="button"
                onClick={triggerInstall}
                className="rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold px-4 py-2.5 text-sm transition inline-flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {installed ? 'check_circle' : 'install_mobile'}
                </span>
                {installed ? 'Aplikasi Terpasang' : 'Install App (Android & iOS)'}
              </button>
            )}
            {notifPerm === 'default' && (
              <button
                type="button"
                onClick={async () => setNotifPerm(await requestOsNotificationPermission())}
                className="rounded-xl bg-amber-400 hover:bg-amber-300 text-[#191c1d] font-bold px-4 py-2.5 text-sm transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                Aktifkan Pop-up HP
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4 KPI Stat Cards */}
      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-surface-high/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Jadwal Hari Ini
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-on-surface">
              {loading ? '...' : `${slots.length} Sesi`}
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold">
              {harian?.hari || '-'}
            </span>
          </div>
          <div className="text-xs text-secondary mt-2">
            {harian?.tanggal ? formatTanggalIndo(harian.tanggal) : 'Memuat tanggal...'}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-surface-high/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Jadwal Dinamis (Momentum)
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-on-surface">
              {loading ? '...' : `${momentumCount} Sesi`}
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                momentumCount > 0
                  ? 'bg-primary-fixed text-on-primary-fixed'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {momentumCount > 0 ? 'Ada Perubahan' : 'Normal'}
            </span>
          </div>
          <div className="text-xs text-secondary mt-2">
            Otomatis menimpa jadwal reguler pada tanggal terkait
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-surface-high/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Notifikasi Real-time
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-on-surface">
              {unreadCount} Baru
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                unreadCount > 0
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {unreadCount > 0 ? 'Perlu Dibaca' : 'Semua Dibaca'}
            </span>
          </div>
          <div className="text-xs text-secondary mt-2">
            Sinkronisasi otomatis setiap 30 detik
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-surface-high/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Agenda Kalender 26/27
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-on-surface">
              {kalenderItems.length} Agenda
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              Resmi + Org
            </span>
          </div>
          <div className="text-xs text-secondary mt-2">
            Juli 2026 – Juni 2027 (SMK Telkom Purwokerto)
          </div>
        </div>
      </section>

      {/* Main 8/4 Bento Grid */}
      <div className="grid xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns */}
        <div className="xl:col-span-8 space-y-6">
          {/* Live Real-Time Session Card */}
          {(activeEntry || nextEntry) && (
            <div className="rounded-3xl bg-white p-6 shadow-md border-l-[6px] border-l-primary-container border border-surface-high/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {activeEntry ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    SEDANG BERLANGSUNG
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                    SESI BERIKUTNYA HARI INI
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-secondary">
                  {formatClockWib(now)}
                </span>
              </div>

              {activeEntry ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-extrabold text-on-surface">
                          {activeEntry.slot.mata_pelajaran}
                        </h2>
                        {activeEntry.slot.is_momentum && (
                          <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-white text-[11px] font-bold">
                            MOMENTUM
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary mt-1">
                        <span className="font-bold text-primary">{activeEntry.slot.ruangan}</span>{' '}
                        • {activeEntry.slot.nama_guru} (
                        {formatJamPendek(activeEntry.slot.jam_mulai)} –{' '}
                        {formatJamPendek(activeEntry.slot.jam_selesai)} WIB)
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-sm font-extrabold text-emerald-700">
                        {activeEntry.live.progressPct}% • Sisa {activeEntry.live.sisaMenit} menit
                      </div>
                      {nextEntry && (
                        <div className="text-xs text-secondary mt-0.5">
                          Berikutnya: {nextEntry.slot.mata_pelajaran}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-surface-high overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-container transition-all duration-500"
                      style={{ width: `${activeEntry.live.progressPct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-on-surface">
                      {nextEntry.slot.mata_pelajaran}
                    </h2>
                    <p className="text-sm text-secondary mt-1">
                      {nextEntry.slot.ruangan} • {nextEntry.slot.nama_guru}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    Mulai dalam {nextEntry.live.sisaMenit ?? 0} menit (
                    {formatJamPendek(nextEntry.slot.jam_mulai)} WIB)
                  </div>
                </div>
              )}

              {pergantian?.pesan_pengingat && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs font-semibold text-amber-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">alarm</span>
                  {pergantian.pesan_pengingat}
                </div>
              )}
            </div>
          )}

          {/* Today's Schedule Preview */}
          <div className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-on-surface">
                  Jadwal Pelajaran Hari Ini
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  {harian?.hari}, {harian?.tanggal ? formatTanggalIndo(harian.tanggal) : ''}
                  {harian?.is_libur ? ' • Hari Libur Kalender' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRefreshAll}
                  className="p-2 rounded-xl bg-surface-low hover:bg-surface-high text-secondary transition cursor-pointer"
                  title="Sinkronkan ulang"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('jadwal')}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Lihat Jadwal Penuh
                </button>
              </div>
            </div>

            {slotsWithLive.length === 0 ? (
              <div className="rounded-2xl bg-surface-low p-6 text-center text-sm text-secondary">
                Tidak ada jadwal pelajaran reguler maupun momentum pada hari ini.
              </div>
            ) : (
              <div className="space-y-2.5">
                {slotsWithLive.map(({ slot, live }, idx) => (
                  <div
                    key={`${slot.id ?? 'm'}-${slot.momentum_id ?? idx}`}
                    className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      live.isLive
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                        : slot.is_momentum
                          ? 'bg-primary-fixed/25 border-primary-container/30'
                          : live.isBreak
                            ? 'bg-surface-container/60 border-surface-high/50'
                            : 'bg-surface-low/60 border-surface-high/70'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`px-3 py-2 rounded-xl text-center shrink-0 ${
                          live.isLive
                            ? 'bg-emerald-600 text-white'
                            : slot.is_momentum
                              ? 'bg-primary-fixed text-on-primary-fixed'
                              : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        <div className="text-xs font-bold">
                          {formatJamPendek(slot.jam_mulai)}
                        </div>
                        <div className="text-[10px] opacity-80">
                          {formatJamPendek(slot.jam_selesai)}
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-on-surface">
                            {slot.mata_pelajaran}
                          </span>

                          {live.isLive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              Sedang Berlangsung
                            </span>
                          )}

                          {slot.is_momentum && (
                            <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-white text-[10px] font-bold uppercase tracking-wide">
                              Momentum • {getMomentumLabel(slot.status_perubahan)}
                            </span>
                          )}

                          {!live.isLive && live.status === 'selesai' && (
                            <span className="px-2 py-0.5 rounded-full bg-surface-high text-secondary text-[10px] font-semibold">
                              Selesai
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-secondary mt-1">
                          {slot.nama_guru !== '-' ? `${slot.nama_guru} • ` : ''}
                          <span className="font-semibold text-on-surface">{slot.ruangan}</span>
                        </div>

                        {slot.is_momentum && slot.keterangan && (
                          <div className="text-xs text-primary mt-1 font-medium">
                            Catatan: {slot.keterangan}
                          </div>
                        )}
                      </div>
                    </div>

                    {live.isLive && (
                      <div className="text-xs font-bold text-emerald-700 shrink-0">
                        Sisa {live.sisaMenit} mnt
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Calendar Strip */}
          <div className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-surface">
                Kalender &amp; Agenda Terdekat
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('kalender')}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Buka Matriks 12 Bulan
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {displayAgenda.map((item) => {
                const style = getCategoryStyle(item.kategori, item.sumber);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-surface-low p-4 border border-surface-high/60 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${style.badge}`}>
                        {style.label}
                      </span>
                      <div className="font-bold text-sm text-on-surface mt-2.5 leading-snug">
                        {item.judul}
                      </div>
                    </div>
                    <div className="text-xs text-secondary">
                      <div>{formatRentangTanggal(item.tanggal_mulai, item.tanggal_selesai)}</div>
                      {item.penyelenggara && (
                        <div className="font-semibold text-on-surface-variant mt-0.5">
                          {item.penyelenggara}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Columns */}
        <div className="xl:col-span-4 space-y-6">
          {/* Wali Kelas & Kelas Card */}
          {user?.kelas && (
            <div className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">supervisor_account</span>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Wali Kelas {user.kelas.nama_kelas}
                  </div>
                  <div className="text-base font-bold text-on-surface">
                    {user.kelas.wali_kelas}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-surface-low p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-secondary">Konsentrasi</span>
                  <span className="font-semibold text-on-surface">{user.kelas.konsentrasi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Tahun Ajaran</span>
                  <span className="font-semibold text-on-surface">{user.kelas.tahun_ajaran}</span>
                </div>
              </div>
            </div>
          )}

          {/* Latest Real-time Notifications */}
          <div className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-on-surface">Warta &amp; Notifikasi</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-white text-[11px] font-bold">
                    {unreadCount} Baru
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('notifikasi')}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Semua
              </button>
            </div>

            {notifList.length === 0 ? (
              <p className="text-xs text-secondary">Belum ada notifikasi terbaru.</p>
            ) : (
              <div className="space-y-3">
                {notifList.slice(0, 4).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => onNavigate('notifikasi')}
                    className={`rounded-2xl p-3.5 border cursor-pointer transition ${
                      notif.is_read
                        ? 'bg-surface-low/60 border-surface-high/60'
                        : 'bg-primary-fixed/25 border-primary-container/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {notif.tipe}
                      </span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary-container" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-on-surface mt-1 leading-snug">
                      {notif.judul}
                    </div>
                    <p className="text-xs text-secondary mt-1 line-clamp-2">{notif.pesan}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
