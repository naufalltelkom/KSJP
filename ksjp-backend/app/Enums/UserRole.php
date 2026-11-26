<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum UserRole: string implements HasColor, HasLabel
{
    case Siswa = 'siswa';
    case Guru = 'guru';
    case AdminOrganisasi = 'admin_organisasi';

    public function getLabel(): string
    {
        return match ($this) {
            self::Siswa => 'Siswa',
            self::Guru => 'Guru',
            self::AdminOrganisasi => 'Admin Organisasi',
        };
    }

    public function getColor(): string | array | null
    {
        return match ($this) {
            self::Siswa => 'info',
            self::Guru => 'success',
            self::AdminOrganisasi => 'warning',
        };
    }
}
