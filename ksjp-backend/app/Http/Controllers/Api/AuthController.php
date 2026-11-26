<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
