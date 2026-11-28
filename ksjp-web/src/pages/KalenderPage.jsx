import { useEffect, useMemo, useState } from 'react';
import {
  CALENDAR_LEGEND_ITEMS,
  HARI_MINGGU,
  SEMESTER_2026_2027_MONTHS,
  formatRentangTanggal,
  formatTanggalIndo,
  getCategoryStyle,
} from '../utils/date';

function buildMonthCells(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= totalDays; day++) {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    cells.push({
      day,
      iso: `${year}-${mm}-${dd}`,
      isSunday: new Date(year, month - 1, day).getDay() === 0,
    });
  }
  return cells;
}

export default function KalenderPage({ kalenderItems = [], externalSearch = '' }) {
  const [semester, setSemester] = useState('all');
  const [sumber, setSumber] = useState('all');
  const [kategori, setKategori] = useState('all');
  const [search, setSearch] = useState(externalSearch);
  const [selectedModal, setSelectedModal] = useState(null);
  const [mobileMonthOnly, setMobileMonthOnly] = useState(true);
  const [mobileMonthIndex, setMobileMonthIndex] = useState(() => {
    const now = new Date();
    const idx = SEMESTER_2026_2027_MONTHS.findIndex(
      (m) => m.tahun === now.getFullYear() && m.bulan === now.getMonth() + 1
    );
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    setSearch(externalSearch);
  }, [externalSearch]);

  const filteredEvents = useMemo(() => {
    return kalenderItems.filter((item) => {
      if (sumber !== 'all' && item.sumber !== sumber) return false;
      if (kategori !== 'all') {
        if (kategori === 'ujian_asesmen') {
          if (!['ujian_asesmen', 'ukk'].includes(item.kategori)) return false;
        } else if (kategori === 'libur') {
          if (!item.is_libur) return false;
        } else if (item.kategori !== kategori) {
          return false;
        }
      }
      if (semester !== 'all') {
        const startMonth = Number((item.tanggal_mulai || '').slice(5, 7));
        const startYear = Number((item.tanggal_mulai || '').slice(0, 4));
        const isGanjil = startYear === 2026 && startMonth >= 7;
        if (semester === 'ganjil' && !isGanjil) return false;
        if (semester === 'genap' && isGanjil) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit =
          (item.judul || '').toLowerCase().includes(q) ||
          (item.deskripsi || '').toLowerCase().includes(q) ||
          (item.penyelenggara || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [kalenderItems, sumber, kategori, semester, search]);

  const visibleMonths = useMemo(() => {
    if (semester === 'all') return SEMESTER_2026_2027_MONTHS;
    return SEMESTER_2026_2027_MONTHS.filter((m) => m.semester === semester);
  }, [semester]);

  const safeMobileIdx = Math.min(mobileMonthIndex, Math.max(visibleMonths.length - 1, 0));

  useEffect(() => {
    setMobileMonthIndex((prev) => Math.min(prev, Math.max(visibleMonths.length - 1, 0)));
  }, [visibleMonths.length]);

  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach((ev) => {
      if (!ev.tanggal_mulai || !ev.tanggal_selesai) return;
      const start = new Date(`${ev.tanggal_mulai}T00:00:00`);
      const end = new Date(`${ev.tanggal_selesai}T00:00:00`);
      const cursor = new Date(start);
      let guard = 0;
      while (cursor <= end && guard < 180) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${d}`;
        if (!map[iso]) map[iso] = [];
        map[iso].push(ev);
        cursor.setDate(cursor.getDate() + 1);
        guard += 1;
      }
    });
    return map;
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <section className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
              PORTAL KSJP &gt; KALENDER AKADEMIK
            </div>
            <h1 className="text-2xl font-extrabold text-on-surface mt-1">
              Kalender Pendidikan &amp; Akademik T.A. 2026/2027
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed">
                SK: Kepsek/07/2026
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant">
                SMK Telkom Purwokerto • Juli 2026 – Juni 2027
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full sm:w-auto rounded-xl bg-surface-low border border-surface-high px-3.5 py-2 text-xs font-semibold text-on-surface"
            >
              <option value="all">Semua Semester (12 Bulan)</option>
              <option value="ganjil">Semester Ganjil 2026</option>
              <option value="genap">Semester Genap 2027</option>
            </select>

            <select
              value={sumber}
              onChange={(e) => setSumber(e.target.value)}
              className="w-full sm:w-auto rounded-xl bg-surface-low border border-surface-high px-3.5 py-2 text-xs font-semibold text-on-surface"
            >
              <option value="all">Semua Sumber</option>
              <option value="resmi_sekolah">Resmi Sekolah</option>
              <option value="organisasi">Agenda Organisasi</option>
            </select>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari PSTS, UKK, OSIS, libur..."
              className="w-full sm:w-auto sm:min-w-[200px] rounded-xl bg-surface-low border border-surface-high px-3.5 py-2 text-xs text-on-surface"
            />
          </div>
        </div>

        {/* 10-Category Legend Bar */}
        <div className="rounded-2xl bg-surface-low p-3.5 sm:p-4 border border-surface-high/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary mb-2.5">
            Keterangan Simbol &amp; Indikator Warna
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-x-4 gap-y-2">
            {CALENDAR_LEGEND_ITEMS.map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-xs text-on-surface leading-snug">
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${item.dotClass}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main 12-Month Matrix + Right Sidebar */}
      <div className="grid xl:grid-cols-12 gap-6 items-start">
        {/* 12-Month Calendar Grid (8 Cols) */}
        <div className="xl:col-span-8 space-y-3 min-w-0">
          {/* Mobile Month Switcher Bar (Android / iOS viewport friendly) */}
          <div className="sm:hidden rounded-2xl bg-white p-3 shadow-xs border border-surface-high/60 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setMobileMonthIndex((i) =>
                      i <= 0 ? visibleMonths.length - 1 : i - 1
                    )
                  }
                  disabled={!mobileMonthOnly}
                  className="w-8 h-8 rounded-xl bg-surface-low disabled:opacity-40 flex items-center justify-center text-on-surface"
                  aria-label="Bulan sebelumnya"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="text-xs font-extrabold text-on-surface min-w-[115px] text-center">
                  {mobileMonthOnly
                    ? visibleMonths[safeMobileIdx]?.label
                    : `${visibleMonths.length} Bulan`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMobileMonthIndex((i) =>
                      i >= visibleMonths.length - 1 ? 0 : i + 1
                    )
                  }
                  disabled={!mobileMonthOnly}
                  className="w-8 h-8 rounded-xl bg-surface-low disabled:opacity-40 flex items-center justify-center text-on-surface"
                  aria-label="Bulan berikutnya"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMobileMonthOnly((v) => !v)}
                className="px-3 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed text-[11px] font-bold shrink-0"
              >
                {mobileMonthOnly ? 'Lihat Semua' : 'Per 1 Bulan'}
              </button>
            </div>

            {mobileMonthOnly && (
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {visibleMonths.map((m, idx) => (
                  <button
                    key={`pill-${m.tahun}-${m.bulan}`}
                    type="button"
                    onClick={() => setMobileMonthIndex(idx)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition ${
                      idx === safeMobileIdx
                        ? 'bg-primary-container text-white'
                        : 'bg-surface-low text-secondary'
                    }`}
                  >
                    {m.label.split(' ')[0].slice(0, 3)} {String(m.tahun).slice(2)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-4">
          {visibleMonths.map((m, mIdx) => {
            const cells = buildMonthCells(m.tahun, m.bulan);
            const hideOnMobile = mobileMonthOnly && mIdx !== safeMobileIdx;
            return (
              <div
                key={`${m.tahun}-${m.bulan}`}
                className={`${hideOnMobile ? 'hidden sm:flex' : 'flex'} rounded-3xl bg-white p-4 shadow-xs border border-surface-high/60 flex-col justify-between min-w-0`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h2 className="text-sm font-extrabold text-on-surface tracking-tight whitespace-nowrap">
                      {m.label}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold text-secondary whitespace-nowrap shrink-0">
                      {m.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                    {HARI_MINGGU.map((h, i) => (
                      <div
                        key={i}
                        className={`text-[10px] font-bold ${
                          i === 0 ? 'text-[#ba1a1a]' : 'text-secondary'
                        }`}
                      >
                        {h}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {cells.map((cell, idx) => {
                      if (!cell) return <div key={`empty-${idx}`} className="h-7" />;
                      const dayEvents = eventsByDate[cell.iso] || [];
                      const primaryEvent = dayEvents[0];
                      const style = primaryEvent
                        ? getCategoryStyle(primaryEvent.kategori, primaryEvent.sumber)
                        : null;

                      return (
                        <button
                          key={cell.iso}
                          type="button"
                          onClick={() =>
                            dayEvents.length > 0 &&
                            setSelectedModal({ date: cell.iso, events: dayEvents })
                          }
                          title={dayEvents.map((e) => e.judul).join(' | ')}
                          className={`h-9 sm:h-7 w-full rounded-full text-xs sm:text-[11px] flex items-center justify-center transition ${
                            style
                              ? `${style.cell} cursor-pointer hover:scale-105`
                              : cell.isSunday
                                ? 'text-[#ba1a1a] font-medium'
                                : 'text-on-surface hover:bg-surface-low'
                          }`}
                        >
                          {cell.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Right Panel: Filter Chips + Agenda List + Pengesahan Resmi */}
        <div className="xl:col-span-4 space-y-5">
          <div className="rounded-3xl bg-white p-5 shadow-xs border border-surface-high/60 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-on-surface">
                Daftar Agenda ({filteredEvents.length})
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'ujian_asesmen', label: 'Asesmen/UKK' },
                { id: 'libur', label: 'Libur & Cuti' },
                { id: 'upacara', label: 'Upacara' },
                { id: 'agenda_organisasi', label: 'Organisasi' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setKategori(chip.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    kategori === chip.id
                      ? 'bg-primary-container text-white'
                      : 'bg-surface-low text-secondary hover:bg-surface-container'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="max-h-[460px] overflow-y-auto space-y-2.5 pr-1">
              {filteredEvents.length === 0 ? (
                <p className="text-xs text-secondary py-6 text-center">
                  Tidak ada agenda yang cocok dengan filter.
                </p>
              ) : (
                filteredEvents.map((ev) => {
                  const style = getCategoryStyle(ev.kategori, ev.sumber);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() =>
                        setSelectedModal({ date: ev.tanggal_mulai, events: [ev] })
                      }
                      className="w-full text-left rounded-2xl bg-surface-low hover:bg-surface-container p-3.5 border border-surface-high/60 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>
                          {style.label}
                        </span>
                        <span className="text-[11px] font-semibold text-secondary">
                          {ev.penyelenggara}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-on-surface mt-1.5">{ev.judul}</div>
                      <div className="text-xs text-secondary mt-1">
                        {formatRentangTanggal(ev.tanggal_mulai, ev.tanggal_selesai)}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Pengesahan Resmi Card */}
          <div className="rounded-3xl bg-white p-5 shadow-xs border border-surface-high/60 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Pengesahan Resmi Kalender Pendidikan
            </div>
            <div className="text-sm font-bold text-on-surface">
              Aris Puji Santoso, S.Kom., M.M.
            </div>
            <div className="text-xs text-secondary">
              Kepala SMK Telkom Purwokerto • Ditetapkan di Purwokerto, 10 Juli 2026
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail Agenda */}
      {selectedModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                  Detail Agenda Kalender
                </div>
                <h3 className="text-lg font-extrabold">{formatTanggalIndo(selectedModal.date)}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModal(null)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {selectedModal.events.map((ev) => {
                const style = getCategoryStyle(ev.kategori, ev.sumber);
                return (
                  <div
                    key={ev.id}
                    className="rounded-2xl bg-surface-low p-4 border border-surface-high/60 space-y-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${style.badge}`}>
                        {style.label}
                      </span>
                      {ev.sumber === 'organisasi' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                          Agenda {ev.penyelenggara}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-base text-on-surface">{ev.judul}</h4>
                    <div className="text-xs text-secondary">
                      Tanggal: {formatRentangTanggal(ev.tanggal_mulai, ev.tanggal_selesai)} •
                      Target: {ev.target_kelas || 'Semua Kelas'}
                    </div>
                    {ev.deskripsi && (
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {ev.deskripsi}
                      </p>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedModal(null)}
                className="w-full rounded-xl bg-primary-container text-white py-2.5 text-sm font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
