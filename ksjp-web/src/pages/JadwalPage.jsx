import { useEffect, useMemo, useState } from 'react';
import { fetchJadwal } from '../services/api';
import {
  computeLiveSlotStatus,
  formatClockWib,
  formatJamPendek,
  formatTanggalIndo,
  getMomentumLabel,
  toLocalDateString,
} from '../utils/date';

const QUICK_WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

function getDateForWeekdayInCurrentWeek(targetDayIndex) {
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setDate(monday.getDate() + targetDayIndex);
  return toLocalDateString(monday);
}

export default function JadwalPage({ initialHarianData }) {
  const [mode, setMode] = useState('harian');
  const [tanggal, setTanggal] = useState(() => initialHarianData?.tanggal || toLocalDateString());
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [onlyMomentum, setOnlyMomentum] = useState(false);

  const [payload, setPayload] = useState(() =>
    initialHarianData ? { mode: 'harian', data: initialHarianData } : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadSchedule = async (nextMode = mode, nextDate = tanggal) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchJadwal({ mode: nextMode, tanggal: nextDate });
      setPayload(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat jadwal pelajaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule(mode, tanggal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tanggal]);

  const harian = mode === 'harian' ? payload?.data : null;
  const mingguan = mode === 'mingguan' && Array.isArray(payload?.data) ? payload.data : [];

  const availableRooms = useMemo(() => {
    const allSlots =
      mode === 'harian'
        ? harian?.jadwal || []
        : mingguan.flatMap((day) => day.jadwal || []);
    const unique = new Set(allSlots.map((s) => s.ruangan).filter(Boolean));
    return Array.from(unique);
  }, [mode, harian, mingguan]);

  const filterSlots = (slots = []) =>
    slots.filter((slot) => {
      if (onlyMomentum && !slot.is_momentum) return false;
      if (roomFilter !== 'all' && slot.ruangan !== roomFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const hit =
          (slot.mata_pelajaran || '').toLowerCase().includes(q) ||
          (slot.nama_guru || '').toLowerCase().includes(q) ||
          (slot.ruangan || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });

  const harianDateStr = harian?.tanggal || tanggal;
  const filteredHarianSlots = filterSlots(harian?.jadwal || []).map((slot) => ({
    slot,
    live: computeLiveSlotStatus(slot, harianDateStr, now),
  }));

  const liveSlotEntry = filteredHarianSlots.find((entry) => entry.live.isLive) || null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-3xl bg-white p-6 shadow-xs border border-surface-high/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
            <span>PORTAL KSJP &gt; JADWAL PELAJARAN</span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-mono">
              {formatClockWib(now)}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-on-surface mt-1">
            Jadwal Pelajaran &amp; Dinamis (Momentum)
          </h1>
          <p className="text-sm text-secondary mt-1">
            {payload?.kelas
              ? `${payload.kelas.nama_kelas} • ${payload.kelas.konsentrasi} • Wali Kelas: ${payload.kelas.wali_kelas}`
              : 'Memuat informasi kelas...'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-surface-low p-1 border border-surface-high/60">
            <button
              type="button"
              onClick={() => setMode('harian')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'harian' ? 'bg-primary-container text-white shadow-xs' : 'text-secondary'
              }`}
            >
              Tampilan Harian
            </button>
            <button
              type="button"
              onClick={() => setMode('mingguan')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'mingguan' ? 'bg-primary-container text-white shadow-xs' : 'text-secondary'
              }`}
            >
              Jadwal Mingguan
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadSchedule(mode, tanggal)}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-high text-xs font-semibold text-on-surface flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            Sinkronkan
          </button>
        </div>
      </section>

      {/* Live Active Session Hero (updates live every second!) */}
      {mode === 'harian' && liveSlotEntry && (
        <section className="rounded-3xl bg-white p-6 shadow-md border-l-[6px] border-l-emerald-600 border border-emerald-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              SEDANG BERLANGSUNG SEKARANG
            </span>
            <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
              {formatJamPendek(liveSlotEntry.slot.jam_mulai)} –{' '}
              {formatJamPendek(liveSlotEntry.slot.jam_selesai)} WIB
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-on-surface">
                  {liveSlotEntry.slot.mata_pelajaran}
                </h2>
                {liveSlotEntry.slot.is_momentum && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-white text-[11px] font-bold">
                    MOMENTUM AKTIF
                  </span>
                )}
              </div>
              <p className="text-sm text-secondary mt-1">
                <span className="font-bold text-primary">{liveSlotEntry.slot.ruangan}</span> •{' '}
                {liveSlotEntry.slot.nama_guru}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-extrabold text-emerald-700">
                  {liveSlotEntry.live.progressPct}% Selesai
                </div>
                <div className="text-[11px] text-secondary">
                  Sisa {liveSlotEntry.live.sisaMenit} menit lagi
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(liveSlotEntry.slot)}
                className="rounded-xl bg-primary-container hover:bg-surface-tint text-white px-4 py-2.5 text-xs font-bold cursor-pointer"
              >
                Detail Sesi
              </button>
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-surface-high overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${liveSlotEntry.live.progressPct}%` }}
            />
          </div>
        </section>
      )}

      {/* Filter Bar (#f3f4f5) */}
      <section className="rounded-2xl bg-surface-low p-4 border border-surface-high/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTanggal(toLocalDateString())}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                tanggal === toLocalDateString()
                  ? 'bg-primary-container text-white'
                  : 'bg-white text-on-surface border border-surface-high'
              }`}
            >
              Hari Ini
            </button>

            {QUICK_WEEKDAYS.map((dayName, index) => {
              const targetDate = getDateForWeekdayInCurrentWeek(index);
              const isSelected = tanggal === targetDate;
              return (
                <button
                  key={dayName}
                  type="button"
                  onClick={() => setTanggal(targetDate)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-primary-fixed text-on-primary-fixed ring-1 ring-primary-container'
                      : 'bg-white text-secondary hover:text-on-surface border border-surface-high/60'
                  }`}
                >
                  {dayName}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={tanggal}
              onChange={(e) => e.target.value && setTanggal(e.target.value)}
              className="rounded-xl bg-white border border-surface-high px-3 py-2 text-xs font-semibold text-on-surface"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 pt-1">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter mapel, guru, atau ruangan..."
            className="rounded-xl bg-white border border-surface-high px-3.5 py-2 text-xs text-on-surface"
          />

          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="rounded-xl bg-white border border-surface-high px-3.5 py-2 text-xs text-on-surface"
          >
            <option value="all">Semua Ruang &amp; Lab</option>
            {availableRooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-xl bg-white border border-surface-high px-3.5 py-2 text-xs font-semibold text-on-surface cursor-pointer">
            <input
              type="checkbox"
              checked={onlyMomentum}
              onChange={(e) => setOnlyMomentum(e.target.checked)}
              className="accent-primary-container"
            />
            Hanya Tampilkan Jadwal Momentum
          </label>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#ba1a1a]">
          {error}
        </div>
      )}

      {/* Content: Harian Timeline vs Mingguan */}
      {loading ? (
        <div className="rounded-3xl bg-white p-10 text-center text-sm text-secondary">
          Memuat jadwal dari REST API...
        </div>
      ) : mode === 'harian' ? (
        <div className="space-y-4">
          {harian?.is_libur && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-[#ba1a1a] flex items-center gap-2">
              <span className="material-symbols-outlined">event_busy</span>
              Tanggal {formatTanggalIndo(harian.tanggal)} tercatat sebagai hari libur pada kalender akademik.
            </div>
          )}

          {filteredHarianSlots.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm text-secondary border border-surface-high/60">
              Tidak ada slot jadwal yang sesuai filter untuk {harian?.hari},{' '}
              {formatTanggalIndo(harian?.tanggal)}.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHarianSlots.map(({ slot, live }, idx) => (
                <div
                  key={`${slot.id ?? 'm'}-${slot.momentum_id ?? idx}`}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-2xl shadow-xs border overflow-hidden flex cursor-pointer hover:shadow-md transition ${
                    live.isLive
                      ? 'bg-emerald-50/50 border-emerald-300 border-l-[6px] border-l-emerald-600'
                      : slot.is_momentum
                        ? 'bg-white border-surface-high/70 border-l-[6px] border-l-primary-container'
                        : live.isBreak
                          ? 'bg-surface-low border-surface-high/60 border-l-[6px] border-l-surface-high'
                          : 'bg-white border-surface-high/70 border-l-[6px] border-l-secondary-container'
                  }`}
                >
                  <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-xl px-3.5 py-2.5 text-center shrink-0 ${
                          live.isLive
                            ? 'bg-emerald-600 text-white'
                            : slot.is_momentum
                              ? 'bg-primary-fixed/60 text-on-primary-fixed'
                              : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        <div className="text-sm font-extrabold">
                          {formatJamPendek(slot.jam_mulai)}
                        </div>
                        <div className="text-[11px] font-medium">
                          {formatJamPendek(slot.jam_selesai)}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-on-surface">
                            {slot.mata_pelajaran}
                          </span>

                          {live.isLive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              Sedang Berlangsung
                            </span>
                          )}

                          {slot.is_momentum ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-container text-white text-[11px] font-bold">
                              <span className="material-symbols-outlined text-[13px]">bolt</span>
                              MOMENTUM ({getMomentumLabel(slot.status_perubahan)})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary text-[11px] font-semibold">
                              {live.isBreak ? 'Istirahat' : `Reguler • Jam ke-${slot.jam_ke}`}
                            </span>
                          )}

                          {!live.isLive && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                live.status === 'selesai'
                                  ? 'bg-surface-high text-secondary'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {live.label}
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-secondary flex flex-wrap items-center gap-x-4 gap-y-1">
                          {slot.nama_guru !== '-' && (
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">person</span>
                              {slot.nama_guru}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 font-semibold text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              location_on
                            </span>
                            {slot.ruangan}
                          </span>
                        </div>

                        {slot.is_momentum && slot.jadwal_reguler_asli && (
                          <div className="text-xs text-secondary line-through pt-0.5">
                            Reguler sebelumnya: {slot.jadwal_reguler_asli.mata_pelajaran} •{' '}
                            {slot.jadwal_reguler_asli.ruangan} (
                            {slot.jadwal_reguler_asli.nama_guru})
                          </div>
                        )}

                        {slot.is_momentum && slot.keterangan && (
                          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-900 mt-1.5 inline-block">
                            {slot.keterangan}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-low text-xs font-semibold text-on-surface-variant">
                        {live.isLive ? `Sisa ${live.sisaMenit} mnt` : 'Detail'}
                        <span className="material-symbols-outlined text-[16px]">
                          chevron_right
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mingguan.map((day) => {
            const daySlots = filterSlots(day.jadwal || []);
            return (
              <div
                key={day.tanggal}
                className="rounded-3xl bg-white p-5 shadow-xs border border-surface-high/60 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-surface-high/60">
                  <div>
                    <div className="font-extrabold text-base text-on-surface">{day.hari}</div>
                    <div className="text-xs text-secondary">{formatTanggalIndo(day.tanggal)}</div>
                  </div>
                  {day.is_libur && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#ba1a1a] text-[11px] font-bold">
                      Libur
                    </span>
                  )}
                </div>

                {daySlots.length === 0 ? (
                  <p className="text-xs text-secondary py-4 text-center">Tidak ada jadwal.</p>
                ) : (
                  <div className="space-y-2.5">
                    {daySlots.map((slot, idx) => {
                      const live = computeLiveSlotStatus(slot, day.tanggal, now);
                      return (
                        <div
                          key={`${day.tanggal}-${idx}`}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl p-3 border cursor-pointer transition ${
                            live.isLive
                              ? 'bg-emerald-50 border-emerald-400'
                              : slot.is_momentum
                                ? 'bg-primary-fixed/30 border-primary-container/40'
                                : 'bg-surface-low border-surface-high/60 hover:bg-surface-container'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                            <span className={live.isLive ? 'text-emerald-700' : 'text-primary'}>
                              {formatJamPendek(slot.jam_mulai)} – {formatJamPendek(slot.jam_selesai)}
                            </span>
                            {live.isLive ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                                SEDANG BERLANGSUNG
                              </span>
                            ) : (
                              slot.is_momentum && (
                                <span className="px-2 py-0.5 rounded-full bg-primary-container text-white text-[10px]">
                                  MOMENTUM
                                </span>
                              )
                            )}
                          </div>
                          <div className="font-bold text-xs text-on-surface mt-1">
                            {slot.mata_pelajaran}
                          </div>
                          <div className="text-[11px] text-secondary mt-0.5">
                            {slot.ruangan}
                            {slot.nama_guru !== '-' ? ` • ${slot.nama_guru}` : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Sesi */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                  Detail Slot Pelajaran • Jam ke-{selectedSlot.jam_ke}
                </div>
                <h3 className="text-lg font-extrabold">{selectedSlot.mata_pelajaran}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-surface-low p-3">
                  <div className="text-[11px] text-secondary">Waktu</div>
                  <div className="font-bold text-on-surface mt-0.5">
                    {formatJamPendek(selectedSlot.jam_mulai)} –{' '}
                    {formatJamPendek(selectedSlot.jam_selesai)} WIB
                  </div>
                </div>
                <div className="rounded-2xl bg-surface-low p-3">
                  <div className="text-[11px] text-secondary">Ruangan</div>
                  <div className="font-bold text-primary mt-0.5">{selectedSlot.ruangan}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-low p-3">
                <div className="text-[11px] text-secondary">Guru Pengampu</div>
                <div className="font-bold text-on-surface mt-0.5">{selectedSlot.nama_guru}</div>
              </div>

              {selectedSlot.is_momentum && (
                <div className="rounded-2xl bg-primary-fixed/35 border border-primary-container/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-primary">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    JADWAL DINAMIS (MOMENTUM) —{' '}
                    {getMomentumLabel(selectedSlot.status_perubahan)}
                  </div>
                  {selectedSlot.keterangan && (
                    <p className="text-xs text-on-surface">{selectedSlot.keterangan}</p>
                  )}
                  {selectedSlot.jadwal_reguler_asli && (
                    <div className="text-xs text-secondary pt-1 border-t border-primary-container/20">
                      Jadwal reguler awal: {selectedSlot.jadwal_reguler_asli.mata_pelajaran} •{' '}
                      {selectedSlot.jadwal_reguler_asli.ruangan} (
                      {selectedSlot.jadwal_reguler_asli.nama_guru})
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="w-full rounded-xl bg-surface-container hover:bg-surface-high py-2.5 text-sm font-semibold text-on-surface cursor-pointer"
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
