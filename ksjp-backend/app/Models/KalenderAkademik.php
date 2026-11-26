<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Agenda Kalender Pendidikan resmi 2026/2027 serta kegiatan organisasi siswa.
 */
class KalenderAkademik extends Model
{
    protected $table = 'kalender_akademik';

    protected $fillable = [
        'judul',
        'tanggal_mulai',
        'tanggal_selesai',
        'kategori',
        'sumber',
        'penyelenggara',
        'target_kelas',
        'is_libur',
        'deskripsi',
        'dibuat_oleh',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'is_libur' => 'boolean',
        ];
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
