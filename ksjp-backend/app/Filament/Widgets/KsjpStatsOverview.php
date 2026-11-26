<?php

namespace App\Filament\Widgets;

use App\Enums\UserRole;
use App\Models\JadwalMomentum;
use App\Models\JadwalPelajaran;
use App\Models\KalenderAkademik;
use App\Models\Notifikasi;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Auth;

class KsjpStatsOverview extends StatsOverviewWidget
{
    protected static bool $isLazy = false;

    public static function canView(): bool
    {
        return Auth::user()?->isGuru() ?? false;
    }

    protected function getStats(): array
    {
        $totalSiswa = User::where('role', UserRole::Siswa->value)->count();
        $totalMomentum = JadwalMomentum::count();
        $totalKalender = KalenderAkademik::count();
        $totalReguler = JadwalPelajaran::count();
        $totalNotif = Notifikasi::count();

        return [
            Stat::make('Peserta Didik Terdaftar', "{$totalSiswa} Siswa")
                ->description('Kelas XI PPLG 4 — RPL')
                ->color('info'),
            Stat::make('Slot Jadwal Reguler', (string) $totalReguler)
                ->description("{$totalMomentum} Jadwal Momentum aktif")
                ->color('warning'),
            Stat::make('Agenda Kalender 2026/2027', (string) $totalKalender)
                ->description("{$totalNotif} notifikasi real-time tercatat")
                ->color('success'),
        ];
    }
}
