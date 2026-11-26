<?php

namespace App\Filament\Widgets;

use App\Filament\Widgets\Concerns\BuildsKalenderViewData;
use Filament\Widgets\Widget;

class KalenderSiswaOverviewWidget extends Widget
{
    use BuildsKalenderViewData;

    protected static bool $isDiscovered = false;

    protected static bool $isLazy = false;

    protected int | string | array $columnSpan = 'full';

    protected string $view = 'filament.widgets.kalender-siswa-widget';

    /**
     * @return array<string, mixed>
     */
    protected function getViewData(): array
    {
        return $this->prepareKalenderData(snippetMode: false);
    }
}
