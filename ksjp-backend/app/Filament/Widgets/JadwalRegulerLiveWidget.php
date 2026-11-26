<?php

namespace App\Filament\Widgets;

use App\Models\Kelas;
use App\Services\JadwalService;
use Carbon\Carbon;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;

class JadwalRegulerLiveWidget extends Widget
{
    protected static bool $isDiscovered = false;

    protected static bool $isLazy = false;

    protected int | string | array $columnSpan = 'full';

    protected string $view = 'filament.widgets.jadwal-reguler-live-widget';

    /**
     * @return array<string, mixed>
     */
    protected function getViewData(): array
    {
        $user = Auth::user();
        $kelas = $user?->kelas ?? Kelas::where('nama_kelas', 'XI PPLG 4')->first();

        if (! $kelas) {
            return [
                'kelas' => null,
                'harian' => null,
                'slotAktif' => null,
                'slotBerikutnya' => null,
                'momentumCount' => 0,
                'waktuWib' => Carbon::now('Asia/Jakarta')->format('H:i'),
            ];
        }

        $today = Carbon::today('Asia/Jakarta');
        $harian = app(JadwalService::class)->getJadwalHarian($kelas->id, $today);
        $slots = collect($harian['jadwal'] ?? []);

        return [
            'kelas' => $kelas,
            'harian' => $harian,
            'slotAktif' => $slots->firstWhere('sedang_berlangsung', true),
            'slotBerikutnya' => $harian['pergantian_jam']['slot_berikutnya'] ?? null,
            'momentumCount' => $slots->where('is_momentum', true)->count(),
            'waktuWib' => Carbon::now('Asia/Jakarta')->format('H:i'),
        ];
    }
}
