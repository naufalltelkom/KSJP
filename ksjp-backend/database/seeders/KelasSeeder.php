<?php

namespace Database\Seeders;

use App\Models\Kelas;
use Illuminate\Database\Seeder;

class KelasSeeder extends Seeder
{
    public function run(): void
    {
        Kelas::updateOrCreate(
            [
                'nama_kelas' => 'XI PPLG 4',
                'tahun_ajaran' => '2026/2027',
            ],
            [
                'tingkat' => 'XI',
                'konsentrasi' => 'Rekayasa Perangkat Lunak',
                'wali_kelas' => 'Firda Ayu Nirmala, S.Kom',
            ],
        );
    }
}
