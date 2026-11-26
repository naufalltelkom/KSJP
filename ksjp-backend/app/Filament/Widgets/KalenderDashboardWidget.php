<?php

namespace App\Filament\Widgets;

use App\Filament\Widgets\Concerns\BuildsKalenderViewData;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;

class KalenderDashboardWidget extends Widget
{
    use BuildsKalenderViewData;

    protected static ?int $sort = 2;

    protected static bool $isLazy = false;

    protected int | string | array $columnSpan = 'full';

    protected string $view = 'filament.widgets.kalender-siswa-widget';

    public static function canView(): bool
    {
        return Auth::user()?->isAdminOrganisasi() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    protected function getViewData(): array
    {
        return $this->prepareKalenderData(snippetMode: true);
    }
}
