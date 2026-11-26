<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KalenderAkademik;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KalenderController extends Controller
{
    /**
     * Mengembalikan daftar agenda Kalender Pendidikan 2026/2027 dan agenda organisasi siswa.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'tahun' => ['nullable', 'integer', 'min:2025', 'max:2030'],
            'kategori' => ['nullable', 'string', 'max:50'],
            'sumber' => ['nullable', 'in:resmi_sekolah,organisasi'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $query = KalenderAkademik::query();

        if (isset($validated['bulan']) && isset($validated['tahun'])) {
            $awal = Carbon::createFromDate((int) $validated['tahun'], (int) $validated['bulan'], 1)->startOfMonth();
            $akhir = $awal->copy()->endOfMonth();

            $query->whereDate('tanggal_mulai', '<=', $akhir->toDateString())
                ->whereDate('tanggal_selesai', '>=', $awal->toDateString());
        } elseif (isset($validated['tahun'])) {
            $awal = Carbon::createFromDate((int) $validated['tahun'], 1, 1)->startOfYear();
            $akhir = $awal->copy()->endOfYear();

            $query->whereDate('tanggal_mulai', '<=', $akhir->toDateString())
                ->whereDate('tanggal_selesai', '>=', $awal->toDateString());
        } elseif (isset($validated['bulan'])) {
            $bulan = (int) $validated['bulan'];
            $tahun = $bulan >= 7 ? 2026 : 2027;
            $awal = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth();
            $akhir = $awal->copy()->endOfMonth();

            $query->whereDate('tanggal_mulai', '<=', $akhir->toDateString())
                ->whereDate('tanggal_selesai', '>=', $awal->toDateString());
        }

        if (! empty($validated['kategori'])) {
            $query->where('kategori', $validated['kategori']);
        }

        if (! empty($validated['sumber'])) {
            $query->where('sumber', $validated['sumber']);
        }

        if (! empty($validated['search'])) {
            $term = '%' . mb_strtolower($validated['search']) . '%';
            $query->where(function ($q) use ($term): void {
                $q->whereRaw('LOWER(judul) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(deskripsi, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(penyelenggara, \'\')) LIKE ?', [$term]);
            });
        }

        $items = $query
            ->orderBy('tanggal_mulai')
            ->orderBy('id')
            ->get()
            ->map(fn (KalenderAkademik $item): array => [
                'id' => $item->id,
                'judul' => $item->judul,
                'tanggal_mulai' => $item->tanggal_mulai?->format('Y-m-d'),
                'tanggal_selesai' => $item->tanggal_selesai?->format('Y-m-d'),
                'kategori' => $item->kategori,
                'sumber' => $item->sumber,
                'penyelenggara' => $item->penyelenggara,
                'target_kelas' => $item->target_kelas,
                'is_libur' => (bool) $item->is_libur,
                'deskripsi' => $item->deskripsi,
            ])
            ->values();

        return response()->json([
            'success' => true,
            'tahun_pelajaran' => '2026/2027',
            'total' => $items->count(),
            'data' => $items,
        ]);
    }
}
