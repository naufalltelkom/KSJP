<?php

namespace App\Filament\Resources\JadwalMomentumResource\Pages;

use App\Filament\Resources\JadwalMomentumResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Auth;

class CreateJadwalMomentum extends CreateRecord
{
    protected static string $resource = JadwalMomentumResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['dibuat_oleh'] = Auth::id();

        return $data;
    }
}
