<?php

namespace Database\Seeders;

use App\Models\JadwalPelajaran;
use App\Models\Kelas;
use App\Models\User;
use Illuminate\Database\Seeder;

class JadwalPelajaranSeeder extends Seeder
{
    public function run(): void
    {
        $xiPplg4 = Kelas::where('nama_kelas', 'XI PPLG 4')->firstOrFail();
        $firda = User::where('username', 'firda.ayu')->first();

        // Jadwal resmi Semester Ganjil TP 2026/2027 Kelas XI PPLG 4 + kode ruangan dari PDF jadwal Kelas XI
        $jadwal = [
            // ======================== 1. SENIN ========================
            [
                'hari' => 'Senin', 'jam_ke' => 1, 'jam_mulai' => '06:30:00', 'jam_selesai' => '07:45:00',
                'mata_pelajaran' => 'Apel / Upacara', 'nama_guru' => 'Tim Ketertiban / Pembina Upacara', 'id_guru' => null, 'ruangan' => 'Lapangan Upacara',
            ],
            [
                'hari' => 'Senin', 'jam_ke' => 2, 'jam_mulai' => '07:45:00', 'jam_selesai' => '08:00:00',
                'mata_pelajaran' => 'Istirahat', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Area Sekolah',
            ],
            [
                'hari' => 'Senin', 'jam_ke' => 3, 'jam_mulai' => '08:00:00', 'jam_selesai' => '11:40:00',
                'mata_pelajaran' => 'Mapel Pilihan (MP1/MP2/MP3 PPLG)', 'nama_guru' => 'Tim Guru Mapel Pilihan PPLG', 'id_guru' => null, 'ruangan' => 'A.2.4 / A.2.5 / A.2.6 / D.1.2 / D.2.1 / D.3.1',
            ],
            [
                'hari' => 'Senin', 'jam_ke' => 4, 'jam_mulai' => '11:40:00', 'jam_selesai' => '12:20:00',
                'mata_pelajaran' => 'Basis Data', 'nama_guru' => 'Fendi Riawan', 'id_guru' => null, 'ruangan' => 'A.2.6',
            ],
            [
                'hari' => 'Senin', 'jam_ke' => 5, 'jam_mulai' => '12:20:00', 'jam_selesai' => '13:20:00',
                'mata_pelajaran' => 'Istirahat', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Area Sekolah / Masjid',
            ],
            [
                'hari' => 'Senin', 'jam_ke' => 6, 'jam_mulai' => '13:20:00', 'jam_selesai' => '14:00:00',
                'mata_pelajaran' => 'Basis Data', 'nama_guru' => 'Fendi Riawan', 'id_guru' => null, 'ruangan' => 'A.2.6',
            ],
            [
                'hari' => 'Senin', 'jam_ke' => 7, 'jam_mulai' => '14:00:00', 'jam_selesai' => '14:40:00',
                'mata_pelajaran' => 'Basis Data', 'nama_guru' => 'Fendi Riawan', 'id_guru' => null, 'ruangan' => 'A.2.6',
            ],
            [
                'hari' => 'Senin', 'jam_ke' => 8, 'jam_mulai' => '14:40:00', 'jam_selesai' => '15:20:00',
                'mata_pelajaran' => 'Basis Data', 'nama_guru' => 'Fendi Riawan', 'id_guru' => null, 'ruangan' => 'A.2.6',
            ],
            [
                'hari' => 'Senin', 'jam_ke' => 9, 'jam_mulai' => '15:20:00', 'jam_selesai' => '16:00:00',
                'mata_pelajaran' => '5R (Kegiatan 5R)', 'nama_guru' => 'Wali Kelas / Tim 5R', 'id_guru' => $firda?->id, 'ruangan' => 'A.2.6 / Lingkungan Kelas',
            ],

            // ======================== 2. SELASA ========================
            [
                'hari' => 'Selasa', 'jam_ke' => 1, 'jam_mulai' => '07:00:00', 'jam_selesai' => '07:10:00',
                'mata_pelajaran' => 'Tadarus', 'nama_guru' => 'Pendamping Tadarus Pagi', 'id_guru' => null, 'ruangan' => 'C.3.1',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 2, 'jam_mulai' => '07:10:00', 'jam_selesai' => '07:50:00',
                'mata_pelajaran' => 'Pendidikan Agama Islam', 'nama_guru' => 'Hj. Siti Mufsohah Muhimmati', 'id_guru' => null, 'ruangan' => 'C.3.1',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 3, 'jam_mulai' => '07:50:00', 'jam_selesai' => '08:30:00',
                'mata_pelajaran' => 'Pendidikan Agama Islam', 'nama_guru' => 'Hj. Siti Mufsohah Muhimmati', 'id_guru' => null, 'ruangan' => 'C.3.1',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 4, 'jam_mulai' => '08:30:00', 'jam_selesai' => '09:00:00',
                'mata_pelajaran' => 'Istirahat', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Area Sekolah',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 5, 'jam_mulai' => '09:00:00', 'jam_selesai' => '09:40:00',
                'mata_pelajaran' => 'Pendidikan Agama Islam', 'nama_guru' => 'Hj. Siti Mufsohah Muhimmati', 'id_guru' => null, 'ruangan' => 'C.3.1',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 6, 'jam_mulai' => '09:40:00', 'jam_selesai' => '10:20:00',
                'mata_pelajaran' => 'Pemrograman Berbasis Teks', 'nama_guru' => 'Firda Ayu Nirmala', 'id_guru' => $firda?->id, 'ruangan' => 'RPS SEL',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 7, 'jam_mulai' => '10:20:00', 'jam_selesai' => '11:00:00',
                'mata_pelajaran' => 'Pemrograman Berbasis Teks', 'nama_guru' => 'Firda Ayu Nirmala', 'id_guru' => $firda?->id, 'ruangan' => 'RPS SEL',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 8, 'jam_mulai' => '11:00:00', 'jam_selesai' => '11:40:00',
                'mata_pelajaran' => 'Pemrograman Berbasis Teks', 'nama_guru' => 'Firda Ayu Nirmala', 'id_guru' => $firda?->id, 'ruangan' => 'RPS SEL',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 9, 'jam_mulai' => '11:40:00', 'jam_selesai' => '12:20:00',
                'mata_pelajaran' => 'Pemrograman Berbasis Teks', 'nama_guru' => 'Firda Ayu Nirmala', 'id_guru' => $firda?->id, 'ruangan' => 'RPS SEL',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 10, 'jam_mulai' => '12:20:00', 'jam_selesai' => '13:20:00',
                'mata_pelajaran' => 'Istirahat', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Area Sekolah / Masjid',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 11, 'jam_mulai' => '13:20:00', 'jam_selesai' => '14:00:00',
                'mata_pelajaran' => 'Dasar Dasar PPLG', 'nama_guru' => 'Novi Lailatul Faizah', 'id_guru' => null, 'ruangan' => 'RPS SEL',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 12, 'jam_mulai' => '14:00:00', 'jam_selesai' => '14:40:00',
                'mata_pelajaran' => 'Dasar Dasar PPLG', 'nama_guru' => 'Novi Lailatul Faizah', 'id_guru' => null, 'ruangan' => 'RPS SEL',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 13, 'jam_mulai' => '14:40:00', 'jam_selesai' => '15:20:00',
                'mata_pelajaran' => 'Dasar Dasar PPLG', 'nama_guru' => 'Novi Lailatul Faizah', 'id_guru' => null, 'ruangan' => 'RPS SEL',
            ],
            [
                'hari' => 'Selasa', 'jam_ke' => 14, 'jam_mulai' => '15:20:00', 'jam_selesai' => '16:00:00',
                'mata_pelajaran' => 'Dasar Dasar PPLG', 'nama_guru' => 'Novi Lailatul Faizah', 'id_guru' => null, 'ruangan' => 'RPS SEL',
            ],

            // ======================== 3. RABU ========================
            [
                'hari' => 'Rabu', 'jam_ke' => 1, 'jam_mulai' => '07:00:00', 'jam_selesai' => '07:10:00',
                'mata_pelajaran' => 'Tadarus', 'nama_guru' => 'Pendamping Tadarus Pagi', 'id_guru' => null, 'ruangan' => 'A.3.6',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 2, 'jam_mulai' => '07:10:00', 'jam_selesai' => '07:50:00',
                'mata_pelajaran' => 'Kokurikuler', 'nama_guru' => 'Tim Kokurikuler', 'id_guru' => null, 'ruangan' => 'Lingkungan Sekolah',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 3, 'jam_mulai' => '07:50:00', 'jam_selesai' => '08:20:00',
                'mata_pelajaran' => 'Istirahat', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Area Sekolah',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 4, 'jam_mulai' => '08:20:00', 'jam_selesai' => '09:00:00',
                'mata_pelajaran' => 'Bahasa Jawa', 'nama_guru' => 'Andhang Jaka', 'id_guru' => null, 'ruangan' => 'A.3.6',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 5, 'jam_mulai' => '09:00:00', 'jam_selesai' => '09:40:00',
                'mata_pelajaran' => 'Bahasa Jawa', 'nama_guru' => 'Andhang Jaka', 'id_guru' => null, 'ruangan' => 'A.3.6',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 6, 'jam_mulai' => '09:40:00', 'jam_selesai' => '10:20:00',
                'mata_pelajaran' => 'Pendidikan Jasmani', 'nama_guru' => 'Faizal Anggriawan', 'id_guru' => null, 'ruangan' => 'B.2.4 / Lapangan',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 7, 'jam_mulai' => '10:20:00', 'jam_selesai' => '11:00:00',
                'mata_pelajaran' => 'Pendidikan Jasmani', 'nama_guru' => 'Faizal Anggriawan', 'id_guru' => null, 'ruangan' => 'B.2.4 / Lapangan',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 8, 'jam_mulai' => '11:00:00', 'jam_selesai' => '11:40:00',
                'mata_pelajaran' => 'Bahasa Indonesia', 'nama_guru' => 'Prasetyo Adi Wibowo', 'id_guru' => null, 'ruangan' => 'C.2.2',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 9, 'jam_mulai' => '11:40:00', 'jam_selesai' => '12:20:00',
                'mata_pelajaran' => 'Bahasa Indonesia', 'nama_guru' => 'Prasetyo Adi Wibowo', 'id_guru' => null, 'ruangan' => 'C.2.2',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 10, 'jam_mulai' => '12:20:00', 'jam_selesai' => '13:20:00',
                'mata_pelajaran' => 'Istirahat', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Area Sekolah / Masjid',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 11, 'jam_mulai' => '13:20:00', 'jam_selesai' => '14:00:00',
                'mata_pelajaran' => 'Bahasa Indonesia', 'nama_guru' => 'Prasetyo Adi Wibowo', 'id_guru' => null, 'ruangan' => 'C.2.2',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 12, 'jam_mulai' => '14:00:00', 'jam_selesai' => '14:40:00',
                'mata_pelajaran' => 'Kreativitas, Inovasi, dan Kewirausahaan', 'nama_guru' => 'Tutut Destria Eliana', 'id_guru' => null, 'ruangan' => 'RPS SEL',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 13, 'jam_mulai' => '14:40:00', 'jam_selesai' => '15:20:00',
                'mata_pelajaran' => 'Kreativitas, Inovasi, dan Kewirausahaan', 'nama_guru' => 'Tutut Destria Eliana', 'id_guru' => null, 'ruangan' => 'RPS SEL',
            ],
            [
                'hari' => 'Rabu', 'jam_ke' => 14, 'jam_mulai' => '15:20:00', 'jam_selesai' => '16:00:00',
                'mata_pelajaran' => 'Kreativitas, Inovasi, dan Kewirausahaan', 'nama_guru' => 'Tutut Destria Eliana', 'id_guru' => null, 'ruangan' => 'RPS SEL',
            ],

            // ======================== 4. KAMIS ========================
            [
                'hari' => 'Kamis', 'jam_ke' => 1, 'jam_mulai' => '07:00:00', 'jam_selesai' => '07:10:00',
                'mata_pelajaran' => 'Tadarus', 'nama_guru' => 'Pendamping Tadarus Pagi', 'id_guru' => null, 'ruangan' => 'B.1.2',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 2, 'jam_mulai' => '07:10:00', 'jam_selesai' => '07:50:00',
                'mata_pelajaran' => 'Bimbingan Konseling', 'nama_guru' => 'Anisa Rizqi Utami', 'id_guru' => null, 'ruangan' => 'B.1.2',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 3, 'jam_mulai' => '07:50:00', 'jam_selesai' => '08:30:00',
                'mata_pelajaran' => 'Bimbingan Konseling', 'nama_guru' => 'Anisa Rizqi Utami', 'id_guru' => null, 'ruangan' => 'B.1.2',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 4, 'jam_mulai' => '08:30:00', 'jam_selesai' => '09:00:00',
                'mata_pelajaran' => 'Istirahat', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Area Sekolah',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 5, 'jam_mulai' => '09:00:00', 'jam_selesai' => '09:40:00',
                'mata_pelajaran' => 'Sejarah', 'nama_guru' => 'Nina Wijiati', 'id_guru' => null, 'ruangan' => 'B.2.3',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 6, 'jam_mulai' => '09:40:00', 'jam_selesai' => '10:20:00',
                'mata_pelajaran' => 'Sejarah', 'nama_guru' => 'Nina Wijiati', 'id_guru' => null, 'ruangan' => 'B.2.3',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 7, 'jam_mulai' => '10:20:00', 'jam_selesai' => '11:00:00',
                'mata_pelajaran' => 'Kreativitas, Inovasi, dan Kewirausahaan', 'nama_guru' => 'Reza Aditya Permana', 'id_guru' => null, 'ruangan' => 'D.2.1',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 8, 'jam_mulai' => '11:00:00', 'jam_selesai' => '11:40:00',
                'mata_pelajaran' => 'Kreativitas, Inovasi, dan Kewirausahaan', 'nama_guru' => 'Reza Aditya Permana', 'id_guru' => null, 'ruangan' => 'D.2.1',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 9, 'jam_mulai' => '11:40:00', 'jam_selesai' => '12:20:00',
                'mata_pelajaran' => 'Pemrograman Berbasis Mobile', 'nama_guru' => 'Imelda Alfiana Palupi Dewi', 'id_guru' => null, 'ruangan' => 'D.2.1',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 10, 'jam_mulai' => '12:20:00', 'jam_selesai' => '13:20:00',
                'mata_pelajaran' => 'Istirahat', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Area Sekolah / Masjid',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 11, 'jam_mulai' => '13:20:00', 'jam_selesai' => '14:00:00',
                'mata_pelajaran' => 'Pemrograman Berbasis Mobile', 'nama_guru' => 'Imelda Alfiana Palupi Dewi', 'id_guru' => null, 'ruangan' => 'D.2.1',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 12, 'jam_mulai' => '14:00:00', 'jam_selesai' => '14:40:00',
                'mata_pelajaran' => 'Pemrograman Berbasis Mobile', 'nama_guru' => 'Imelda Alfiana Palupi Dewi', 'id_guru' => null, 'ruangan' => 'D.2.1',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 13, 'jam_mulai' => '14:40:00', 'jam_selesai' => '15:20:00',
                'mata_pelajaran' => 'Pemrograman Berbasis Mobile', 'nama_guru' => 'Imelda Alfiana Palupi Dewi', 'id_guru' => null, 'ruangan' => 'D.2.1',
            ],
            [
                'hari' => 'Kamis', 'jam_ke' => 14, 'jam_mulai' => '15:20:00', 'jam_selesai' => '16:00:00',
                'mata_pelajaran' => 'Ekskul Prestasi atau Ekskul Sentra', 'nama_guru' => 'Pembina Ekskul / Sentra', 'id_guru' => null, 'ruangan' => 'Area Sekolah / Sentra',
            ],

            // ======================== 5. JUMAT ========================
            [
                'hari' => 'Jumat', 'jam_ke' => 1, 'jam_mulai' => '07:00:00', 'jam_selesai' => '07:10:00',
                'mata_pelajaran' => 'Tadarus', 'nama_guru' => 'Pendamping Tadarus Pagi', 'id_guru' => null, 'ruangan' => 'B.2.2',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 2, 'jam_mulai' => '07:10:00', 'jam_selesai' => '08:00:00',
                'mata_pelajaran' => 'Kokurikuler', 'nama_guru' => 'Tim Kokurikuler', 'id_guru' => null, 'ruangan' => 'Lingkungan Sekolah',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 3, 'jam_mulai' => '08:00:00', 'jam_selesai' => '08:10:00',
                'mata_pelajaran' => 'Istirahat', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Area Sekolah',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 4, 'jam_mulai' => '08:10:00', 'jam_selesai' => '08:50:00',
                'mata_pelajaran' => 'Pendidikan Pancasila', 'nama_guru' => 'Shinta Pertiwi', 'id_guru' => null, 'ruangan' => 'B.2.2',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 5, 'jam_mulai' => '08:50:00', 'jam_selesai' => '09:30:00',
                'mata_pelajaran' => 'Pendidikan Pancasila', 'nama_guru' => 'Shinta Pertiwi', 'id_guru' => null, 'ruangan' => 'B.2.2',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 6, 'jam_mulai' => '09:30:00', 'jam_selesai' => '10:10:00',
                'mata_pelajaran' => 'Matematika', 'nama_guru' => 'Agustiana Dwi Nurcahyani', 'id_guru' => null, 'ruangan' => 'B.1.4',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 7, 'jam_mulai' => '10:10:00', 'jam_selesai' => '10:50:00',
                'mata_pelajaran' => 'Matematika', 'nama_guru' => 'Agustiana Dwi Nurcahyani', 'id_guru' => null, 'ruangan' => 'B.1.4',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 8, 'jam_mulai' => '10:50:00', 'jam_selesai' => '11:30:00',
                'mata_pelajaran' => 'Matematika', 'nama_guru' => 'Agustiana Dwi Nurcahyani', 'id_guru' => null, 'ruangan' => 'B.1.4',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 9, 'jam_mulai' => '11:30:00', 'jam_selesai' => '12:50:00',
                'mata_pelajaran' => 'Istirahat (Sholat Jumat)', 'nama_guru' => '-', 'id_guru' => null, 'ruangan' => 'Masjid / Area Sekolah',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 10, 'jam_mulai' => '12:50:00', 'jam_selesai' => '13:30:00',
                'mata_pelajaran' => 'Bahasa Inggris', 'nama_guru' => 'Oki Andrianto', 'id_guru' => null, 'ruangan' => 'A.3.4',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 11, 'jam_mulai' => '13:30:00', 'jam_selesai' => '14:10:00',
                'mata_pelajaran' => 'Bahasa Inggris', 'nama_guru' => 'Oki Andrianto', 'id_guru' => null, 'ruangan' => 'A.3.4',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 12, 'jam_mulai' => '14:10:00', 'jam_selesai' => '14:50:00',
                'mata_pelajaran' => 'Bahasa Inggris', 'nama_guru' => 'Oki Andrianto', 'id_guru' => null, 'ruangan' => 'A.3.4',
            ],
            [
                'hari' => 'Jumat', 'jam_ke' => 13, 'jam_mulai' => '14:50:00', 'jam_selesai' => '15:30:00',
                'mata_pelajaran' => 'Bahasa Inggris', 'nama_guru' => 'Oki Andrianto', 'id_guru' => null, 'ruangan' => 'A.3.4',
            ],
        ];

        // Bersihkan jadwal lama XI PPLG 4 agar sinkron 100% dengan jadwal resmi terbaru
        $validKeys = collect($jadwal)->map(fn (array $s): string => "{$s['hari']}|{$s['jam_ke']}")->all();
        JadwalPelajaran::where('id_kelas', $xiPplg4->id)
            ->get()
            ->each(function (JadwalPelajaran $existing) use ($validKeys): void {
                if (! in_array("{$existing->hari}|{$existing->jam_ke}", $validKeys, true)) {
                    $existing->delete();
                }
            });

        foreach ($jadwal as $slot) {
            JadwalPelajaran::updateOrCreate(
                [
                    'id_kelas' => $xiPplg4->id,
                    'hari' => $slot['hari'],
                    'jam_ke' => $slot['jam_ke'],
                ],
                $slot,
            );
        }
    }
}
