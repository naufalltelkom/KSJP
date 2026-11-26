<?php

namespace App\Observers;

use App\Models\JadwalMomentum;
use App\Models\Notifikasi;

/**
 * Mengirim notifikasi otomatis ke kelas saat guru membuat atau memperbarui Jadwal Dinamis (Momentum).
 */
class JadwalMomentumObserver
{
    public function created(JadwalMomentum $momentum): void
    {
        $this->dispatchMomentumNotification($momentum, isUpdate: false);
    }

    public function updated(JadwalMomentum $momentum): void
    {
        $this->dispatchMomentumNotification($momentum, isUpdate: true);
    }

    private function dispatchMomentumNotification(JadwalMomentum $momentum, bool $isUpdate): void
    {
        $momentum->loadMissing(['kelas', 'jadwalReguler']);

        $tanggal = $momentum->tanggal?->translatedFormat('d M Y') ?? (string) $momentum->tanggal;
        $mapel = $momentum->mata_pelajaran ?? $momentum->jadwalReguler?->mata_pelajaran ?? 'Jadwal Khusus';
        $prefix = $isUpdate ? 'Pembaruan Jadwal Momentum' : 'Jadwal Momentum Baru';

        $detailBagian = array_filter([
            $momentum->nama_guru_pengganti ? "Guru: {$momentum->nama_guru_pengganti}" : null,
            $momentum->ruangan_baru ? "Ruangan: {$momentum->ruangan_baru}" : null,
            $momentum->keterangan ?: null,
        ]);

        $pesan = "{$mapel} pada {$tanggal}";
        if ($detailBagian !== []) {
            $pesan .= ' — ' . implode(' | ', $detailBagian);
        }

        Notifikasi::create([
            'id_user' => null,
            'id_kelas' => $momentum->id_kelas,
            'judul' => "{$prefix}: {$mapel}",
            'pesan' => $pesan,
            'tipe' => 'momentum',
            'data_payload' => [
                'id_jadwal_momentum' => $momentum->id,
                'id_kelas' => $momentum->id_kelas,
                'tanggal' => $momentum->tanggal?->format('Y-m-d'),
                'status_perubahan' => $momentum->status_perubahan,
                'mata_pelajaran' => $mapel,
                'nama_guru_pengganti' => $momentum->nama_guru_pengganti,
                'ruangan_baru' => $momentum->ruangan_baru,
            ],
            'is_read' => false,
        ]);
    }
}
