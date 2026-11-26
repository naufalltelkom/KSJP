<?php

namespace App\Filament\Resources\JadwalMomentumResource\Pages;

use App\Filament\Resources\JadwalMomentumResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditJadwalMomentum extends EditRecord
{
    protected static string $resource = JadwalMomentumResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
