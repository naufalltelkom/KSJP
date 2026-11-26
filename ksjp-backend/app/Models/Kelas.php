<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Representasi kelas peserta didik di SMK Telkom Purwokerto.
 */
class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'nama_kelas',
        'tingkat',
        'konsentrasi',
        'wali_kelas',
        'tahun_ajaran',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'id_kelas');
    }

    public function siswa(): HasMany
    {
        return $this->hasMany(User::class, 'id_kelas')
            ->where('role', UserRole::Siswa->value);
    }

    public function jadwalPelajaran(): HasMany
    {
        return $this->hasMany(JadwalPelajaran::class, 'id_kelas');
    }

    public function jadwalMomentum(): HasMany
    {
        return $this->hasMany(JadwalMomentum::class, 'id_kelas');
    }

    public function notifikasi(): HasMany
    {
        return $this->hasMany(Notifikasi::class, 'id_kelas');
    }
}
