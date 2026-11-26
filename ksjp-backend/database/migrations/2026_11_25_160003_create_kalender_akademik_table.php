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
        Schema::create('kalender_akademik', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 200);
            $table->date('tanggal_mulai')->index();
            $table->date('tanggal_selesai')->index();
            $table->string('kategori', 50)->index();
            $table->string('sumber', 30)->default('resmi_sekolah');
            $table->string('penyelenggara', 120)->nullable();
            $table->string('target_kelas', 100)->nullable();
            $table->boolean('is_libur')->default(false);
            $table->text('deskripsi')->nullable();
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kalender_akademik');
    }
};
