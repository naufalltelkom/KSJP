<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Deduplicate jadwal_pelajaran per (id_kelas, hari, jam_ke)
        $jadwalRows = DB::table('jadwal_pelajaran')->orderBy('id')->get();
        $jadwalKeep = [];
        foreach ($jadwalRows as $row) {
            $key = "{$row->id_kelas}|{$row->hari}|{$row->jam_ke}";
            if (! isset($jadwalKeep[$key])) {
                $jadwalKeep[$key] = $row->id;
                continue;
            }
            $keepId = $jadwalKeep[$key];
            DB::table('jadwal_momentum')
                ->where('id_jadwal_reguler', $row->id)
                ->update(['id_jadwal_reguler' => $keepId]);
            DB::table('jadwal_pelajaran')->where('id', $row->id)->delete();
        }

        // 2. Deduplicate jadwal_momentum per (id_kelas, tanggal, jam_ke)
        $momentumRows = DB::table('jadwal_momentum')->orderBy('id')->get();
        $momentumKeep = [];
        foreach ($momentumRows as $row) {
            $key = "{$row->id_kelas}|{$row->tanggal}|" . ($row->jam_ke ?? "null_{$row->id}");
            if (! isset($momentumKeep[$key])) {
                $momentumKeep[$key] = $row->id;
                continue;
            }
            DB::table('jadwal_momentum')->where('id', $row->id)->delete();
        }

        // 3. Deduplicate kalender_akademik per (judul, tanggal_mulai, tanggal_selesai, sumber)
        $kalenderRows = DB::table('kalender_akademik')->orderBy('id')->get();
        $kalenderKeep = [];
        foreach ($kalenderRows as $row) {
            $key = "{$row->judul}|{$row->tanggal_mulai}|{$row->tanggal_selesai}|{$row->sumber}";
            if (! isset($kalenderKeep[$key])) {
                $kalenderKeep[$key] = $row->id;
                continue;
            }
            DB::table('kalender_akademik')->where('id', $row->id)->delete();
        }

        // 4. Deduplicate notifikasi per (id_user, id_kelas, tipe, judul, pesan)
        $notifRows = DB::table('notifikasi')->orderBy('id')->get();
        $notifKeep = [];
        foreach ($notifRows as $row) {
            $key = ($row->id_user ?? 'null') . '|' . ($row->id_kelas ?? 'null') . "|{$row->tipe}|{$row->judul}|{$row->pesan}";
            if (! isset($notifKeep[$key])) {
                $notifKeep[$key] = $row->id;
                continue;
            }
            DB::table('notifikasi_reads')->where('id_notifikasi', $row->id)->delete();
            DB::table('notifikasi')->where('id', $row->id)->delete();
        }

        // 5. Enforce unique indexes to prevent concurrent seeder duplication
        Schema::table('jadwal_pelajaran', function (Blueprint $table): void {
            $table->unique(['id_kelas', 'hari', 'jam_ke'], 'jadwal_pelajaran_kelas_hari_jam_unique');
        });

        Schema::table('jadwal_momentum', function (Blueprint $table): void {
            $table->unique(['id_kelas', 'tanggal', 'jam_ke'], 'jadwal_momentum_kelas_tanggal_jam_unique');
        });

        Schema::table('kalender_akademik', function (Blueprint $table): void {
            $table->unique(['judul', 'tanggal_mulai', 'tanggal_selesai', 'sumber'], 'kalender_akademik_event_unique');
        });
    }

    public function down(): void
    {
        Schema::table('kalender_akademik', function (Blueprint $table): void {
            $table->dropUnique('kalender_akademik_event_unique');
        });

        Schema::table('jadwal_momentum', function (Blueprint $table): void {
            $table->dropUnique('jadwal_momentum_kelas_tanggal_jam_unique');
        });

        Schema::table('jadwal_pelajaran', function (Blueprint $table): void {
            $table->dropUnique('jadwal_pelajaran_kelas_hari_jam_unique');
        });
    }
};
