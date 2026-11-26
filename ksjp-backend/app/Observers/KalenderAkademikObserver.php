<?php

namespace App\Observers;

use App\Models\KalenderAkademik;
use App\Models\Notifikasi;

/**
 * Mengirim notifikasi otomatis saat agenda kalender/organisasi baru ditambahkan.
 */
class KalenderAkademikObserver
{
    public function created(KalenderAkademik $agenda): void
    {
        $penyelenggara = $agenda->penyelenggara ?: 'SMK Telkom Purwokerto';
        $mulai = $agenda->tanggal_mulai?->format('Y-m-d');
        $selesai = $agenda->tanggal_selesai?->format('Y-m-d');
        $rentang = $mulai === $selesai ? $mulai : "{$mulai} s.d. {$selesai}";

        Notifikasi::create([
            'id_user' => null,
            'id_kelas' => null,
            'judul' => "Agenda Baru ({$penyelenggara}): {$agenda->judul}",
            'pesan' => "Agenda {$agenda->judul} dijadwalkan pada {$rentang} (Target: " . ($agenda->target_kelas ?: 'Semua Kelas') . ').',
            'tipe' => 'kalender',
            'data_payload' => [
                'id_kalender' => $agenda->id,
                'kategori' => $agenda->kategori,
                'sumber' => $agenda->sumber,
                'penyelenggara' => $penyelenggara,
                'tanggal_mulai' => $mulai,
                'tanggal_selesai' => $selesai,
            ],
            'is_read' => false,
        ]);
    }
}
