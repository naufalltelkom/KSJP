<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/admin-sso', function (Request $request) {
    $uid = (int) $request->query('uid');
    $user = User::findOrFail($uid);
    abort_if($user->isSiswa(), 403, 'Akses khusus Pengelola.');

    Auth::guard('web')->login($user, true);
    $request->session()->regenerate();
    $request->session()->put('ksjp_embed', $request->boolean('embed'));

    return redirect('/admin');
})->name('filament.sso')->middleware('signed');

Route::get('/', function () {
    return response()->json([
        'app' => 'KSJP — Kalender Siswa & Jadwal Pelajaran',
        'sekolah' => 'SMK Telkom Purwokerto',
        'tahun_pelajaran' => '2026/2027',
        'admin_panel' => url('/admin'),
        'android_apk' => url('/download/android'),
        'api_endpoints' => [
            'login' => url('/api/login'),
            'me' => url('/api/me'),
            'logout' => url('/api/logout'),
            'jadwal' => url('/api/jadwal'),
            'kalender' => url('/api/kalender'),
            'notifikasi' => url('/api/notifikasi'),
        ],
    ]);
});

Route::get('/download/android', function () {
    $apkPath = public_path('downloads/ksjp-stematel.apk');
    abort_unless(file_exists($apkPath), 404, 'File APK belum tersedia.');

    return response()->download(
        $apkPath,
        'KSJP-SMK-Telkom-Purwokerto.apk',
        ['Content-Type' => 'application/vnd.android.package-archive'],
    );
});
