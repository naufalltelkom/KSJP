<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function vapidPublicKey(): JsonResponse
    {
        $publicKey = config('services.webpush.public_key');

        return response()->json([
            'success' => filled($publicKey),
            'public_key' => $publicKey,
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url', 'max:2000'],
            'keys' => ['required', 'array'],
            'keys.p256dh' => ['required', 'string', 'max:500'],
            'keys.auth' => ['required', 'string', 'max:200'],
            'content_encoding' => ['nullable', 'string', 'max:32'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $endpoint = $validated['endpoint'];
        $hash = hash('sha256', $endpoint);

        $subscription = PushSubscription::updateOrCreate(
            ['endpoint_hash' => $hash],
            [
                'id_user' => $user->id,
                'id_kelas' => $user->id_kelas,
                'endpoint' => $endpoint,
                'p256dh' => $validated['keys']['p256dh'],
                'auth' => $validated['keys']['auth'],
                'content_encoding' => $validated['content_encoding'] ?? 'aes128gcm',
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ],
        );

        return response()->json([
            'success' => true,
            'message' => 'Perangkat terdaftar untuk notifikasi real-time Android & iOS.',
            'data' => [
                'id' => $subscription->id,
            ],
        ]);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url', 'max:2000'],
        ]);

        PushSubscription::where('endpoint_hash', hash('sha256', $validated['endpoint']))->delete();

        return response()->json([
            'success' => true,
            'message' => 'Langganan notifikasi perangkat dihapus.',
        ]);
    }

    public function test(Request $request, WebPushService $webPushService): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['nullable', 'in:default,jam_masuk,segera_selesai,pergantian,sesi_terakhir'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $mode = $validated['mode'] ?? 'default';
        $sent = $webPushService->sendTestToUser($user, $mode);

        return response()->json([
            'success' => true,
            'sent' => $sent,
            'mode' => $mode,
            'message' => $sent > 0
                ? 'Push real-time berhasil dikirim ke perangkat terdaftar.'
                : 'Belum ada subscription push aktif untuk akun ini atau VAPID key belum diset.',
        ]);
    }

    public function runBellReminder(Request $request, WebPushService $webPushService): JsonResponse
    {
        $secret = env('CRON_SECRET');
        if (filled($secret)) {
            $token = $request->bearerToken() ?: $request->query('secret');
            if ($token !== $secret) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }
        }

        $result = $webPushService->dispatchBellReminders();

        return response()->json([
            'success' => true,
            'waktu_wib' => now('Asia/Jakarta')->format('Y-m-d H:i:s'),
            'data' => $result,
        ]);
    }
}
