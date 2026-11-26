<?php

namespace App\Providers;

use App\Models\JadwalMomentum;
use App\Models\KalenderAkademik;
use App\Models\Notifikasi;
use App\Observers\JadwalMomentumObserver;
use App\Observers\KalenderAkademikObserver;
use App\Observers\NotifikasiObserver;
use Carbon\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Carbon::setLocale('id');

        if ($this->app->environment('production') || request()->header('x-forwarded-proto') === 'https') {
            URL::forceScheme('https');
        }

        JadwalMomentum::observe(JadwalMomentumObserver::class);
        KalenderAkademik::observe(KalenderAkademikObserver::class);
        Notifikasi::observe(NotifikasiObserver::class);
    }
}
