<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\JadwalMomentum;
use App\Models\JadwalPelajaran;
use App\Models\KalenderAkademik;
use App\Models\Kelas;
use App\Models\Notifikasi;
use App\Models\User;
use App\Services\JadwalService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPortalController extends Controller
{
    public function overview(Request $request, JadwalService $jadwalService): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        if ($user->isSiswa()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $kelas = Kelas::where('nama_kelas', 'XI PPLG 4')->first() ?? Kelas::query()->first();
        $isGuru = $user->isGuru();

        $regulerSlots = $isGuru && $kelas
            ? JadwalPelajaran::where('id_kelas', $kelas->id)
                ->orderByRaw("CASE hari WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3 WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 ELSE 6 END")
                ->orderBy('jam_mulai')
                ->get()
            : collect();

        $momentumItems = $isGuru
            ? JadwalMomentum::with('kelas')->orderByDesc('tanggal')->orderBy('jam_mulai')->limit(30)->get()
            : collect();

        $kalenderItems = KalenderAkademik::orderBy('tanggal_mulai')->get();
        $notifItems = $isGuru
            ? Notifikasi::orderByDesc('created_at')->limit(20)->get()
            : collect();

        return response()->json([
            'success' => true,
            'data' => [
                'role' => $user->role?->value ?? (string) $user->role,
                'is_guru' => $isGuru,
                'kelas' => $kelas ? [
                    'id' => $kelas->id,
                    'nama_kelas' => $kelas->nama_kelas,
                    'konsentrasi' => $kelas->konsentrasi,
                    'wali_kelas' => $kelas->wali_kelas,
                    'tahun_ajaran' => $kelas->tahun_ajaran,
                ] : null,
                'stats' => [
                    'siswa_count' => User::where('role', UserRole::Siswa->value)->count(),
                    'jadwal_reguler_count' => $kelas ? JadwalPelajaran::where('id_kelas', $kelas->id)->count() : 0,
                    'momentum_aktif_count' => JadwalMomentum::whereDate('tanggal', '>=', now('Asia/Jakarta')->toDateString())->count(),
                    'kalender_count' => $kalenderItems->count(),
                    'notifikasi_count' => Notifikasi::count(),
                ],
                'live_harian' => ($isGuru && $kelas) ? $jadwalService->getJadwalHarian($kelas->id, Carbon::today('Asia/Jakarta')) : null,
                'jadwal_reguler' => $regulerSlots,
                'jadwal_momentum' => $momentumItems,
                'kalender' => $kalenderItems->map(fn (KalenderAkademik $k): array => [
                    'id' => $k->id,
                    'judul' => $k->judul,
                    'tanggal_mulai' => $k->tanggal_mulai?->format('Y-m-d'),
                    'tanggal_selesai' => $k->tanggal_selesai?->format('Y-m-d'),
                    'kategori' => $k->kategori,
                    'sumber' => $k->sumber,
                    'penyelenggara' => $k->penyelenggara,
                    'target_kelas' => $k->target_kelas,
                    'is_libur' => (bool) $k->is_libur,
                    'deskripsi' => $k->deskripsi,
                ])->values(),
                'notifikasi' => $notifItems,
            ],
        ]);
    }

    public function storeKalender(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        if ($user->cannot('create', KalenderAkademik::class)) {
            return response()->json(['success' => false, 'message' => 'Tidak diizinkan.'], 403);
        }

        $validated = $request->validate([
            'judul' => ['required', 'string', 'max:180'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'kategori' => ['required', 'string', 'max:60'],
            'sumber' => ['nullable', 'in:resmi_sekolah,organisasi'],
            'penyelenggara' => ['nullable', 'string', 'max:100'],
            'target_kelas' => ['nullable', 'string', 'max:100'],
            'is_libur' => ['nullable', 'boolean'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        $sumber = $user->isAdminOrganisasi()
            ? 'organisasi'
            : ($validated['sumber'] ?? 'resmi_sekolah');

        $agenda = KalenderAkademik::create([
            'judul' => $validated['judul'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'] ?? $validated['tanggal_mulai'],
            'kategori' => $user->isAdminOrganisasi() ? 'agenda_organisasi' : $validated['kategori'],
            'sumber' => $sumber,
            'penyelenggara' => ($validated['penyelenggara'] ?? null) ?: ($user->isAdminOrganisasi() ? 'OSIS' : 'SMK Telkom Purwokerto'),
            'target_kelas' => ($validated['target_kelas'] ?? null) ?: 'Semua Kelas',
            'is_libur' => (bool) ($validated['is_libur'] ?? false),
            'deskripsi' => $validated['deskripsi'] ?? null,
            'dibuat_oleh' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agenda kalender berhasil disimpan.',
            'data' => $agenda,
        ], 201);
    }

    public function deleteKalender(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $agenda = KalenderAkademik::findOrFail($id);
        if ($user->cannot('delete', $agenda)) {
            return response()->json(['success' => false, 'message' => 'Tidak diizinkan menghapus agenda ini.'], 403);
        }

        $agenda->delete();

        return response()->json([
            'success' => true,
            'message' => 'Agenda kalender dihapus.',
        ]);
    }

    public function storeMomentum(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        if ($user->cannot('create', JadwalMomentum::class)) {
            return response()->json(['success' => false, 'message' => 'Hanya guru yang dapat mengelola Jadwal Momentum.'], 403);
        }

        $validated = $request->validate([
            'id_kelas' => ['nullable', 'integer', 'exists:kelas,id'],
            'tanggal' => ['required', 'date'],
            'jam_ke' => ['nullable', 'integer', 'min:1', 'max:20'],
            'jam_mulai' => ['required', 'date_format:H:i'],
            'jam_selesai' => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'mata_pelajaran_baru' => ['nullable', 'string', 'max:150'],
            'mata_pelajaran' => ['nullable', 'string', 'max:150'],
            'nama_guru_baru' => ['nullable', 'string', 'max:120'],
            'nama_guru_pengganti' => ['nullable', 'string', 'max:120'],
            'ruangan_baru' => ['required', 'string', 'max:80'],
            'alasan_perubahan' => ['nullable', 'string', 'max:255'],
        ]);

        $mapel = $validated['mata_pelajaran'] ?? $validated['mata_pelajaran_baru'] ?? null;
        $guruPengganti = $validated['nama_guru_pengganti'] ?? $validated['nama_guru_baru'] ?? null;
        if (! $mapel || ! $guruPengganti) {
            return response()->json([
                'success' => false,
                'message' => 'Mata pelajaran dan nama guru wajib diisi.',
            ], 422);
        }

        $kelasId = $validated['id_kelas'] ?? (Kelas::where('nama_kelas', 'XI PPLG 4')->value('id') ?? Kelas::value('id'));

        $momentum = JadwalMomentum::create([
            'id_kelas' => $kelasId,
            'tanggal' => $validated['tanggal'],
            'jam_ke' => $validated['jam_ke'] ?? 1,
            'jam_mulai' => $validated['jam_mulai'] . ':00',
            'jam_selesai' => $validated['jam_selesai'] . ':00',
            'mata_pelajaran' => $mapel,
            'nama_guru_pengganti' => $guruPengganti,
            'ruangan_baru' => $validated['ruangan_baru'],
            'status_perubahan' => 'ganti_mapel',
            'keterangan' => $validated['alasan_perubahan'] ?? 'Pembaruan jadwal oleh guru',
            'dibuat_oleh' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal Momentum berhasil diterbitkan.',
            'data' => $momentum,
        ], 201);
    }

    public function deleteMomentum(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $momentum = JadwalMomentum::findOrFail($id);
        if ($user->cannot('delete', $momentum)) {
            return response()->json(['success' => false, 'message' => 'Tidak diizinkan.'], 403);
        }

        $momentum->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal Momentum dihapus.',
        ]);
    }
}
