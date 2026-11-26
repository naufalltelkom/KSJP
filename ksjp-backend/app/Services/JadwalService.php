<?php

namespace App\Services;

use App\Models\JadwalMomentum;
use App\Models\JadwalPelajaran;
use App\Models\KalenderAkademik;
use Carbon\Carbon;

/**
 * Mengelola resolusi jadwal pelajaran harian/mingguan dengan override otomatis Jadwal Dinamis (Momentum)
 * serta status live-time ("Sedang Berlangsung", "Selesai", "Akan Datang").
 */
class JadwalService
{
    private const HARI_INDONESIA = [
        0 => 'Minggu',
        1 => 'Senin',
        2 => 'Selasa',
        3 => 'Rabu',
        4 => 'Kamis',
        5 => 'Jumat',
        6 => 'Sabtu',
    ];

    public static function namaHari(Carbon $tanggal): string
    {
        return self::HARI_INDONESIA[$tanggal->dayOfWeek] ?? 'Senin';
    }

    /**
     * Mengambil jadwal harian suatu kelas pada tanggal tertentu dengan menimpa slot yang memiliki Jadwal Momentum.
     *
     * @return array{
     *     tanggal: string,
     *     hari: string,
     *     is_libur: bool,
     *     agenda_hari_ini: array<int, array<string, mixed>>,
     *     pergantian_jam: array<string, mixed>|null,
     *     jadwal: array<int, array<string, mixed>>
     * }
     */
    public function getJadwalHarian(int $kelasId, Carbon $tanggal): array
    {
        $namaHari = self::namaHari($tanggal);
        $tanggalStr = $tanggal->toDateString();

        $regulerList = JadwalPelajaran::where('id_kelas', $kelasId)
            ->where('hari', $namaHari)
            ->orderBy('jam_ke')
            ->orderBy('jam_mulai')
            ->get();

        $momentumList = JadwalMomentum::where('id_kelas', $kelasId)
            ->whereDate('tanggal', $tanggalStr)
            ->orderBy('jam_ke')
            ->orderBy('jam_mulai')
            ->get();

        $momentumByRegulerId = $momentumList
            ->filter(fn (JadwalMomentum $m) => $m->id_jadwal_reguler !== null)
            ->keyBy('id_jadwal_reguler');

        $momentumByJamKe = $momentumList
            ->filter(fn (JadwalMomentum $m) => $m->id_jadwal_reguler === null && $m->jam_ke !== null)
            ->keyBy('jam_ke');

        $usedMomentumIds = [];
        $hasil = collect();

        foreach ($regulerList as $reguler) {
            /** @var JadwalMomentum|null $momentum */
            $momentum = $momentumByRegulerId->get($reguler->id)
                ?? $momentumByJamKe->get($reguler->jam_ke);

            if ($momentum !== null) {
                $usedMomentumIds[] = $momentum->id;
                $hasil->push($this->formatMomentumSlot($momentum, $reguler));
                continue;
            }

            $hasil->push($this->formatRegulerSlot($reguler));
        }

        foreach ($momentumList as $momentum) {
            if (in_array($momentum->id, $usedMomentumIds, true)) {
                continue;
            }
            $hasil->push($this->formatMomentumSlot($momentum, $momentum->jadwalReguler));
        }

        $sekarang = Carbon::now();
        $isHariIni = $tanggal->isToday();

        $jadwalSorted = $hasil
            ->sortBy([
                ['jam_mulai', 'asc'],
                ['jam_ke', 'asc'],
            ])
            ->map(fn (array $slot): array => $this->attachLiveStatus($slot, $tanggal, $sekarang, $isHariIni))
            ->values()
            ->all();

        $agendaHariIni = KalenderAkademik::whereDate('tanggal_mulai', '<=', $tanggalStr)
            ->whereDate('tanggal_selesai', '>=', $tanggalStr)
            ->orderBy('tanggal_mulai')
            ->get()
            ->map(fn (KalenderAkademik $k): array => [
                'id' => $k->id,
                'judul' => $k->judul,
                'kategori' => $k->kategori,
                'sumber' => $k->sumber,
                'penyelenggara' => $k->penyelenggara,
                'is_libur' => (bool) $k->is_libur,
            ])
            ->values()
            ->all();

        $isLibur = collect($agendaHariIni)->contains(fn (array $a): bool => $a['is_libur'] === true)
            || $tanggal->isSunday();

        $pergantianJam = $isHariIni
            ? $this->hitungPergantianJam($jadwalSorted, $sekarang)
            : null;

        return [
            'tanggal' => $tanggalStr,
            'hari' => $namaHari,
            'is_libur' => $isLibur,
            'agenda_hari_ini' => $agendaHariIni,
            'pergantian_jam' => $pergantianJam,
            'jadwal' => $jadwalSorted,
        ];
    }

    /**
     * Mengambil jadwal mingguan (Senin - Sabtu) untuk minggu yang memuat $tanggal.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getJadwalMingguan(int $kelasId, Carbon $tanggal): array
    {
        $senin = $tanggal->copy()->startOfWeek(Carbon::MONDAY);
        $hariList = [];

        for ($i = 0; $i < 6; $i++) {
            $hariList[] = $this->getJadwalHarian($kelasId, $senin->copy()->addDays($i));
        }

        return $hariList;
    }

    /**
     * Menghitung informasi pengingat pergantian jam pelajaran real-time pada hari ini.
     *
     * @param  array<int, array<string, mixed>>  $jadwalHariIni
     * @return array<string, mixed>
     */
    public function hitungPergantianJam(array $jadwalHariIni, Carbon $sekarang): array
    {
        $waktuSekarang = $sekarang->format('H:i:s');
        $slotAktif = null;
        $slotBerikutnya = null;

        foreach ($jadwalHariIni as $slot) {
            $mulai = (string) ($slot['jam_mulai'] ?? '');
            $selesai = (string) ($slot['jam_selesai'] ?? '');

            if ($mulai === '' || $selesai === '') {
                continue;
            }

            if ($waktuSekarang >= $mulai && $waktuSekarang < $selesai) {
                $slotAktif = $slot;
                continue;
            }

            if ($slotBerikutnya === null && $mulai > $waktuSekarang) {
                $slotBerikutnya = $slot;
            }
        }

        $sisaMenitSelesai = null;
        if ($slotAktif !== null) {
            $selesaiTime = Carbon::createFromFormat('H:i:s', $slotAktif['jam_selesai'], $sekarang->timezone);
            if ($selesaiTime !== false) {
                $selesaiTime->setDate($sekarang->year, $sekarang->month, $sekarang->day);
                $sisaMenitSelesai = max(0, (int) $sekarang->diffInMinutes($selesaiTime, false));
            }
        }

        $menitMenujuBerikutnya = null;
        if ($slotBerikutnya !== null) {
            $mulaiTime = Carbon::createFromFormat('H:i:s', $slotBerikutnya['jam_mulai'], $sekarang->timezone);
            if ($mulaiTime !== false) {
                $mulaiTime->setDate($sekarang->year, $sekarang->month, $sekarang->day);
                $menitMenujuBerikutnya = max(0, (int) $sekarang->diffInMinutes($mulaiTime, false));
            }
        }

        $pesanPengingat = null;
        if ($slotAktif !== null && $sisaMenitSelesai !== null && $sisaMenitSelesai <= 10) {
            $nextName = $slotBerikutnya['mata_pelajaran'] ?? 'Jam pelajaran berakhir';
            $pesanPengingat = "Pergantian jam dalam {$sisaMenitSelesai} menit ({$nextName}).";
        } elseif ($slotAktif === null && $slotBerikutnya !== null && $menitMenujuBerikutnya !== null && $menitMenujuBerikutnya <= 15) {
            $pesanPengingat = "Kegiatan berikutnya {$slotBerikutnya['mata_pelajaran']} dimulai dalam {$menitMenujuBerikutnya} menit.";
        }

        return [
            'waktu_server' => $sekarang->format('H:i:s'),
            'slot_aktif' => $slotAktif,
            'slot_berikutnya' => $slotBerikutnya,
            'sisa_menit_jam_aktif' => $sisaMenitSelesai,
            'menit_menuju_jam_berikutnya' => $menitMenujuBerikutnya,
            'pengingat_aktif' => $pesanPengingat !== null,
            'pesan_pengingat' => $pesanPengingat,
        ];
    }

    /**
     * Menambahkan status live-time pada setiap slot jadwal agar client menampilkan "Sedang Berlangsung" secara tepat.
     *
     * @param  array<string, mixed>  $slot
     * @return array<string, mixed>
     */
    private function attachLiveStatus(array $slot, Carbon $tanggal, Carbon $sekarang, bool $isHariIni): array
    {
        $mulai = (string) ($slot['jam_mulai'] ?? '');
        $selesai = (string) ($slot['jam_selesai'] ?? '');

        $isIstirahat = str_starts_with(mb_strtolower((string) ($slot['mata_pelajaran'] ?? '')), 'istirahat');
        $slot['is_istirahat'] = $isIstirahat;

        if (! $isHariIni || $mulai === '' || $selesai === '') {
            $isPastDay = $tanggal->copy()->startOfDay()->lt($sekarang->copy()->startOfDay());
            $slot['sedang_berlangsung'] = false;
            $slot['status_waktu'] = $isPastDay ? 'selesai' : 'akan_datang';
            $slot['status_waktu_label'] = $isPastDay ? 'Selesai' : 'Akan Datang';
            $slot['progress_persen'] = $isPastDay ? 100 : 0;
            $slot['sisa_menit'] = null;

            return $slot;
        }

        $waktuSekarang = $sekarang->format('H:i:s');

        if ($waktuSekarang >= $mulai && $waktuSekarang < $selesai) {
            $startDt = Carbon::createFromFormat('H:i:s', $mulai, $sekarang->timezone)
                ?->setDate($sekarang->year, $sekarang->month, $sekarang->day);
            $endDt = Carbon::createFromFormat('H:i:s', $selesai, $sekarang->timezone)
                ?->setDate($sekarang->year, $sekarang->month, $sekarang->day);

            $totalSec = ($startDt && $endDt) ? max(1, $startDt->diffInSeconds($endDt)) : 1;
            $elapsedSec = $startDt ? max(0, $startDt->diffInSeconds($sekarang)) : 0;
            $sisaMenit = $endDt ? max(0, (int) ceil($sekarang->diffInSeconds($endDt, false) / 60)) : 0;

            $slot['sedang_berlangsung'] = true;
            $slot['status_waktu'] = 'sedang_berlangsung';
            $slot['status_waktu_label'] = 'Sedang Berlangsung';
            $slot['progress_persen'] = min(100, max(0, (int) round(($elapsedSec / $totalSec) * 100)));
            $slot['sisa_menit'] = $sisaMenit;
        } elseif ($waktuSekarang >= $selesai) {
            $slot['sedang_berlangsung'] = false;
            $slot['status_waktu'] = 'selesai';
            $slot['status_waktu_label'] = 'Selesai';
            $slot['progress_persen'] = 100;
            $slot['sisa_menit'] = 0;
        } else {
            $slot['sedang_berlangsung'] = false;
            $slot['status_waktu'] = 'akan_datang';
            $slot['status_waktu_label'] = 'Akan Datang';
            $slot['progress_persen'] = 0;
            $slot['sisa_menit'] = null;
        }

        return $slot;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatRegulerSlot(JadwalPelajaran $reguler): array
    {
        return [
            'id' => $reguler->id,
            'momentum_id' => null,
            'jam_ke' => $reguler->jam_ke,
            'jam_mulai' => $reguler->jam_mulai,
            'jam_selesai' => $reguler->jam_selesai,
            'mata_pelajaran' => $reguler->mata_pelajaran,
            'nama_guru' => $reguler->nama_guru,
            'ruangan' => $reguler->ruangan,
            'is_momentum' => false,
            'status_perubahan' => null,
            'keterangan' => null,
            'jadwal_reguler_asli' => null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatMomentumSlot(JadwalMomentum $momentum, ?JadwalPelajaran $reguler): array
    {
        return [
            'id' => $reguler?->id,
            'momentum_id' => $momentum->id,
            'jam_ke' => $momentum->jam_ke ?? $reguler?->jam_ke ?? 0,
            'jam_mulai' => $momentum->jam_mulai ?? $reguler?->jam_mulai,
            'jam_selesai' => $momentum->jam_selesai ?? $reguler?->jam_selesai,
            'mata_pelajaran' => $momentum->mata_pelajaran ?? $reguler?->mata_pelajaran ?? 'Kegiatan Khusus',
            'nama_guru' => $momentum->nama_guru_pengganti ?? $reguler?->nama_guru ?? '-',
            'ruangan' => $momentum->ruangan_baru ?? $reguler?->ruangan ?? '-',
            'is_momentum' => true,
            'status_perubahan' => $momentum->status_perubahan,
            'keterangan' => $momentum->keterangan,
            'jadwal_reguler_asli' => $reguler ? [
                'id' => $reguler->id,
                'mata_pelajaran' => $reguler->mata_pelajaran,
                'nama_guru' => $reguler->nama_guru,
                'ruangan' => $reguler->ruangan,
                'jam_mulai' => $reguler->jam_mulai,
                'jam_selesai' => $reguler->jam_selesai,
            ] : null,
        ];
    }
}
