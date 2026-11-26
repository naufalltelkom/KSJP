<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\KalenderController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\PushSubscriptionController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::get('/push/vapid-public-key', [PushSubscriptionController::class, 'vapidPublicKey']);
Route::match(['get', 'post'], '/cron/bell-reminder', [PushSubscriptionController::class, 'runBellReminder']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/jadwal', [JadwalController::class, 'index']);
    Route::get('/kalender', [KalenderController::class, 'index']);

    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::post('/notifikasi/read-all', [NotifikasiController::class, 'markAllAsRead']);
    Route::post('/notifikasi/{id}/read', [NotifikasiController::class, 'markAsRead']);

    Route::post('/push/subscribe', [PushSubscriptionController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [PushSubscriptionController::class, 'unsubscribe']);
    Route::post('/push/test', [PushSubscriptionController::class, 'test']);
});
