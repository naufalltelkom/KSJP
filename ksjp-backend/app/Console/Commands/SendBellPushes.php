<?php

namespace App\Console\Commands;

use App\Services\WebPushService;
use Illuminate\Console\Command;

class SendBellPushes extends Command
{
    protected $signature = 'ksjp:bell-push';

    protected $description = 'Kirim notifikasi Web Push -10 menit (segera selesai) dan -5 menit (pergantian pelajaran & ruangan)';

    public function handle(WebPushService $webPushService): int
    {
        $result = $webPushService->dispatchBellReminders();
        $this->info("Checked {$result['checked_classes']} kelas, sent {$result['pushes_sent']} push(es).");

        return self::SUCCESS;
    }
}
