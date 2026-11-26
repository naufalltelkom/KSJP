<?php

namespace App\Services;

use App\Models\Notifikasi;
use App\Models\PushSubscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
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

    public function sendTestToUser(User $user, string $mode = 'default'): int
    {
        if (! $this->isConfigured()) {
            return 0;
        }

        $subscriptions = PushSubscription::where('id_user', $user->id)->get();
        if ($subscriptions->isEmpty()) {
            return 0;
        }

        $payload = match ($mode) {
            'jam_masuk' => [
                'title' => 'Pengingat Jam Masuk',
                'body' => '10 menit lagi jam masuk / sesi 1 mulai (07:00 WIB): Tadarus • Ruang B.2.2.',
                'tag' => 'ksjp-sim-masuk-' . now()->timestamp,
                'tipe' => 'pergantian_jam',
                'url' => '/',
            ],
            'segera_selesai' => [
                'title' => 'Sebentar lagi selesai pelajaran Bahasa Indonesia',
                'body' => 'Sebentar lagi selesai pelajaran Bahasa Indonesia (10 menit lagi, pukul 14:00 WIB). Berikutnya: Kreativitas, Inovasi, dan Kewirausahaan (Ruang RPS SEL).',
                'tag' => 'ksjp-sim-10m-' . now()->timestamp,
                'tipe' => 'pergantian_jam',
                'url' => '/',
            ],
            'pergantian' => [
                'title' => 'Pergantian Pelajaran dan Ruangan',
                'body' => 'Pergantian Pelajaran dan Ruangan dalam 5 menit (14:00 WIB): Kreativitas, Inovasi, dan Kewirausahaan • Ruang RPS SEL • Guru: Tutut Destria Eliana.',
                'tag' => 'ksjp-sim-5m-' . now()->timestamp,
                'tipe' => 'pergantian_jam',
                'url' => '/',
            ],
            'sesi_terakhir' => [
                'title' => 'Sesi Terakhir Akan Selesai',
                'body' => 'Sesi terakhir (Ekskul Prestasi atau Ekskul Sentra) akan selesai dalam 10 menit (jam pulang pukul 16:00 WIB).',
                'tag' => 'ksjp-sim-pulang-' . now()->timestamp,
                'tipe' => 'pergantian_jam',
                'url' => '/',
            ],
            default => [
                'title' => 'Tes Push Real-Time KSJP',
                'body' => "Halo {$user->nama_lengkap}, notifikasi langsung Android & iOS aktif!",
                'tag' => 'ksjp-test-' . now()->timestamp,
                'tipe' => 'pengumuman',
                'url' => '/',
            ],
        };

        return $this->dispatchBatch($subscriptions, $payload);
    }

    /**
     * Memeriksa seluruh kelas yang memiliki subscriber dan mengirim push -10 menit / -5 menit saat waktunya tiba.
     *
     * @return array{checked_classes: int, pushes_sent: int, alerts: array<int, array<string, mixed>>}
     */
    public function dispatchBellReminders(?Carbon $now = null): array
    {
        if (! $this->isConfigured()) {
            return ['checked_classes' => 0, 'pushes_sent' => 0, 'alerts' => []];
        }

        $sekarang = ($now ?? Carbon::now('Asia/Jakarta'))->copy()->setTimezone('Asia/Jakarta');
        $jadwalService = app(JadwalService::class);
        $kelasIds = PushSubscription::whereNotNull('id_kelas')
            ->distinct()
            ->pluck('id_kelas');

        $totalSent = 0;
        $alerts = [];

        foreach ($kelasIds as $kelasId) {
            $harian = $jadwalService->getJadwalHarian((int) $kelasId, $sekarang);
            if ($harian['is_libur'] ?? false) {
                continue;
            }

            $bell = $harian['pergantian_jam'] ?? null;
            if (! is_array($bell) || ! ($bell['pengingat_aktif'] ?? false)) {
                continue;
            }

            $jenis = (string) ($bell['peringatan_jenis'] ?? '');
            $judul = (string) ($bell['peringatan_judul'] ?? 'Pengingat Pergantian Jam KSJP');
            $pesan = (string) ($bell['pesan_pengingat'] ?? '');
            if ($jenis === '' || $pesan === '') {
                continue;
            }

            $slotRef = $jenis === 'pergantian_pelajaran'
                ? ($bell['slot_berikutnya']['jam_mulai'] ?? $bell['slot_aktif']['jam_selesai'] ?? 'end')
                : ($bell['slot_aktif']['jam_selesai'] ?? $bell['slot_berikutnya']['jam_mulai'] ?? 'slot');

            $dedupKey = sprintf(
                'ksjp_bell_%s_%d_%s_%s',
                $sekarang->toDateString(),
                (int) $kelasId,
                $jenis,
                preg_replace('/[^a-zA-Z0-9]/', '', (string) $slotRef),
            );

            try {
                if (! Cache::store('database')->add($dedupKey, true, now()->addHours(12))) {
                    continue;
                }
            } catch (\Throwable) {
                if (! Cache::add($dedupKey, true, now()->addHours(12))) {
                    continue;
                }
            }

            $subscriptions = PushSubscription::where('id_kelas', $kelasId)->get();
            if ($subscriptions->isEmpty()) {
                continue;
            }

            $sent = $this->dispatchBatch($subscriptions, [
                'title' => $judul,
                'body' => $pesan,
                'tag' => $dedupKey,
                'tipe' => 'pergantian_jam',
                'url' => '/',
            ]);

            $totalSent += $sent;
            $alerts[] = [
                'id_kelas' => (int) $kelasId,
                'jenis' => $jenis,
                'judul' => $judul,
                'sent' => $sent,
            ];
        }

        return [
            'checked_classes' => $kelasIds->count(),
            'pushes_sent' => $totalSent,
            'alerts' => $alerts,
        ];
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
