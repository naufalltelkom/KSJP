<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pencatatan status terbaca per pengguna untuk notifikasi broadcast kelas/sekolah.
 */
class NotifikasiRead extends Model
{
    protected $table = 'notifikasi_reads';

    public $timestamps = false;

    protected $fillable = [
        'id_notifikasi',
        'id_user',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    public function notifikasi(): BelongsTo
    {
        return $this->belongsTo(Notifikasi::class, 'id_notifikasi');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
