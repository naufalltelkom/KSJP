<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('id_user')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('id_kelas')->nullable()->constrained('kelas')->cascadeOnDelete();
            $table->string('endpoint_hash', 64)->unique();
            $table->text('endpoint');
            $table->text('p256dh');
            $table->text('auth');
            $table->string('content_encoding', 32)->default('aes128gcm');
            $table->string('user_agent', 255)->nullable();
            $table->timestamps();

            $table->index(['id_kelas', 'id_user']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
