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
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_user')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('id_kelas')->nullable()->constrained('kelas')->cascadeOnDelete();
            $table->string('judul', 200);
            $table->text('pesan');
            $table->string('tipe', 40)->index();
            $table->json('data_payload')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['id_kelas', 'created_at']);
            $table->index(['id_user', 'is_read']);
        });

        Schema::create('notifikasi_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_notifikasi')->constrained('notifikasi')->cascadeOnDelete();
            $table->foreignId('id_user')->constrained('users')->cascadeOnDelete();
            $table->timestamp('read_at');

            $table->unique(['id_notifikasi', 'id_user']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifikasi_reads');
        Schema::dropIfExists('notifikasi');
    }
};
