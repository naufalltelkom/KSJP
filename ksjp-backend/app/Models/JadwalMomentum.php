<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Jadwal Dinamis (Momentum) yang menimpa jadwal reguler pada tanggal tertentu.
 */
class JadwalMomentum extends Model
{
    protected $table = 'jadwal_momentum';

    protected $fillable = [
        'id_kelas',
        'id_jadwal_reguler',
        'tanggal',
        'jam_ke',
        'jam_mulai',
        'jam_selesai',
        'mata_pelajaran',
        'nama_guru_pengganti',
        'ruangan_baru',
        'status_perubahan',
        'keterangan',
        'dibuat_oleh',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }

    public function jadwalReguler(): BelongsTo
    {
        return $this->belongsTo(JadwalPelajaran::class, 'id_jadwal_reguler');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
