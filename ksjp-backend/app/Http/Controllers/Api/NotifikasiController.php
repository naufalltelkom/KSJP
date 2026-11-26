<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use App\Models\User;
use App\Services\JadwalService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    public function __construct(private readonly JadwalService $jadwalService) {}

    /**
     * Mengembalikan daftar notifikasi real-time pengguna beserta status pengingat pergantian jam aktif.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tipe' => ['nullable', 'in:momentum,pergantian_jam,kalender,pengumuman'],
            'unread_only' => ['nullable', 'boolean'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $limit = (int) ($validated['limit'] ?? 30);

        $baseQuery = $this->visibleForUserQuery($user);

        if (! empty($validated['tipe'])) {
            $baseQuery->where('tipe', $validated['tipe']);
        }

        $items = (clone $baseQuery)
            ->with(['reads' => fn ($q) => $q->where('id_user', $user->id)])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(function (Notifikasi $notif) use ($user): array {
                $isRead = $notif->isReadBy($user);

                return [
                    'id' => $notif->id,
                    'judul' => $notif->judul,
                    'pesan' => $notif->pesan,
                    'tipe' => $notif->tipe,
                    'id_kelas' => $notif->id_kelas,
                    'data_payload' => $notif->data_payload,
                    'is_read' => $isRead,
                    'created_at' => $notif->created_at?->toIso8601String(),
                ];
            });

        if (! empty($validated['unread_only'])) {
            $items = $items->filter(fn (array $item): bool => $item['is_read'] === false)->values();
        }

        $allVisible = $this->visibleForUserQuery($user)
            ->with(['reads' => fn ($q) => $q->where('id_user', $user->id)])
            ->get();

        $unreadCount = $allVisible->filter(fn (Notifikasi $n): bool => ! $n->isReadBy($user))->count();

        $pengingatPergantianJam = null;
        if ($user->id_kelas !== null) {
            $harian = $this->jadwalService->getJadwalHarian($user->id_kelas, Carbon::today());
            $pengingatPergantianJam = $harian['pergantian_jam'];
        }

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
            'pengingat_pergantian_jam' => $pengingatPergantianJam,
            'data' => $items->values(),
        ]);
    }

    /**
     * Menandai satu notifikasi sebagai sudah dibaca.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $notifikasi = $this->visibleForUserQuery($user)->find($id);

        if ($notifikasi === null) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan.',
            ], 404);
        }

        $notifikasi->markAsReadFor($user);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi ditandai sudah dibaca.',
        ]);
    }

    /**
     * Menandai seluruh notifikasi pengguna sebagai sudah dibaca.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $notifikasiList = $this->visibleForUserQuery($user)
            ->with(['reads' => fn ($q) => $q->where('id_user', $user->id)])
            ->get();

        foreach ($notifikasiList as $notifikasi) {
            if (! $notifikasi->isReadBy($user)) {
                $notifikasi->markAsReadFor($user);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Seluruh notifikasi ditandai sudah dibaca.',
        ]);
    }

    private function visibleForUserQuery(User $user): Builder
    {
        return Notifikasi::query()->where(function (Builder $query) use ($user): void {
            $query->where('id_user', $user->id)
                ->orWhere(function (Builder $broadcast) use ($user): void {
                    $broadcast->whereNull('id_user')
                        ->where(function (Builder $scope) use ($user): void {
                            $scope->whereNull('id_kelas');
                            if ($user->id_kelas !== null) {
                                $scope->orWhere('id_kelas', $user->id_kelas);
                            }
                        });
                });
        });
    }
}
