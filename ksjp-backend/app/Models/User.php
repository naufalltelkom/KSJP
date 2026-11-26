<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Pengguna sistem KSJP dengan 3 peran eksklusif: siswa, guru, admin_organisasi.
 */
class User extends Authenticatable implements FilamentUser, HasName
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nis',
        'username',
        'nama_lengkap',
        'email',
        'role',
        'id_kelas',
        'jenis_kelamin',
        'jabatan_organisasi',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    /**
     * Accessor kompatibilitas agar $user->name selalu mengembalikan nama_lengkap.
     */
    protected function name(): Attribute
    {
        return Attribute::get(fn (): string => (string) $this->nama_lengkap);
    }

    public function getFilamentName(): string
    {
        return (string) $this->nama_lengkap;
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return in_array($this->role, [UserRole::Guru, UserRole::AdminOrganisasi], true);
    }

    public function isSiswa(): bool
    {
        return $this->role === UserRole::Siswa;
    }

    public function isGuru(): bool
    {
        return $this->role === UserRole::Guru;
    }

    public function isAdminOrganisasi(): bool
    {
        return $this->role === UserRole::AdminOrganisasi;
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }
}
