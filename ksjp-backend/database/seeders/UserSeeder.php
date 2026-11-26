<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Kelas;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $xiPplg4 = Kelas::where('nama_kelas', 'XI PPLG 4')
            ->where('tahun_ajaran', '2026/2027')
            ->firstOrFail();

        $staffUsers = [
            // Akun Guru (Wali Kelas & Pengelola Jadwal)
            [
                'nis' => 'GURU001',
                'username' => 'firda.ayu',
                'nama_lengkap' => 'Firda Ayu Nirmala, S.Kom',
                'email' => 'firda@smktelkom-pwt.sch.id',
                'role' => UserRole::Guru,
                'id_kelas' => $xiPplg4->id,
                'jenis_kelamin' => 'P',
                'jabatan_organisasi' => 'Wali Kelas XI PPLG 4 / Guru Konsentrasi RPL',
                'password' => Hash::make('guru123'),
            ],
            [
                'nis' => 'GURU002',
                'username' => 'budi.santoso',
                'nama_lengkap' => 'Budi Santoso, S.Kom',
                'email' => 'budi.santoso@smktelkom-pwt.sch.id',
                'role' => UserRole::Guru,
                'id_kelas' => null,
                'jenis_kelamin' => 'L',
                'jabatan_organisasi' => 'Guru Pemrograman Web & Mobile',
                'password' => Hash::make('guru123'),
            ],
            [
                'nis' => 'GURU003',
                'username' => 'siti.rahma',
                'nama_lengkap' => 'Siti Rahmawati, S.Pd',
                'email' => 'siti.rahma@smktelkom-pwt.sch.id',
                'role' => UserRole::Guru,
                'id_kelas' => null,
                'jenis_kelamin' => 'P',
                'jabatan_organisasi' => 'Guru Bahasa Inggris',
                'password' => Hash::make('guru123'),
            ],
            // Akun Admin Organisasi (OSIS / MPK / PMR / Pramuka)
            [
                'nis' => 'ORG001',
                'username' => 'osis.stematel',
                'nama_lengkap' => 'Pengurus OSIS SMK Telkom Purwokerto',
                'email' => 'osis@smktelkom-pwt.sch.id',
                'role' => UserRole::AdminOrganisasi,
                'id_kelas' => null,
                'jenis_kelamin' => null,
                'jabatan_organisasi' => 'OSIS',
                'password' => Hash::make('org123'),
            ],
            [
                'nis' => 'ORG002',
                'username' => 'mpk.stematel',
                'nama_lengkap' => 'Pengurus MPK SMK Telkom Purwokerto',
                'email' => 'mpk@smktelkom-pwt.sch.id',
                'role' => UserRole::AdminOrganisasi,
                'id_kelas' => null,
                'jenis_kelamin' => null,
                'jabatan_organisasi' => 'MPK',
                'password' => Hash::make('org123'),
            ],
            [
                'nis' => 'ORG003',
                'username' => 'pramuka.stematel',
                'nama_lengkap' => 'Dewan Ambalan Pramuka Stematel',
                'email' => 'pramuka@smktelkom-pwt.sch.id',
                'role' => UserRole::AdminOrganisasi,
                'id_kelas' => null,
                'jenis_kelamin' => null,
                'jabatan_organisasi' => 'Pramuka',
                'password' => Hash::make('org123'),
            ],
        ];

        foreach ($staffUsers as $staff) {
            User::updateOrCreate(
                ['username' => $staff['username']],
                $staff,
            );
        }

        // Data asli 29 siswa Kelas XI PPLG 4 TP 2026/2027 (L: 20, P: 9)
        $siswaXiPplg4 = [
            ['nis' => '541251004', 'nama_lengkap' => 'ACHMAD FANANI', 'jenis_kelamin' => 'L'],
            ['nis' => '541251013', 'nama_lengkap' => 'AFRIN SHABRIA ESHAL', 'jenis_kelamin' => 'P'],
            ['nis' => '541251040', 'nama_lengkap' => 'ANABELLA EARLINE ANDIWA', 'jenis_kelamin' => 'P'],
            ['nis' => '541251041', 'nama_lengkap' => 'ANANDA YOSI MARSANIA', 'jenis_kelamin' => 'P'],
            ['nis' => '541251047', 'nama_lengkap' => 'ANNISA AZALIA ZAIN', 'jenis_kelamin' => 'P'],
            ['nis' => '541251058', 'nama_lengkap' => 'AUFA ABDURRAHMAN', 'jenis_kelamin' => 'L'],
            ['nis' => '541251062', 'nama_lengkap' => 'AVILA SAVERO IMAN', 'jenis_kelamin' => 'L'],
            ['nis' => '541251077', 'nama_lengkap' => 'CRESENDO ASSYABANI DARMAWAN', 'jenis_kelamin' => 'L'],
            ['nis' => '541251097', 'nama_lengkap' => 'EZAR NIRBANA', 'jenis_kelamin' => 'L'],
            ['nis' => '541251106', 'nama_lengkap' => 'FALAH RAUF ALVARO WARADANA', 'jenis_kelamin' => 'L'],
            ['nis' => '541251107', 'nama_lengkap' => 'FARIS KAELAN AKBAR NUGROHO', 'jenis_kelamin' => 'L'],
            ['nis' => '541251108', 'nama_lengkap' => 'FATHAN ATHAYA DIMYATI', 'jenis_kelamin' => 'L'],
            ['nis' => '541251126', 'nama_lengkap' => 'GRISELDA FELIXIA SANTOSO', 'jenis_kelamin' => 'P'],
            ['nis' => '541251127', 'nama_lengkap' => 'HAFIZH ADITYA', 'jenis_kelamin' => 'L'],
            ['nis' => '541251141', 'nama_lengkap' => "HUGA FAYYADH ARFA'", 'jenis_kelamin' => 'L'],
            ['nis' => '541251185', 'nama_lengkap' => 'MOHAMAD IRGI', 'jenis_kelamin' => 'L'],
            ['nis' => '541251196', 'nama_lengkap' => 'MUHAMMAD GHAZY PUTRA FETRIAN', 'jenis_kelamin' => 'L'],
            ['nis' => '541251197', 'nama_lengkap' => 'MUHAMMAD HANIF RENDRAKA UTOMO', 'jenis_kelamin' => 'L'],
            ['nis' => '541251216', 'nama_lengkap' => 'NAUFAL AZKA ILHAMI', 'jenis_kelamin' => 'L'],
            ['nis' => '541251217', 'nama_lengkap' => 'NAUFAL MIRZA NUGRAHA', 'jenis_kelamin' => 'L'],
            ['nis' => '541251240', 'nama_lengkap' => 'RADITHYA AGUN PRATAMA', 'jenis_kelamin' => 'L'],
            ['nis' => '541251248', 'nama_lengkap' => 'RAFASYAH JAVAS NARARYA', 'jenis_kelamin' => 'L'],
            ['nis' => '541251250', 'nama_lengkap' => 'RAFFAEL REYNDRA SETIAWAN', 'jenis_kelamin' => 'L'],
            ['nis' => '541251254', 'nama_lengkap' => 'RAFIKA KHOERUNNISA', 'jenis_kelamin' => 'P'],
            ['nis' => '541251276', 'nama_lengkap' => 'SEKAR AYU WIJAYA KUSUMA WARDANI', 'jenis_kelamin' => 'P'],
            ['nis' => '541251277', 'nama_lengkap' => 'SHASKIA AYU AURELLIA', 'jenis_kelamin' => 'P'],
            ['nis' => '541251286', 'nama_lengkap' => 'TANIA NURILIA ADINDA', 'jenis_kelamin' => 'P'],
            ['nis' => '541251292', 'nama_lengkap' => 'VADEL RASENDRIYA SYAKIEB', 'jenis_kelamin' => 'L'],
            ['nis' => '541251302', 'nama_lengkap' => 'WISHAGF GHAIZKA LILIANT', 'jenis_kelamin' => 'L'],
        ];

        $sharedPasswordHash = Hash::make('stematel2026');

        foreach ($siswaXiPplg4 as $siswa) {
            User::updateOrCreate(
                ['nis' => $siswa['nis']],
                [
                    'username' => $siswa['nis'],
                    'nama_lengkap' => $siswa['nama_lengkap'],
                    'email' => $siswa['nis'] . '@student.smktelkom-pwt.sch.id',
                    'role' => UserRole::Siswa,
                    'id_kelas' => $xiPplg4->id,
                    'jenis_kelamin' => $siswa['jenis_kelamin'],
                    'jabatan_organisasi' => null,
                    'password' => $sharedPasswordHash,
                ],
            );
        }
    }
}
