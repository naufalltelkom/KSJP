<?php

namespace App\Services;

use App\Models\Notifikasi;
use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

/**
 * Mengirim background Web Push (VAPID) ke perangkat Android & iOS PWA siswa.
 */
class WebPushService
{
    public function isConfigured(): bool
    {
        return filled(config('services.webpush.public_key'))
            && filled(config('services.webpush.private_key'));
    }

    public function sendForNotifikasi(Notifikasi $notifikasi): int
    {
        if (! $this->isConfigured()) {
            return 0;
        }

        $query = PushSubscription::query();
        if ($notifikasi->id_user !== null) {
            $query->where('id_user', $notifikasi->id_user);
        } elseif ($notifikasi->id_kelas !== null) {
            $query->where('id_kelas', $notifikasi->id_kelas);
        }

        $subscriptions = $query->get();
        if ($subscriptions->isEmpty()) {
            return 0;
        }

        return $this->dispatchBatch($subscriptions, [
            'title' => $notifikasi->judul,
            'body' => $notifikasi->pesan,
            'tag' => "ksjp-notif-{$notifikasi->id}",
            'tipe' => $notifikasi->tipe,
            'url' => '/',
            'id' => $notifikasi->id,
        ]);
    }

    public function sendTestToUser(User $user): int
    {
        if (! $this->isConfigured()) {
            return 0;
        }

        $subscriptions = PushSubscription::where('id_user', $user->id)->get();
        if ($subscriptions->isEmpty()) {
            return 0;
        }

        return $this->dispatchBatch($subscriptions, [
            'title' => 'Tes Push Real-Time KSJP',
            'body' => "Halo {$user->nama_lengkap}, notifikasi langsung Android & iOS aktif!",
            'tag' => 'ksjp-test-' . now()->timestamp,
            'tipe' => 'pengumuman',
            'url' => '/',
        ]);
    }

    /**
     * @param  Collection<int, PushSubscription>  $subscriptions
     * @param  array<string, mixed>  $payload
     */
    private function dispatchBatch(Collection $subscriptions, array $payload): int
    {
        try {
            $webPush = new WebPush([
                'VAPID' => [
                    'subject' => (string) config('services.webpush.subject', 'mailto:admin@smktelkom-pwt.sch.id'),
                    'publicKey' => (string) config('services.webpush.public_key'),
                    'privateKey' => (string) config('services.webpush.private_key'),
                ],
            ]);

            $encodedPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

            foreach ($subscriptions as $sub) {
                $webPush->queueNotification(
                    Subscription::create([
                        'endpoint' => $sub->endpoint,
                        'publicKey' => $sub->p256dh,
                        'authToken' => $sub->auth,
                        'contentEncoding' => $sub->content_encoding ?: 'aes128gcm',
                    ]),
                    $encodedPayload,
                );
            }

            $sent = 0;
            foreach ($webPush->flush() as $report) {
                if ($report->isSuccess()) {
                    $sent++;
                    continue;
                }

                if ($report->isSubscriptionExpired()) {
                    $endpoint = $report->getEndpoint();
                    PushSubscription::where('endpoint_hash', hash('sha256', $endpoint))->delete();
                }
            }

            return $sent;
        } catch (\Throwable $e) {
            Log::warning('WebPush dispatch error: ' . $e->getMessage());

            return 0;
        }
    }
}
