<?php

namespace Database\Seeders;

use App\Models\JadwalMomentum;
use App\Models\JadwalPelajaran;
use App\Models\Kelas;
use App\Models\Notifikasi;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class JadwalMomentumSeeder extends Seeder
{
    public function run(): void
    {
        $xiPplg4 = Kelas::where('nama_kelas', 'XI PPLG 4')->firstOrFail();
        $firda = User::where('username', 'firda.ayu')->first();

        $hariMap = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            0 => 'Minggu',
        ];

        $today = Carbon::today();
        $targetDate = $today->isSunday() || $today->isSaturday()
            ? $today->copy()->next(Carbon::MONDAY)
            : $today->copy();
        $namaHari = $hariMap[$targetDate->dayOfWeek] ?? 'Senin';

        // Pilih slot mata pelajaran inti (bukan Istirahat/Tadarus/Apel) sebagai contoh Jadwal Momentum
        $slotReguler = JadwalPelajaran::where('id_kelas', $xiPplg4->id)
            ->where('hari', $namaHari)
            ->whereNotIn('mata_pelajaran', ['Tadarus', 'Istirahat', 'Istirahat (Sholat Jumat)', 'Apel / Upacara'])
            ->orderBy('jam_ke')
            ->first()
            ?? JadwalPelajaran::where('id_kelas', $xiPplg4->id)->where('hari', $namaHari)->orderBy('jam_ke')->first();

        JadwalMomentum::withoutEvents(function () use ($xiPplg4, $firda, $targetDate, $slotReguler): void {
            JadwalMomentum::where('id_kelas', $xiPplg4->id)->delete();

            $momentum = JadwalMomentum::create([
                'id_kelas' => $xiPplg4->id,
                'id_jadwal_reguler' => $slotReguler?->id,
                'tanggal' => $targetDate->format('Y-m-d'),
                'jam_ke' => $slotReguler?->jam_ke ?? 1,
                'jam_mulai' => $slotReguler?->jam_mulai ?? '07:10:00',
                'jam_selesai' => $slotReguler?->jam_selesai ?? '07:50:00',
                'mata_pelajaran' => $slotReguler?->mata_pelajaran ?? 'Pemrograman Berbasis Mobile',
                'nama_guru_pengganti' => 'Firda Ayu Nirmala, S.Kom (Guru Pendamping)',
                'ruangan_baru' => 'RPS SEL (Pindah Ruang Lab)',
                'status_perubahan' => 'pindah_ruangan',
                'keterangan' => 'Perpindahan ruangan ke RPS SEL untuk praktikum terpadu XI PPLG 4.',
                'dibuat_oleh' => $firda?->id,
            ]);

            Notifikasi::updateOrCreate(
                [
                    'id_kelas' => $xiPplg4->id,
                    'tipe' => 'momentum',
                    'judul' => 'Jadwal Momentum: Pindah Ruangan XI PPLG 4',
                ],
                [
                    'id_user' => null,
                    'pesan' => ($slotReguler?->mata_pelajaran ?? 'Mata Pelajaran') . ' pada ' . $targetDate->format('d M Y') . ' dipindahkan ke RPS SEL (Pindah Ruang Lab).',
                    'data_payload' => [
                        'id_jadwal_momentum' => $momentum->id,
                        'id_kelas' => $xiPplg4->id,
                        'tanggal' => $targetDate->format('Y-m-d'),
                        'status_perubahan' => 'pindah_ruangan',
                        'ruangan_baru' => 'RPS SEL (Pindah Ruang Lab)',
                    ],
                    'is_read' => false,
                ],
            );

            Notifikasi::updateOrCreate(
                [
                    'id_kelas' => $xiPplg4->id,
                    'tipe' => 'kalender',
                    'judul' => 'Kalender Pendidikan 2026/2027 Aktif',
                ],
                [
                    'id_user' => null,
                    'pesan' => 'Kalender Pendidikan resmi SMK Telkom Purwokerto TP 2026/2027 (Juli 2026 - Juni 2027) telah tersedia.',
                    'data_payload' => [
                        'tahun_ajaran' => '2026/2027',
                    ],
                    'is_read' => false,
                ],
            );
        });
    }
}
