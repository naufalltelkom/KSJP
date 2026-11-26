<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('jadwal_pelajaran')
            ->where('hari', 'Jumat')
            ->where('mata_pelajaran', 'Bahasa Inggris')
            ->where('nama_guru', 'Okky')
            ->update([
                'nama_guru' => 'Oki Andrianto',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        DB::table('jadwal_pelajaran')
            ->where('hari', 'Jumat')
            ->where('mata_pelajaran', 'Bahasa Inggris')
            ->where('nama_guru', 'Oki Andrianto')
            ->update([
                'nama_guru' => 'Okky',
                'updated_at' => now(),
            ]);
    }
};
