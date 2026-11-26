export const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const HARI_MINGGU = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

export const SEMESTER_2026_2027_MONTHS = [
  { tahun: 2026, bulan: 7, label: 'JULI 2026', code: 'Bln 07', semester: 'ganjil' },
  { tahun: 2026, bulan: 8, label: 'AGUSTUS 2026', code: 'Bln 08', semester: 'ganjil' },
  { tahun: 2026, bulan: 9, label: 'SEPTEMBER 2026', code: 'Bln 09', semester: 'ganjil' },
  { tahun: 2026, bulan: 10, label: 'OKTOBER 2026', code: 'Bln 10', semester: 'ganjil' },
  { tahun: 2026, bulan: 11, label: 'NOVEMBER 2026', code: 'Bln 11', semester: 'ganjil' },
  { tahun: 2026, bulan: 12, label: 'DESEMBER 2026', code: 'Bln 12', semester: 'ganjil' },
  { tahun: 2027, bulan: 1, label: 'JANUARI 2027', code: 'Bln 01', semester: 'genap' },
  { tahun: 2027, bulan: 2, label: 'FEBRUARI 2027', code: 'Bln 02', semester: 'genap' },
  { tahun: 2027, bulan: 3, label: 'MARET 2027', code: 'Bln 03', semester: 'genap' },
  { tahun: 2027, bulan: 4, label: 'APRIL 2027', code: 'Bln 04', semester: 'genap' },
  { tahun: 2027, bulan: 5, label: 'MEI 2027', code: 'Bln 05', semester: 'genap' },
  { tahun: 2027, bulan: 6, label: 'JUNI 2027', code: 'Bln 06', semester: 'genap' },
];

export const CALENDAR_LEGEND_ITEMS = [
  {
    key: 'libur_umum',
    label: 'Libur Umum / Cuti Bersama',
    cellClass: 'bg-[#ba1a1a] text-white font-semibold',
    dotClass: 'bg-[#ba1a1a]',
  },
  {
    key: 'libur_tahun_pelajaran',
    label: 'Libur Tahun / Akhir Semester',
    cellClass: 'ring-2 ring-[#ba1a1a] text-[#ba1a1a] font-semibold bg-white',
    dotClass: 'ring-2 ring-[#ba1a1a] bg-white',
  },
  {
    key: 'masuk_sekolah',
    label: 'Hari Pertama Masuk Sekolah',
    cellClass: 'bg-[#fbbf24] text-[#191c1d] font-bold',
    dotClass: 'bg-[#fbbf24]',
  },
  {
    key: 'upacara',
    label: 'Upacara Hari Besar Nasional',
    cellClass: 'bg-[#ffdad7] text-[#b10019] font-semibold',
    dotClass: 'bg-[#ffdad7] ring-1 ring-[#b10019]/40',
  },
  {
    key: 'ujian_asesmen',
    label: 'PSTS / PSAS / TKA / PSAJ / UKK',
    cellClass: 'bg-[#eff6ff] ring-1 ring-blue-400 text-blue-700 font-semibold',
    dotClass: 'bg-[#eff6ff] ring-1 ring-blue-500',
  },
  {
    key: 'penyerahan_lhb',
    label: 'Penyerahan Raport (LHB)',
    cellClass: 'bg-blue-600 text-white font-semibold',
    dotClass: 'bg-blue-600',
  },
  {
    key: 'ramadhan_idul_fitri',
    label: 'Libur Ramadhan / Idul Fitri',
    cellClass: 'bg-emerald-100 text-emerald-900 font-semibold',
    dotClass: 'bg-emerald-400',
  },
  {
    key: 'pkl',
    label: 'PKL / Prakerin',
    cellClass: 'bg-stone-200 text-stone-800 font-semibold',
    dotClass: 'bg-stone-400',
  },
  {
    key: 'hut_sekolah',
    label: 'HUT SMK Telkom',
    cellClass: 'bg-rose-100 text-[#b10019] font-bold',
    dotClass: 'bg-rose-400',
  },
  {
    key: 'agenda_organisasi',
    label: 'Agenda Organisasi (OSIS/MPK/Pramuka)',
    cellClass: 'bg-amber-100 text-amber-900 font-semibold',
    dotClass: 'bg-amber-500',
  },
];

export function getCategoryStyle(kategori, sumber) {
  if (sumber === 'organisasi' || kategori === 'agenda_organisasi') {
    return {
      label: 'Agenda Organisasi',
      badge: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      cell: 'bg-amber-100 text-amber-900 font-semibold',
    };
  }

  switch (kategori) {
    case 'libur_umum':
      return {
        label: 'Libur Umum',
        badge: 'bg-red-50 text-[#ba1a1a] ring-1 ring-red-200',
        cell: 'bg-[#ba1a1a] text-white font-semibold',
      };
    case 'libur_tahun_pelajaran':
    case 'libur_semester':
      return {
        label: 'Libur Semester / Tahun',
        badge: 'bg-rose-50 text-[#ba1a1a] ring-1 ring-[#ba1a1a]/30',
        cell: 'ring-2 ring-[#ba1a1a] text-[#ba1a1a] font-semibold bg-white',
      };
    case 'masuk_sekolah':
      return {
        label: 'Hari Pertama Masuk',
        badge: 'bg-amber-100 text-amber-950',
        cell: 'bg-[#fbbf24] text-[#191c1d] font-bold',
      };
    case 'upacara':
      return {
        label: 'Upacara Nasional',
        badge: 'bg-[#ffdad7] text-[#b10019]',
        cell: 'bg-[#ffdad7] text-[#b10019] font-semibold',
      };
    case 'ujian_asesmen':
    case 'ukk':
      return {
        label: kategori === 'ukk' ? 'Perkiraan UKK' : 'Asesmen / Ujian',
        badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
        cell: 'bg-[#eff6ff] ring-1 ring-blue-400 text-blue-700 font-semibold',
      };
    case 'penyerahan_lhb':
      return {
        label: 'Penyerahan LHB',
        badge: 'bg-blue-600 text-white',
        cell: 'bg-blue-600 text-white font-semibold',
      };
    case 'ramadhan_idul_fitri':
      return {
        label: 'Ramadhan / Idul Fitri',
        badge: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
        cell: 'bg-emerald-100 text-emerald-900 font-semibold',
      };
    case 'pkl':
      return {
        label: 'PKL Kelas XII',
        badge: 'bg-stone-100 text-stone-800',
        cell: 'bg-stone-200 text-stone-800 font-semibold',
      };
    case 'hut_sekolah':
      return {
        label: 'HUT SMK Telkom',
        badge: 'bg-rose-100 text-[#b10019]',
        cell: 'bg-rose-100 text-[#b10019] font-bold',
      };
    case 'kelulusan':
      return {
        label: 'Kelulusan',
        badge: 'bg-purple-50 text-purple-800',
        cell: 'bg-purple-100 text-purple-900 font-semibold',
      };
    default:
      return {
        label: 'Kegiatan Sekolah',
        badge: 'bg-[#edeeef] text-[#5c3f3d]',
        cell: 'bg-[#fef3c7] text-amber-900 font-semibold',
      };
  }
}

export function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${BULAN_INDONESIA[m - 1]} ${y}`;
}

export function formatRentangTanggal(mulai, selesai) {
  if (!mulai) return '-';
  if (!selesai || mulai === selesai) return formatTanggalIndo(mulai);
  return `${formatTanggalIndo(mulai)} – ${formatTanggalIndo(selesai)}`;
}

export function formatJamPendek(timeStr) {
  if (!timeStr) return '--:--';
  return String(timeStr).slice(0, 5);
}

export function toLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatClockWib(date = new Date()) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s} WIB`;
}

function timeStringToSeconds(timeStr) {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':').map(Number);
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
}

/**
 * Menghitung status waktu nyata (Sedang Berlangsung / Selesai / Akan Datang)
 * berdasarkan jam real-time perangkat saat ini.
 */
export function computeLiveSlotStatus(slot, targetDateStr, now = new Date()) {
  const todayStr = toLocalDateString(now);
  const startSec = timeStringToSeconds(slot?.jam_mulai);
  const endSec = timeStringToSeconds(slot?.jam_selesai);
  const isIstirahat = Boolean(
    slot?.is_istirahat || String(slot?.mata_pelajaran || '').toLowerCase().startsWith('istirahat')
  );

  if (startSec === null || endSec === null) {
    return {
      status: 'akan_datang',
      label: 'Terjadwal',
      isLive: false,
      isBreak: isIstirahat,
      progressPct: 0,
      sisaMenit: null,
    };
  }

  if (targetDateStr !== todayStr) {
    const isPastDay = targetDateStr < todayStr;
    return {
      status: isPastDay ? 'selesai' : 'akan_datang',
      label: isPastDay ? 'Selesai' : 'Akan Datang',
      isLive: false,
      isBreak: isIstirahat,
      progressPct: isPastDay ? 100 : 0,
      sisaMenit: null,
    };
  }

  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  if (nowSec >= startSec && nowSec < endSec) {
    const total = Math.max(1, endSec - startSec);
    const elapsed = Math.max(0, nowSec - startSec);
    const sisaMenit = Math.max(1, Math.ceil((endSec - nowSec) / 60));
    return {
      status: 'sedang_berlangsung',
      label: 'Sedang Berlangsung',
      isLive: true,
      isBreak: isIstirahat,
      progressPct: Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))),
      sisaMenit,
    };
  }

  if (nowSec >= endSec) {
    return {
      status: 'selesai',
      label: 'Selesai',
      isLive: false,
      isBreak: isIstirahat,
      progressPct: 100,
      sisaMenit: 0,
    };
  }

  return {
    status: 'akan_datang',
    label: 'Akan Datang',
    isLive: false,
    isBreak: isIstirahat,
    progressPct: 0,
    sisaMenit: Math.max(1, Math.ceil((startSec - nowSec) / 60)),
  };
}

export function getMomentumLabel(status) {
  const map = {
    penggantian_guru: 'Penggantian Guru',
    pindah_ruangan: 'Pindah Ruangan',
    ganti_mapel: 'Ganti Mata Pelajaran',
    jam_kosong: 'Jam Kosong / Penugasan',
    kegiatan_khusus: 'Kegiatan Khusus',
    jadwal_tambahan: 'Jadwal Tambahan',
  };
  return map[status] || 'Jadwal Momentum';
}

export function getRoleLabel(role) {
  const map = {
    siswa: 'Siswa',
    guru: 'Guru / Wali Kelas',
    admin_organisasi: 'Admin Organisasi',
  };
  return map[role] || role;
}
