<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Login 1x persisten menggunakan NIS atau Username.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => ['nullable', 'string', 'max:100'],
            'nis' => ['nullable', 'string', 'max:30'],
            'username' => ['nullable', 'string', 'max:60'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $identifier = trim((string) (
            $validated['identifier']
            ?? $validated['nis']
            ?? $validated['username']
            ?? ''
        ));

        if ($identifier === '') {
            return response()->json([
                'success' => false,
                'message' => 'Field identifier, nis, atau username wajib diisi.',
            ], 422);
        }

        $user = User::with('kelas')
            ->where('nis', $identifier)
            ->orWhere('username', $identifier)
            ->orWhere('email', $identifier)
            ->first();

        if ($user === null || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'NIS/Username atau password tidak sesuai.',
            ], 401);
        }

        $deviceName = $validated['device_name'] ?? 'ksjp-client';
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $this->formatUser($user),
            ],
        ]);
    }

    /**
     * Pendaftaran akun siswa baru tanpa mengubah data pengguna yang sudah ada.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'min:3', 'max:120'],
            'nis' => ['required', 'string', 'min:4', 'max:30', 'unique:users,nis'],
            'username' => ['nullable', 'string', 'min:3', 'max:60', 'unique:users,username'],
            'jenis_kelamin' => ['nullable', 'in:L,P'],
            'password' => ['required', 'string', 'min:6', 'max:100'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ], [
            'nis.unique' => 'NIS tersebut sudah terdaftar di sistem KSJP.',
            'username.unique' => 'Username tersebut sudah dipakai pengguna lain.',
        ]);

        $nisClean = trim((string) $validated['nis']);
        $baseUsername = filled($validated['username'] ?? null)
            ? Str::slug((string) $validated['username'], '.')
            : Str::slug($nisClean, '.');

        if ($baseUsername === '') {
            $baseUsername = 'siswa.' . Str::random(6);
        }

        $username = $baseUsername;
        $suffix = 1;
        while (User::where('username', $username)->exists()) {
            $username = "{$baseUsername}.{$suffix}";
            $suffix++;
        }

        $kelas = Kelas::where('nama_kelas', 'XI PPLG 4')
            ->where('tahun_ajaran', '2026/2027')
            ->first() ?? Kelas::query()->first();

        $user = User::create([
            'nis' => $nisClean,
            'username' => $username,
            'nama_lengkap' => trim((string) $validated['nama_lengkap']),
            'email' => Str::slug($nisClean, '.') . '@student.smktelkom-pwt.sch.id',
            'role' => UserRole::Siswa,
            'id_kelas' => $kelas?->id,
            'jenis_kelamin' => $validated['jenis_kelamin'] ?? 'L',
            'password' => Hash::make((string) $validated['password']),
        ])->load('kelas');

        $deviceName = $validated['device_name'] ?? 'ksjp-web';
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran akun baru berhasil.',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $this->formatUser($user),
            ],
        ], 201);
    }

    /**
     * Mengambil profil pengguna yang sedang login beserta data kelasnya.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load('kelas');

        return response()->json([
            'success' => true,
            'data' => $this->formatUser($user),
        ]);
    }

    /**
     * Menghapus token Sanctum aktif (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil. Token telah dicabut.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'nis' => $user->nis,
            'username' => $user->username,
            'nama_lengkap' => $user->nama_lengkap,
            'email' => $user->email,
            'role' => $user->role?->value ?? (string) $user->role,
            'jenis_kelamin' => $user->jenis_kelamin,
            'jabatan_organisasi' => $user->jabatan_organisasi,
            'id_kelas' => $user->id_kelas,
            'kelas' => $user->kelas ? [
                'id' => $user->kelas->id,
                'nama_kelas' => $user->kelas->nama_kelas,
                'tingkat' => $user->kelas->tingkat,
                'konsentrasi' => $user->kelas->konsentrasi,
                'wali_kelas' => $user->kelas->wali_kelas,
                'tahun_ajaran' => $user->kelas->tahun_ajaran,
            ] : null,
        ];
    }
}
