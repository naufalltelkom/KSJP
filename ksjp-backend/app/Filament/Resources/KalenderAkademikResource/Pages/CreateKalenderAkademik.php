<?php

namespace App\Filament\Resources\KalenderAkademikResource\Pages;

use App\Filament\Resources\KalenderAkademikResource;
use App\Models\User;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Auth;

class CreateKalenderAkademik extends CreateRecord
{
    protected static string $resource = KalenderAkademikResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        /** @var User|null $user */
        $user = Auth::user();
        $data['dibuat_oleh'] = $user?->id;

        if ($user?->isAdminOrganisasi()) {
            $data['sumber'] = 'organisasi';
            $data['penyelenggara'] = $data['penyelenggara'] ?: ($user->jabatan_organisasi ?: 'OSIS');
        }

        return $data;
    }
}
