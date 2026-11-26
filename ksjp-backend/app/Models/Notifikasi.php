<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Notifikasi real-time untuk momentum jadwal, pergantian jam, dan agenda kalender.
 */
class Notifikasi extends Model
{
    protected $table = 'notifikasi';

    protected $fillable = [
        'id_user',
        'id_kelas',
        'judul',
        'pesan',
        'tipe',
        'data_payload',
        'is_read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'data_payload' => 'array',
            'is_read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(NotifikasiRead::class, 'id_notifikasi');
    }

    public function isReadBy(User $user): bool
    {
        if ($this->id_user !== null) {
            return (bool) $this->is_read;
        }

        if ($this->relationLoaded('reads')) {
            return $this->reads->contains('id_user', $user->id);
        }

        return $this->reads()->where('id_user', $user->id)->exists();
    }

    public function markAsReadFor(User $user): void
    {
        if ($this->id_user !== null) {
            if (! $this->is_read) {
                $this->forceFill([
                    'is_read' => true,
                    'read_at' => now(),
                ])->save();
            }

            return;
        }

        $this->reads()->firstOrCreate(
            ['id_user' => $user->id],
            ['read_at' => now()],
        );
    }
}
