import { useCallback, useEffect, useState } from 'react';
import {
  createAdminKalender,
  createAdminMomentum,
  deleteAdminKalender,
  deleteAdminMomentum,
  fetchAdminOverview,
} from '../services/api';
import { formatTanggalIndo } from '../utils/date';

const KATEGORI_LABELS = {
  hari_pertama: 'Hari Pertama Masuk',
  asesmen_ujian: 'Asesmen / Ujian',
  penyerahan_raport: 'Penyerahan Raport',
  libur_semester: 'Libur Semester / Tahun',
  libur_umum: 'Libur Umum / Cuti',
  libur_ramadhan: 'Libur Ramadhan / Lebaran',
  kegiatan_sekolah: 'Kegiatan Sekolah',
  pkl_prakerin: 'PKL / Prakerin',
  hut_sekolah: 'HUT SMK Telkom',
  agenda_organisasi: 'Agenda Organisasi (OSIS/MPK/PMR)',
};

export default function AdminPortalPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [subTab, setSubTab] = useState('ringkasan');

  const [agendaForm, setAgendaForm] = useState({
    judul: '',
    tanggal_mulai: '2026-12-01',
    tanggal_selesai: '2026-12-01',
    kategori: 'agenda_organisasi',
    sumber: 'organisasi',
    penyelenggara: 'OSIS SMK Telkom Purwokerto',
    target_kelas: 'Semua Kelas',
    is_libur: false,
    deskripsi: '',
  });

  const [momentumForm, setMomentumForm] = useState({
    tanggal: '2026-12-02',
    jam_mulai: '14:00',
    jam_selesai: '15:20',
    mata_pelajaran_baru: '',
    nama_guru_baru: '',
    ruangan_baru: '',
    alasan_perubahan: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminOverview();
      setOverview(res?.data || null);
      if (res?.data && !res.data.is_guru) {
        setSubTab('kalender');
      }
    } catch (err) {
      setError(err?.message || 'Gagal memuat data Panel Admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveAgenda = async (e) => {
    e.preventDefault();
    setNotice('');
    setError('');
    try {
      await createAdminKalender(agendaForm);
      setAgendaForm((prev) => ({ ...prev, judul: '', deskripsi: '' }));
      setNotice('Agenda kalender berhasil disimpan & disinkronkan ke web siswa.');
      await loadData();
    } catch (err) {
      setError(err?.message || 'Gagal menambahkan agenda.');
    }
  };

  const handleDeleteAgenda = async (id) => {
    setNotice('');
    setError('');
    try {
      await deleteAdminKalender(id);
      setNotice('Agenda kalender berhasil dihapus.');
      await loadData();
    } catch (err) {
      setError(err?.message || 'Tidak diizinkan menghapus agenda ini.');
    }
  };

  const handleSaveMomentum = async (e) => {
    e.preventDefault();
    setNotice('');
    setError('');
    try {
      await createAdminMomentum(momentumForm);
      setMomentumForm((prev) => ({
        ...prev,
        mata_pelajaran_baru: '',
        nama_guru_baru: '',
        ruangan_baru: '',
        alasan_perubahan: '',
      }));
      setNotice('Jadwal Momentum aktif berhasil diterbitkan dan otomatis menimpa slot reguler.');
      await loadData();
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan Jadwal Momentum.');
    }
  };

  const handleDeleteMomentum = async (id) => {
    setNotice('');
    setError('');
    try {
      await deleteAdminMomentum(id);
      setNotice('Jadwal Momentum dihapus.');
      await loadData();
    } catch (err) {
      setError(err?.message || 'Gagal menghapus Jadwal Momentum.');
    }
  };

  const adminExternalUrl =
    import.meta.env.VITE_ADMIN_URL ||
    (import.meta.env.DEV
      ? 'http://127.0.0.1:8000/admin'
      : 'https://ksjp-stematel-api.vercel.app/admin');

  if (loading && !overview) {
    return (
      <div className="rounded-3xl bg-white p-8 border border-surface-high/60 text-center text-sm text-secondary">
        Memuat Panel Pengelola KSJP...
      </div>
    );
  }

  const isGuru = Boolean(overview?.is_guru);
  const stats = overview?.stats || {};
  const liveHarian = overview?.live_harian;

  const tabs = isGuru
    ? [
        { id: 'ringkasan', label: 'Dashboard Admin', icon: 'dashboard' },
        { id: 'jadwal', label: 'Jadwal Reguler (XI PPLG 4)', icon: 'schedule' },
        { id: 'momentum', label: 'Jadwal Momentum', icon: 'bolt' },
        { id: 'kalender', label: 'Kalender Pendidikan', icon: 'calendar_month' },
        { id: 'notifikasi', label: 'Log Notifikasi', icon: 'notifications' },
      ]
    : [
        { id: 'kalender', label: 'Kalender Pendidikan & Agenda Organisasi', icon: 'calendar_month' },
      ];

  return (
    <div className="space-y-5">
      {/* Admin Hero Header */}
      <section className="rounded-3xl bg-gradient-to-br from-[#1b1015] via-[#6e0d19] to-[#b10019] text-white p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {isGuru ? 'Panel Pengelola • Guru & Wali Kelas' : 'Panel Organisasi • OSIS / MPK / PMR'}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              KSJP Stematel — Portal Admin Terintegrasi
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/85 max-w-2xl">
              {isGuru
                ? 'Kelola Jadwal Reguler XI PPLG 4, terbitkan Jadwal Momentum darurat, dan perbarui Kalender Pendidikan 2026/2027 langsung dari portal.'
                : 'Kelola agenda organisasi siswa (OSIS, MPK, PMR, Pramuka) pada Kalender Pendidikan 2026/2027 secara real-time.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Sinkronkan
            </button>
            <a
              href={adminExternalUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white text-[#b10019] text-xs font-extrabold flex items-center gap-1.5 shadow-sm hover:bg-rose-50 transition"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Buka Filament Admin Penuh
            </a>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-[#ba1a1a]">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800">
          {notice}
        </div>
      )}

      {/* 3 Admin Stat Cards (Mirror Filament KsjpStatsOverview) */}
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-surface-high/60 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Peserta Didik Terdaftar
          </div>
          <div className="text-2xl font-extrabold text-on-surface mt-1">
            {stats.siswa_count ?? 0} Siswa
          </div>
          <div className="text-xs font-semibold text-primary mt-0.5">
            Kelas {overview?.kelas?.nama_kelas || 'XI PPLG 4'} — RPL
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-surface-high/60 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Slot Jadwal Reguler
          </div>
          <div className="text-2xl font-extrabold text-on-surface mt-1">
            {stats.jadwal_reguler_count ?? 0}
          </div>
          <div className="text-xs font-semibold text-amber-700 mt-0.5">
            {stats.momentum_aktif_count ?? 0} Jadwal Momentum aktif
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-surface-high/60 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Agenda Kalender 2026/2027
          </div>
          <div className="text-2xl font-extrabold text-on-surface mt-1">
            {stats.kalender_count ?? 0}
          </div>
          <div className="text-xs font-semibold text-emerald-700 mt-0.5">
            {stats.notifikasi_count ?? 0} notifikasi real-time tercatat
          </div>
        </div>
      </section>

      {/* Role Sub-Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === t.id
                ? 'bg-primary-container text-white shadow-sm'
                : 'bg-white border border-surface-high text-on-surface hover:bg-surface-low'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* SubTab: Ringkasan (Guru) */}
      {subTab === 'ringkasan' && isGuru && (
        <div className="rounded-3xl bg-white p-5 border border-surface-high/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-on-surface">
                Status Jadwal Live {overview?.kelas?.nama_kelas}
              </h2>
              <p className="text-xs text-secondary">
                Wali Kelas: {overview?.kelas?.wali_kelas} • Hari ini: {liveHarian?.hari}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold">
              {(liveHarian?.jadwal || []).length} Sesi Hari Ini
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(liveHarian?.jadwal || []).slice(0, 6).map((slot, i) => (
              <div
                key={`${slot.jam_mulai}-${i}`}
                className="rounded-2xl bg-surface-low p-3.5 border border-surface-high/60 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                  <span>
                    {String(slot.jam_mulai).slice(0, 5)} – {String(slot.jam_selesai).slice(0, 5)} WIB
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-on-surface">
                    {slot.ruangan}
                  </span>
                </div>
                <div className="text-sm font-bold text-on-surface">{slot.mata_pelajaran}</div>
                <div className="text-xs text-secondary">{slot.nama_guru}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab: Jadwal Reguler (Guru) */}
      {subTab === 'jadwal' && isGuru && (
        <div className="rounded-3xl bg-white p-5 border border-surface-high/60 shadow-xs space-y-3 overflow-x-auto">
          <h2 className="text-base font-extrabold text-on-surface">
            Daftar Slot Jadwal Reguler ({(overview?.jadwal_reguler || []).length} Slot)
          </h2>
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-surface-high text-secondary uppercase text-[10px]">
                <th className="py-2 pr-3">Hari</th>
                <th className="py-2 pr-3">Jam</th>
                <th className="py-2 pr-3">Mata Pelajaran</th>
                <th className="py-2 pr-3">Guru Pengajar</th>
                <th className="py-2">Ruangan</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.jadwal_reguler || []).map((row) => (
                <tr key={row.id} className="border-b border-surface-high/40 hover:bg-surface-low/60">
                  <td className="py-2 pr-3 font-bold text-primary">{row.hari}</td>
                  <td className="py-2 pr-3 font-mono">
                    {String(row.jam_mulai).slice(0, 5)} – {String(row.jam_selesai).slice(0, 5)}
                  </td>
                  <td className="py-2 pr-3 font-semibold text-on-surface">{row.mata_pelajaran}</td>
                  <td className="py-2 pr-3 text-secondary">{row.nama_guru}</td>
                  <td className="py-2 font-bold">{row.ruangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SubTab: Jadwal Momentum (Guru) */}
      {subTab === 'momentum' && isGuru && (
        <div className="grid lg:grid-cols-12 gap-5">
          <form
            onSubmit={handleSaveMomentum}
            className="lg:col-span-5 rounded-3xl bg-white p-5 border border-surface-high/60 shadow-xs space-y-3"
          >
            <h2 className="text-base font-extrabold text-on-surface">
              Terbitkan Jadwal Momentum Baru
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3">
                <label className="text-[11px] font-bold text-secondary">Tanggal</label>
                <input
                  type="date"
                  required
                  value={momentumForm.tanggal}
                  onChange={(e) => setMomentumForm({ ...momentumForm, tanggal: e.target.value })}
                  className="w-full mt-1 rounded-xl bg-surface-low border border-surface-high px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-secondary">Mulai</label>
                <input
                  type="time"
                  required
                  value={momentumForm.jam_mulai}
                  onChange={(e) => setMomentumForm({ ...momentumForm, jam_mulai: e.target.value })}
                  className="w-full mt-1 rounded-xl bg-surface-low border border-surface-high px-2 py-2 text-xs"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-secondary">Selesai</label>
                <input
                  type="time"
                  required
                  value={momentumForm.jam_selesai}
                  onChange={(e) => setMomentumForm({ ...momentumForm, jam_selesai: e.target.value })}
                  className="w-full mt-1 rounded-xl bg-surface-low border border-surface-high px-2 py-2 text-xs"
                />
              </div>
            </div>
            <input
              type="text"
              required
              placeholder="Mata Pelajaran Baru"
              value={momentumForm.mata_pelajaran_baru}
              onChange={(e) => setMomentumForm({ ...momentumForm, mata_pelajaran_baru: e.target.value })}
              className="w-full rounded-xl bg-surface-low border border-surface-high px-3 py-2 text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Nama Guru Baru"
                value={momentumForm.nama_guru_baru}
                onChange={(e) => setMomentumForm({ ...momentumForm, nama_guru_baru: e.target.value })}
                className="w-full rounded-xl bg-surface-low border border-surface-high px-3 py-2 text-xs"
              />
              <input
                type="text"
                required
                placeholder="Ruangan (misal RPS SEL)"
                value={momentumForm.ruangan_baru}
                onChange={(e) => setMomentumForm({ ...momentumForm, ruangan_baru: e.target.value })}
                className="w-full rounded-xl bg-surface-low border border-surface-high px-3 py-2 text-xs"
              />
            </div>
            <input
              type="text"
              placeholder="Alasan perubahan (opsional)"
              value={momentumForm.alasan_perubahan}
              onChange={(e) => setMomentumForm({ ...momentumForm, alasan_perubahan: e.target.value })}
              className="w-full rounded-xl bg-surface-low border border-surface-high px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-primary-container hover:bg-surface-tint text-white font-bold py-2.5 text-xs cursor-pointer"
            >
              Simpan Jadwal Momentum
            </button>
          </form>

          <div className="lg:col-span-7 rounded-3xl bg-white p-5 border border-surface-high/60 shadow-xs space-y-3">
            <h2 className="text-base font-extrabold text-on-surface">
              Daftar Jadwal Momentum ({(overview?.jadwal_momentum || []).length})
            </h2>
            {(overview?.jadwal_momentum || []).length === 0 ? (
              <div className="text-xs text-secondary py-6 text-center">
                Belum ada Jadwal Momentum aktif.
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {(overview?.jadwal_momentum || []).map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl bg-amber-50/70 border border-amber-200 p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-amber-900">
                        {formatTanggalIndo(m.tanggal)} • {String(m.jam_mulai).slice(0, 5)}–
                        {String(m.jam_selesai).slice(0, 5)}
                      </div>
                      <div className="text-sm font-bold text-on-surface">
                        {m.mata_pelajaran || m.mata_pelajaran_baru}
                      </div>
                      <div className="text-[11px] text-secondary">
                        {m.nama_guru_pengganti || m.nama_guru_baru} • Ruang {m.ruangan_baru}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMomentum(m.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-100 text-[#ba1a1a] text-[11px] font-bold cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab: Kalender Pendidikan (Guru & OSIS) */}
      {subTab === 'kalender' && (
        <div className="grid lg:grid-cols-12 gap-5">
          <form
            onSubmit={handleSaveAgenda}
            className="lg:col-span-5 rounded-3xl bg-white p-5 border border-surface-high/60 shadow-xs space-y-3"
          >
            <h2 className="text-base font-extrabold text-on-surface">
              {isGuru ? 'Tambah Agenda Kalender' : 'Tambah Agenda Organisasi (OSIS/MPK/PMR)'}
            </h2>
            <input
              type="text"
              required
              placeholder="Judul Kegiatan / Agenda"
              value={agendaForm.judul}
              onChange={(e) => setAgendaForm({ ...agendaForm, judul: e.target.value })}
              className="w-full rounded-xl bg-surface-low border border-surface-high px-3 py-2 text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-secondary">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  value={agendaForm.tanggal_mulai}
                  onChange={(e) =>
                    setAgendaForm({ ...agendaForm, tanggal_mulai: e.target.value })
                  }
                  className="w-full mt-1 rounded-xl bg-surface-low border border-surface-high px-2 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-secondary">Tanggal Selesai</label>
                <input
                  type="date"
                  value={agendaForm.tanggal_selesai}
                  onChange={(e) =>
                    setAgendaForm({ ...agendaForm, tanggal_selesai: e.target.value })
                  }
                  className="w-full mt-1 rounded-xl bg-surface-low border border-surface-high px-2 py-2 text-xs"
                />
              </div>
            </div>
            {isGuru && (
              <select
                value={agendaForm.kategori}
                onChange={(e) => setAgendaForm({ ...agendaForm, kategori: e.target.value })}
                className="w-full rounded-xl bg-surface-low border border-surface-high px-3 py-2 text-xs"
              >
                {Object.entries(KATEGORI_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="Penyelenggara (misal OSIS / PMR / MPK / Sekolah)"
              value={agendaForm.penyelenggara}
              onChange={(e) => setAgendaForm({ ...agendaForm, penyelenggara: e.target.value })}
              className="w-full rounded-xl bg-surface-low border border-surface-high px-3 py-2 text-xs"
            />
            <textarea
              rows={2}
              placeholder="Deskripsi singkat agenda..."
              value={agendaForm.deskripsi}
              onChange={(e) => setAgendaForm({ ...agendaForm, deskripsi: e.target.value })}
              className="w-full rounded-xl bg-surface-low border border-surface-high px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-primary-container hover:bg-surface-tint text-white font-bold py-2.5 text-xs cursor-pointer"
            >
              Simpan Agenda ke Kalender
            </button>
          </form>

          <div className="lg:col-span-7 rounded-3xl bg-white p-5 border border-surface-high/60 shadow-xs space-y-3">
            <h2 className="text-base font-extrabold text-on-surface">
              Daftar Agenda Kalender ({(overview?.kalender || []).length})
            </h2>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {(overview?.kalender || []).map((ag) => {
                const canDelete = isGuru || ag.sumber === 'organisasi';
                return (
                  <div
                    key={ag.id}
                    className="rounded-2xl bg-surface-low border border-surface-high/60 p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-full bg-white text-primary">
                          {ag.sumber === 'organisasi' ? 'Organisasi' : 'Resmi Sekolah'}
                        </span>
                        <span className="text-secondary">
                          {formatTanggalIndo(ag.tanggal_mulai)}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-on-surface truncate mt-0.5">
                        {ag.judul}
                      </div>
                      <div className="text-[11px] text-secondary truncate">{ag.penyelenggara}</div>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAgenda(ag.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#ba1a1a] text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SubTab: Log Notifikasi (Guru Only) */}
      {subTab === 'notifikasi' && isGuru && (
        <div className="rounded-3xl bg-white p-5 border border-surface-high/60 shadow-xs space-y-2">
          <h2 className="text-base font-extrabold text-on-surface">
            Log Notifikasi Terbaru ({(overview?.notifikasi || []).length})
          </h2>
          {(overview?.notifikasi || []).map((n) => (
            <div key={n.id} className="rounded-2xl bg-surface-low p-3 border border-surface-high/50">
              <div className="text-xs font-bold text-on-surface">{n.judul}</div>
              <div className="text-[11px] text-secondary mt-0.5">{n.pesan}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
