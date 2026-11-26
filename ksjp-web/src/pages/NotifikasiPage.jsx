import { useMemo, useState } from 'react';
import { usePwaInstall } from '../context/PwaContext';
import { formatJamPendek } from '../utils/date';
import {
  getNotificationStatus,
  requestOsNotificationPermission,
  showOsPopupNotification,
} from '../utils/notifications';

const TIPE_META = {
  momentum: {
    label: 'Jadwal Momentum',
    icon: 'bolt',
    badge: 'bg-primary-fixed text-on-primary-fixed',
    iconWrap: 'bg-primary-fixed text-primary',
  },
  kalender: {
    label: 'Agenda Kalender',
    icon: 'calendar_month',
    badge: 'bg-blue-50 text-blue-700',
    iconWrap: 'bg-blue-50 text-blue-700',
  },
  pergantian_jam: {
    label: 'Pergantian Jam',
    icon: 'alarm',
    badge: 'bg-emerald-50 text-emerald-700',
    iconWrap: 'bg-emerald-50 text-emerald-700',
  },
  pengumuman: {
    label: 'Pengumuman',
    icon: 'campaign',
    badge: 'bg-surface-container text-on-surface-variant',
    iconWrap: 'bg-surface-container text-on-surface-variant',
  },
};

export default function NotifikasiPage({
  notifikasiState,
  onMarkRead,
  onMarkAllRead,
  onRefresh,
}) {
  const { isIos, installed, triggerInstall } = usePwaInstall();
  const [filterTipe, setFilterTipe] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifPerm, setNotifPerm] = useState(() => getNotificationStatus());

  const handleEnablePopup = async () => {
    const status = await requestOsNotificationPermission();
    setNotifPerm(status);
  };

  const handleTestPopup = async () => {
    await showOsPopupNotification(
      'Tes Notifikasi KSJP Stematel',
      'Notifikasi pop-up berhasil tampil di perangkat Anda.',
      `ksjp-test-${Date.now()}`
    );
  };

  const items = notifikasiState?.items || [];
  const unreadCount = notifikasiState?.unreadCount || 0;
  const pergantian = notifikasiState?.pengingat_pergantian_jam;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filterTipe !== 'all' && item.tipe !== filterTipe) return false;
      if (unreadOnly && item.is_read) return false;
      return true;
    });
  }, [items, filterTipe, unreadOnly]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
            PORTAL KSJP &gt; NOTIFIKASI REAL-TIME
          </div>
          <h1 className="text-2xl font-extrabold text-on-surface mt-1">
            Pusat Notifikasi &amp; Pengingat Jam Pelajaran
          </h1>
          <p className="text-sm text-secondary mt-1">
            Pembaruan otomatis setiap 30 detik untuk Jadwal Momentum baru, agenda organisasi, dan
            pengingat pergantian jam.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-surface-low hover:bg-surface-container text-xs font-semibold text-on-surface flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Perbarui
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="px-4 py-2 rounded-xl bg-primary-container hover:bg-surface-tint text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              Tandai Semua Dibaca ({unreadCount})
            </button>
          )}
        </div>
      </section>

      {/* Live Pergantian Jam Card */}
      {pergantian && (pergantian.slot_aktif || pergantian.slot_berikutnya) && (
        <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">alarm_on</span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Pengingat Pergantian Jam Real-time • Server {formatJamPendek(pergantian.waktu_server)} WIB
              </div>
              <div className="text-base font-extrabold mt-0.5">
                {pergantian.pesan_pengingat ||
                  (pergantian.slot_aktif
                    ? `Sedang berlangsung: ${pergantian.slot_aktif.mata_pelajaran} (sisa ${pergantian.sisa_menit_jam_aktif ?? 0} menit)`
                    : `Jam berikutnya: ${pergantian.slot_berikutnya.mata_pelajaran} (${formatJamPendek(pergantian.slot_berikutnya.jam_mulai)})`)}
              </div>
            </div>
          </div>
          {pergantian.slot_berikutnya && (
            <div className="rounded-2xl bg-white/15 px-4 py-2 text-xs font-semibold shrink-0">
              Berikutnya: {pergantian.slot_berikutnya.mata_pelajaran} (
              {formatJamPendek(pergantian.slot_berikutnya.jam_mulai)})
            </div>
          )}
        </section>
      )}

      {/* OS Pop-up Notification Activation Card (Android + iOS PWA) */}
      <section className="rounded-3xl bg-white p-5 shadow-xs border border-surface-high/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">notifications_active</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-on-surface">
                Notifikasi Pop-up Perangkat (Android &amp; iOS)
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  notifPerm === 'granted'
                    ? 'bg-emerald-50 text-emerald-700'
                    : notifPerm === 'denied'
                      ? 'bg-red-50 text-[#ba1a1a]'
                      : 'bg-amber-50 text-amber-800'
                }`}
              >
                {notifPerm === 'granted'
                  ? 'Pop-up Aktif'
                  : notifPerm === 'denied'
                    ? 'Diblokir Browser'
                    : notifPerm === 'unsupported'
                      ? 'Pasang ke Layar Utama (iOS)'
                      : 'Belum Diaktifkan'}
              </span>
            </div>
            <p className="text-xs text-secondary mt-1 leading-relaxed">
              {isIos && !installed
                ? 'Di iPhone/iPad (iOS 16.4+), pasang aplikasi ini ke Layar Utama terlebih dahulu (Share → Tambah ke Layar Utama), lalu buka dari ikon aplikasi dan aktifkan izin pop-up.'
                : 'Dapatkan pop-up di layar HP saat pergantian jam pelajaran atau ada Jadwal Momentum baru dari guru.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isIos && !installed ? (
            <button
              type="button"
              onClick={triggerInstall}
              className="px-4 py-2 rounded-xl bg-primary-container hover:bg-surface-tint text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">install_mobile</span>
              Pasang di iOS Dulu
            </button>
          ) : notifPerm === 'granted' ? (
            <button
              type="button"
              onClick={handleTestPopup}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Tes Pop-up Sekarang
            </button>
          ) : notifPerm === 'default' ? (
            <button
              type="button"
              onClick={handleEnablePopup}
              className="px-4 py-2 rounded-xl bg-primary-container hover:bg-surface-tint text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">notifications</span>
              Aktifkan Pop-up HP
            </button>
          ) : null}
        </div>
      </section>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'momentum', label: 'Jadwal Momentum' },
            { id: 'kalender', label: 'Agenda Kalender' },
            { id: 'pergantian_jam', label: 'Pergantian Jam' },
            { id: 'pengumuman', label: 'Pengumuman' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilterTipe(chip.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                filterTipe === chip.id
                  ? 'bg-primary-container text-white'
                  : 'bg-white border border-surface-high text-secondary hover:text-on-surface'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-on-surface cursor-pointer bg-white border border-surface-high px-3.5 py-1.5 rounded-full">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="accent-primary-container"
          />
          Belum Dibaca Saja
        </label>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center border border-surface-high/60 space-y-2">
            <span className="material-symbols-outlined text-[40px] text-emerald-600">
              mark_email_read
            </span>
            <div className="text-base font-bold text-on-surface">Semua Beres!</div>
            <p className="text-xs text-secondary">
              Tidak ada notifikasi yang sesuai filter saat ini.
            </p>
          </div>
        ) : (
          filtered.map((notif) => {
            const meta = TIPE_META[notif.tipe] || TIPE_META.pengumuman;
            return (
              <div
                key={notif.id}
                className={`rounded-2xl bg-white p-5 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  notif.is_read
                    ? 'border-surface-high/60 opacity-85'
                    : 'border-primary-container/40 ring-1 ring-primary-container/15'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${meta.iconWrap}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{meta.icon}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${meta.badge}`}>
                        {meta.label}
                      </span>
                      {!notif.is_read && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container text-white text-[10px] font-bold">
                          BARU
                        </span>
                      )}
                      {notif.created_at && (
                        <span className="text-[11px] text-secondary">
                          {new Date(notif.created_at).toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-on-surface">{notif.judul}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{notif.pesan}</p>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(notif.id)}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-surface-low hover:bg-primary-fixed hover:text-primary text-xs font-bold text-on-surface transition cursor-pointer"
                  >
                    Tandai Dibaca
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
