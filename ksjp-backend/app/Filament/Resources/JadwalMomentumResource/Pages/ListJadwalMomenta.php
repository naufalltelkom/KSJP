<?php

namespace App\Filament\Resources\JadwalMomentumResource\Pages;

use App\Filament\Resources\JadwalMomentumResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListJadwalMomenta extends ListRecords
{
    protected static string $resource = JadwalMomentumResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
