<?php

namespace App\Observers;

use App\Models\Notifikasi;
use App\Services\WebPushService;

class NotifikasiObserver
{
    public function created(Notifikasi $notifikasi): void
    {
        app(WebPushService::class)->sendForNotifikasi($notifikasi);
    }
}
