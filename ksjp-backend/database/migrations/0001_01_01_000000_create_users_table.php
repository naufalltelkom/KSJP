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
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kelas', 50);
            $table->string('tingkat', 10);
            $table->string('konsentrasi', 150);
            $table->string('wali_kelas', 150);
            $table->string('tahun_ajaran', 20)->default('2026/2027');
            $table->timestamps();

            $table->unique(['nama_kelas', 'tahun_ajaran']);
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nis', 30)->nullable()->unique();
            $table->string('username', 60)->unique();
            $table->string('nama_lengkap', 150);
            $table->string('email')->nullable()->unique();
            $table->string('role', 30)->default('siswa')->index();
            $table->foreignId('id_kelas')->nullable()->constrained('kelas')->nullOnDelete();
            $table->string('jenis_kelamin', 1)->nullable();
            $table->string('jabatan_organisasi', 100)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('kelas');
    }
};
