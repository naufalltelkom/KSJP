<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Jadwal pelajaran reguler mingguan per kelas.
 */
class JadwalPelajaran extends Model
{
    protected $table = 'jadwal_pelajaran';

    protected $fillable = [
        'id_kelas',
        'id_guru',
        'hari',
        'jam_ke',
        'jam_mulai',
        'jam_selesai',
        'mata_pelajaran',
        'nama_guru',
        'ruangan',
    ];

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }

    public function guru(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_guru');
    }

    public function momentum(): HasMany
    {
        return $this->hasMany(JadwalMomentum::class, 'id_jadwal_reguler');
    }
}
