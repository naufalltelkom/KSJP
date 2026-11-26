<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jadwal_pelajaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_kelas')->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('id_guru')->nullable()->constrained('users')->nullOnDelete();
            $table->string('hari', 20)->index();
            $table->unsignedSmallInteger('jam_ke');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->string('mata_pelajaran', 150);
            $table->string('nama_guru', 150);
            $table->string('ruangan', 80);
            $table->timestamps();

            $table->index(['id_kelas', 'hari', 'jam_ke']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_pelajaran');
    }
};
