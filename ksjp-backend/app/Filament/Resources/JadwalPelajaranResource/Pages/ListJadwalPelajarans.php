<?php

namespace App\Filament\Resources\JadwalPelajaranResource\Pages;

use App\Filament\Resources\JadwalPelajaranResource;
use App\Filament\Widgets\JadwalRegulerLiveWidget;
use App\Services\JadwalService;
use Carbon\Carbon;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListJadwalPelajarans extends ListRecords
{
    protected static string $resource = JadwalPelajaranResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    protected function getHeaderWidgets(): array
    {
        return [
            JadwalRegulerLiveWidget::class,
        ];
    }

    public function getDefaultActiveTab(): string | int | null
    {
        $hari = JadwalService::namaHari(Carbon::now('Asia/Jakarta'));

        return in_array($hari, ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'], true)
            ? $hari
            : 'Senin';
    }

    public function getTabs(): array
    {
        $hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        $tabs = [];

        foreach ($hariList as $hari) {
            $tabs[$hari] = Tab::make($hari)
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('hari', $hari));
        }

        $tabs['semua'] = Tab::make('Semua Hari');

        return $tabs;
    }
}
