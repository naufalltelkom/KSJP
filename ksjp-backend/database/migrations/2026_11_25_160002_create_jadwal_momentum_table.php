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
        Schema::create('jadwal_momentum', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_kelas')->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('id_jadwal_reguler')->nullable()->constrained('jadwal_pelajaran')->nullOnDelete();
            $table->date('tanggal')->index();
            $table->unsignedSmallInteger('jam_ke')->nullable();
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();
            $table->string('mata_pelajaran', 150)->nullable();
            $table->string('nama_guru_pengganti', 150)->nullable();
            $table->string('ruangan_baru', 80)->nullable();
            $table->string('status_perubahan', 40)->default('penggantian_guru');
            $table->text('keterangan')->nullable();
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['id_kelas', 'tanggal']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_momentum');
    }
};
