<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\JadwalMomentum;
use App\Models\JadwalPelajaran;
use App\Models\KalenderAkademik;
use App\Models\Kelas;
use App\Models\Notifikasi;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KsjpApiAndRbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_seeded_xi_pplg_4_data_matches_official_roster_and_calendar(): void
    {
        $kelas = Kelas::where('nama_kelas', 'XI PPLG 4')->first();

        $this->assertNotNull($kelas);
        $this->assertSame('Firda Ayu Nirmala, S.Kom', $kelas->wali_kelas);
        $this->assertSame('Rekayasa Perangkat Lunak', $kelas->konsentrasi);
        $this->assertSame('2026/2027', $kelas->tahun_ajaran);

        $siswaCount = User::where('role', UserRole::Siswa->value)
            ->where('id_kelas', $kelas->id)
            ->count();
        $this->assertSame(29, $siswaCount);

        $this->assertDatabaseHas('users', [
            'nis' => '541251004',
            'nama_lengkap' => 'ACHMAD FANANI',
            'jenis_kelamin' => 'L',
        ]);
        $this->assertDatabaseHas('users', [
            'nis' => '541251302',
            'nama_lengkap' => 'WISHAGF GHAIZKA LILIANT',
            'jenis_kelamin' => 'L',
        ]);

        // Cek agenda Kalender Pendidikan 2026/2027
        $this->assertTrue(
            KalenderAkademik::where('judul', 'Hari Pertama Masuk Sekolah TP 2026/2027')
                ->whereDate('tanggal_mulai', '2026-07-13')
                ->exists()
        );
        $this->assertTrue(
            KalenderAkademik::where('judul', 'HUT SMK Telkom Purwokerto')
                ->whereDate('tanggal_mulai', '2027-01-31')
                ->exists()
        );
        $this->assertGreaterThanOrEqual(45, KalenderAkademik::count());
    }

    public function test_siswa_can_login_persistently_using_nis_and_access_me_and_logout(): void
    {
        $response = $this->postJson('/api/login', [
            'identifier' => '541251004',
            'password' => 'stematel2026',
            'device_name' => 'android-test',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonPath('data.user.nis', '541251004')
            ->assertJsonPath('data.user.role', 'siswa')
            ->assertJsonPath('data.user.kelas.nama_kelas', 'XI PPLG 4');

        $token = $response->json('data.token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.nama_lengkap', 'ACHMAD FANANI');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_jadwal_endpoint_automatically_overrides_regular_schedule_with_momentum_flag(): void
    {
        $siswa = User::where('nis', '541251004')->firstOrFail();
        $guru = User::where('username', 'firda.ayu')->firstOrFail();
        $token = $siswa->createToken('test-device')->plainTextToken;

        $tanggalRabu = Carbon::parse('2026-12-02'); // Rabu
        $slotPertamaRabu = JadwalPelajaran::where('id_kelas', $siswa->id_kelas)
            ->where('hari', 'Rabu')
            ->orderBy('jam_ke')
            ->firstOrFail();

        JadwalMomentum::create([
            'id_kelas' => $siswa->id_kelas,
            'id_jadwal_reguler' => $slotPertamaRabu->id,
            'tanggal' => $tanggalRabu->toDateString(),
            'jam_ke' => $slotPertamaRabu->jam_ke,
            'mata_pelajaran' => 'Workshop React & API KSJP',
            'nama_guru_pengganti' => 'Firda Ayu Nirmala, S.Kom',
            'ruangan_baru' => 'Lab Software Engineering 3',
            'status_perubahan' => 'ganti_mapel',
            'keterangan' => 'Diganti sesi praktik integrasi API.',
            'dibuat_oleh' => $guru->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/jadwal?tanggal=' . $tanggalRabu->toDateString());

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('kelas.nama_kelas', 'XI PPLG 4')
            ->assertJsonPath('data.hari', 'Rabu');

        $slots = collect($response->json('data.jadwal'));
        $overridden = $slots->firstWhere('jam_ke', $slotPertamaRabu->jam_ke);
        $regular = $slots->firstWhere('jam_ke', '!=', $slotPertamaRabu->jam_ke);

        $this->assertNotNull($overridden);
        $this->assertTrue($overridden['is_momentum']);
        $this->assertSame('Workshop React & API KSJP', $overridden['mata_pelajaran']);
        $this->assertSame('Lab Software Engineering 3', $overridden['ruangan']);

        $this->assertNotNull($regular);
        $this->assertFalse($regular['is_momentum']);

        // Pastikan observer juga mengirim notifikasi momentum ke kelas XI PPLG 4
        $this->assertDatabaseHas('notifikasi', [
            'id_kelas' => $siswa->id_kelas,
            'tipe' => 'momentum',
            'judul' => 'Jadwal Momentum Baru: Workshop React & API KSJP',
        ]);
    }

    public function test_kalender_and_notifikasi_endpoints_work_with_per_user_read_state(): void
    {
        $siswaA = User::where('nis', '541251004')->firstOrFail();
        $siswaB = User::where('nis', '541251013')->firstOrFail();

        $tokenA = $siswaA->createToken('a')->plainTextToken;
        $tokenB = $siswaB->createToken('b')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson('/api/kalender?bulan=7&tahun=2026')
            ->assertOk()
            ->assertJsonPath('tahun_pelajaran', '2026/2027')
            ->assertJsonFragment(['judul' => 'Hari Pertama Masuk Sekolah TP 2026/2027']);

        $notifRes = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson('/api/notifikasi')
            ->assertOk();

        $firstId = $notifRes->json('data.0.id');
        $this->assertNotNull($firstId);

        // Siswa A menandai sudah dibaca, Siswa B harus tetap melihat notifikasi belum dibaca
        $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson("/api/notifikasi/{$firstId}/read")
            ->assertOk();

        $notifForA = collect(
            $this->withHeader('Authorization', "Bearer {$tokenA}")
                ->getJson('/api/notifikasi')
                ->json('data')
        )->firstWhere('id', $firstId);

        app('auth')->forgetGuards();

        $notifForB = collect(
            $this->withHeader('Authorization', "Bearer {$tokenB}")
                ->getJson('/api/notifikasi')
                ->json('data')
        )->firstWhere('id', $firstId);

        $this->assertTrue($notifForA['is_read']);
        $this->assertFalse($notifForB['is_read']);
    }

    public function test_strict_three_role_rbac_policies_and_filament_panel_access(): void
    {
        $panel = Filament::getPanel('admin');

        $siswa = User::where('nis', '541251004')->firstOrFail();
        $guru = User::where('username', 'firda.ayu')->firstOrFail();
        $adminOrg = User::where('username', 'osis.stematel')->firstOrFail();

        // Hanya guru & admin_organisasi yang boleh akses panel /admin
        $this->assertFalse($siswa->canAccessPanel($panel));
        $this->assertTrue($guru->canAccessPanel($panel));
        $this->assertTrue($adminOrg->canAccessPanel($panel));

        // Guru mengelola jadwal reguler & momentum; admin_organisasi TIDAK boleh
        $this->assertTrue($guru->can('viewAny', JadwalPelajaran::class));
        $this->assertTrue($guru->can('create', JadwalMomentum::class));
        $this->assertFalse($adminOrg->can('viewAny', JadwalPelajaran::class));
        $this->assertFalse($adminOrg->can('create', JadwalMomentum::class));

        // Admin organisasi mengelola agenda organisasi di kalender, tapi tidak bisa ubah agenda resmi sekolah
        $agendaResmi = KalenderAkademik::where('sumber', 'resmi_sekolah')->firstOrFail();
        $agendaOrg = KalenderAkademik::where('sumber', 'organisasi')->firstOrFail();

        $this->assertTrue($adminOrg->can('create', KalenderAkademik::class));
        $this->assertTrue($adminOrg->can('update', $agendaOrg));
        $this->assertFalse($adminOrg->can('update', $agendaResmi));
        $this->assertTrue($guru->can('update', $agendaResmi));
    }

    public function test_filament_admin_pages_render_and_enforce_role_access_for_siswa_and_guru(): void
    {
        $siswa = User::where('nis', '541251004')->firstOrFail();
        $guru = User::where('username', 'firda.ayu')->firstOrFail();

        // Siswa dilarang masuk panel /admin
        $this->actingAs($siswa)->get('/admin')->assertForbidden();
        $this->flushSession();

        // Guru bisa membuka dashboard, data kelas, siswa, jadwal reguler, jadwal momentum, kalender, dan notifikasi
        $this->actingAs($guru)->get('/admin')->assertOk();
        $this->actingAs($guru)->get('/admin/kelas')->assertOk();
        $this->actingAs($guru)->get('/admin/users')->assertOk();
        $this->actingAs($guru)->get('/admin/jadwal-pelajarans')->assertOk();
        $this->actingAs($guru)->get('/admin/jadwal-momenta')->assertOk();
        $this->actingAs($guru)->get('/admin/kalender-akademiks')->assertOk();
        $this->actingAs($guru)->get('/admin/notifikasis')->assertOk();
    }

    public function test_filament_admin_pages_enforce_role_access_for_admin_organisasi(): void
    {
        $adminOrg = User::where('username', 'osis.stematel')->firstOrFail();

        // Admin organisasi bisa membuka dashboard & kalender, tapi ditolak di jadwal reguler/momentum & users
        $this->actingAs($adminOrg)->get('/admin')->assertOk();
        $this->actingAs($adminOrg)->get('/admin/kalender-akademiks')->assertOk();
        $this->actingAs($adminOrg)->get('/admin/notifikasis')->assertOk();
        $this->actingAs($adminOrg)->get('/admin/jadwal-pelajarans')->assertForbidden();
        $this->actingAs($adminOrg)->get('/admin/jadwal-momenta')->assertForbidden();
        $this->actingAs($adminOrg)->get('/admin/users')->assertForbidden();
        $this->actingAs($adminOrg)->get('/admin/kelas')->assertForbidden();
    }

    public function test_admin_organisasi_creating_kalender_agenda_triggers_realtime_notification(): void
    {
        $osis = User::where('username', 'osis.stematel')->firstOrFail();

        KalenderAkademik::create([
            'judul' => 'Stematel Tech Expo 2027',
            'tanggal_mulai' => '2027-02-18',
            'tanggal_selesai' => '2027-02-19',
            'kategori' => 'agenda_organisasi',
            'sumber' => 'organisasi',
            'penyelenggara' => 'OSIS',
            'target_kelas' => 'Semua Kelas',
            'is_libur' => false,
            'deskripsi' => 'Pameran karya siswa RPL dan TJKT.',
            'dibuat_oleh' => $osis->id,
        ]);

        $this->assertDatabaseHas('notifikasi', [
            'tipe' => 'kalender',
            'judul' => 'Agenda Baru (OSIS): Stematel Tech Expo 2027',
        ]);
    }

    public function test_official_xi_pplg_4_schedule_and_live_sedang_berlangsung_status(): void
    {
        $siswa = User::where('nis', '541251004')->firstOrFail();
        $token = $siswa->createToken('live-test')->plainTextToken;

        // Pastikan jadwal resmi XI PPLG 4 lengkap dengan ruangan dari PDF
        $this->assertDatabaseHas('jadwal_pelajaran', [
            'hari' => 'Senin',
            'mata_pelajaran' => 'Basis Data',
            'nama_guru' => 'Fendi Riawan',
            'ruangan' => 'A.2.6',
        ]);
        $this->assertDatabaseHas('jadwal_pelajaran', [
            'hari' => 'Selasa',
            'mata_pelajaran' => 'Pemrograman Berbasis Teks',
            'nama_guru' => 'Firda Ayu Nirmala',
            'ruangan' => 'RPS SEL',
        ]);
        $this->assertDatabaseHas('jadwal_pelajaran', [
            'hari' => 'Kamis',
            'mata_pelajaran' => 'Pemrograman Berbasis Mobile',
            'nama_guru' => 'Imelda Alfiana Palupi Dewi',
            'ruangan' => 'D.2.1',
        ]);

        // Simulasikan waktu nyata Kamis, 26 Nov 2026 pukul 09:15:00 WIB (saat pelajaran Sejarah 09:00-09:40)
        Carbon::setTestNow(Carbon::parse('2026-11-26 09:15:00', 'Asia/Jakarta'));
        try {
            $response = $this->withHeader('Authorization', "Bearer {$token}")
                ->getJson('/api/jadwal?tanggal=2026-11-26');

            $response->assertOk()
                ->assertJsonPath('data.hari', 'Kamis')
                ->assertJsonPath('data.pergantian_jam.slot_aktif.mata_pelajaran', 'Sejarah');

            $slots = collect($response->json('data.jadwal'));
            $sejarah = $slots->firstWhere('jam_ke', 5);
            $tadarus = $slots->firstWhere('jam_ke', 1);
            $mobile = $slots->firstWhere('jam_ke', 11);

            $this->assertTrue($sejarah['sedang_berlangsung']);
            $this->assertSame('sedang_berlangsung', $sejarah['status_waktu']);
            $this->assertSame('Sedang Berlangsung', $sejarah['status_waktu_label']);

            $this->assertFalse($tadarus['sedang_berlangsung']);
            $this->assertSame('selesai', $tadarus['status_waktu']);

            $this->assertFalse($mobile['sedang_berlangsung']);
            $this->assertSame('akan_datang', $mobile['status_waktu']);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_filament_customized_sidebar_logo_and_student_mirrored_views_for_guru(): void
    {
        $guru = User::where('email', 'firda@smktelkom-pwt.sch.id')->firstOrFail();

        // Guru: logo SMK Telkom Purwokerto tampil, Data Akademik (Guru) dihapus dari sidebar,
        // Jadwal Reguler menampilkan data XI PPLG 4 & status live, Kalender Pendidikan menampilkan matriks 12 bulan.
        $this->actingAs($guru)
            ->get('/admin')
            ->assertOk()
            ->assertSee('SMK Telkom Purwokerto')
            ->assertDontSee('Data Akademik (Guru)');

        $this->actingAs($guru)
            ->get('/admin/jadwal-pelajarans')
            ->assertOk()
            ->assertSee('XI PPLG 4')
            ->assertSee('Firda Ayu Nirmala, S.Kom');

        $this->actingAs($guru)
            ->get('/admin/kalender-akademiks')
            ->assertOk()
            ->assertSee('JULI 2026')
            ->assertSee('JUNI 2027');
    }

    public function test_filament_admin_organisasi_dashboard_snippet_and_calendar_only_sidebar(): void
    {
        $osis = User::where('email', 'osis@smktelkom-pwt.sch.id')->firstOrFail();

        // Admin Organisasi (OSIS): sidebar kiri hanya menampilkan Dashboard + Kalender Pendidikan (tanpa Log Notifikasi),
        // dan Dashboard menampilkan cuplikan halaman Kalender Pendidikan.
        $this->actingAs($osis)
            ->get('/admin')
            ->assertOk()
            ->assertSee('SMK Telkom Purwokerto')
            ->assertSee('Cuplikan Kalender Pendidikan')
            ->assertSee('Kalender Pendidikan')
            ->assertDontSee('Log Notifikasi')
            ->assertDontSee('Data Akademik (Guru)')
            ->assertDontSee('Manajemen Jadwal (Guru)');
    }
}
