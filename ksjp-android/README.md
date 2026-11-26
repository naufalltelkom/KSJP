# KSJP Android (`ksjp-android`)

Aplikasi mobile native **Kotlin Android + Material Design 3 + Retrofit 2** untuk proyek **KSJP (Kalender Siswa & Jadwal Pelajaran) — SMK Telkom Purwokerto Tahun Pelajaran 2026/2027**, mengacu pada desain *SMK Telkom Mobile Portal* di Google Stitch dan terhubung ke REST API `ksjp-backend` (Laravel Sanctum).

## Fitur Utama
- **Login 1x Persisten (Sanctum):** Login menggunakan NIS/Username; sesi disimpan otomatis lewat `SessionManager` (`SharedPreferences`).
- **Beranda (`DashboardFragment`):** Sapaan personal, status **Sesi Berlangsung / Berikutnya**, kartu **Jadwal Momentum**, ringkasan **Wali Kelas (`Firda Ayu Nirmala, S.Kom`)**, cuplikan kalender, dan notifikasi terbaru.
- **Jadwal Pelajaran (`JadwalFragment`):** Filter per hari (`Hari Ini`, `Senin`–`Jumat`) + filter khusus **Jadwal Momentum**, badge perubahan, coretan jadwal reguler awal, serta dialog detail sesi.
- **Kalender Pendidikan 2026/2027 (`KalenderFragment`):** Seluruh agenda resmi Juli 2026 – Juli 2027 & agenda organisasi siswa, filter `Ganjil 2026` / `Genap 2027` / `Organisasi` / `Hari Libur`, serta pencarian real-time.
- **Notifikasi Real-time (`NotifikasiFragment` + `KsjpNotifier`):** Polling berkala 30 detik & pop-up notifikasi sistem Android (`POST_NOTIFICATIONS`) untuk jadwal momentum baru dan pengingat pergantian jam.

## Cara Menampilkan di HP Android Fisik atau Emulator

### 1. Jalankan Backend Laravel agar Dapat Diakses HP
Pastikan PostgreSQL 17 berjalan, lalu jalankan Laravel pada `0.0.0.0:8000` agar HP satu Wi-Fi bisa terhubung:
```powershell
cd d:\KSJP\ksjp-backend
php artisan serve --host=0.0.0.0 --port=8000
```
*(Alternatif lewat kabel USB + USB Debugging aktif: jalankan `adb reverse tcp:8000 tcp:8000`, lalu pilih preset **USB ADB (`http://127.0.0.1:8000/api/`)** di layar login aplikasi Android).*

### 2. Buka di Android Studio / Install APK ke HP
- Buka folder `d:\KSJP\ksjp-android` di **Android Studio**, tunggu Gradle Sync, colokkan HP Android (USB Debugging aktif) atau jalankan Android Emulator, lalu klik **Run ▶**.
- Atau install langsung APK debug hasil build (`app/build/outputs/apk/debug/app-debug.apk`) melalui:
  ```powershell
  cd d:\KSJP\ksjp-android
  .\gradlew.bat installDebug
  ```
- Pada layar login aplikasi, pilih preset URL server:
  - **HP Wi-Fi:** `http://192.168.1.27:8000/api/` *(default)*
  - **Emulator Android Studio:** `http://10.0.2.2:8000/api/`
  - **HP via Kabel USB (`adb reverse`):** `http://127.0.0.1:8000/api/`
