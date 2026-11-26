<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\User;
use App\Services\JadwalService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JadwalController extends Controller
{
    public function __construct(private readonly JadwalService $jadwalService) {}

    /**
     * Mengembalikan jadwal pelajaran kelas dengan override otomatis Jadwal Dinamis (Momentum).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tanggal' => ['nullable', 'date'],
            'mode' => ['nullable', 'in:harian,mingguan'],
            'id_kelas' => ['nullable', 'integer', 'exists:kelas,id'],
        ]);

        /** @var User $user */
        $user = $request->user();

        if ($user->isSiswa()) {
            if (isset($validated['id_kelas']) && (int) $validated['id_kelas'] !== (int) $user->id_kelas) {
                return response()->json([
                    'success' => false,
                    'message' => 'Siswa hanya dapat melihat jadwal kelasnya sendiri.',
                ], 403);
            }
            $kelasId = $user->id_kelas;
        } else {
            $kelasId = isset($validated['id_kelas'])
                ? (int) $validated['id_kelas']
                : ($user->id_kelas ?? Kelas::query()->value('id'));
        }

        if ($kelasId === null) {
            return response()->json([
                'success' => false,
                'message' => 'Data kelas tidak ditemukan.',
            ], 404);
        }

        $kelas = Kelas::findOrFail($kelasId);
        $tanggal = isset($validated['tanggal'])
            ? Carbon::parse($validated['tanggal'])
            : Carbon::today();
        $mode = $validated['mode'] ?? 'harian';

        if ($mode === 'mingguan') {
            $mingguan = $this->jadwalService->getJadwalMingguan($kelas->id, $tanggal);

            return response()->json([
                'success' => true,
                'mode' => 'mingguan',
                'kelas' => $this->formatKelas($kelas),
                'data' => $mingguan,
            ]);
        }

        $harian = $this->jadwalService->getJadwalHarian($kelas->id, $tanggal);

        return response()->json([
            'success' => true,
            'mode' => 'harian',
            'kelas' => $this->formatKelas($kelas),
            'data' => $harian,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatKelas(Kelas $kelas): array
    {
        return [
            'id' => $kelas->id,
            'nama_kelas' => $kelas->nama_kelas,
            'tingkat' => $kelas->tingkat,
            'konsentrasi' => $kelas->konsentrasi,
            'wali_kelas' => $kelas->wali_kelas,
            'tahun_ajaran' => $kelas->tahun_ajaran,
        ];
    }
}
