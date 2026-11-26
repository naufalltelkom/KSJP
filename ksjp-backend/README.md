# KSJP Backend (`ksjp-backend`)

Backend terintegrasi **Laravel 13 + Filament Admin v5 + Laravel Sanctum + PostgreSQL 17** untuk proyek **KSJP (Kalender Siswa & Jadwal Pelajaran)** — SMK Telkom Purwokerto Tahun Pelajaran 2026/2027.

## Menjalankan Server Lokal

1. **Jalankan PostgreSQL 17** (binari terpasang di `C:\laragon\bin\postgresql\postgresql-17.12`, klaster data di `C:\laragon\data\postgresql-17`):
   ```powershell
   C:\laragon\bin\postgresql\postgresql-17.12\bin\pg_ctl.exe -D "C:\laragon\data\postgresql-17" -l "C:\laragon\data\postgresql-17\postgresql.log" start
   ```
   Untuk menghentikan PostgreSQL:
   ```powershell
   C:\laragon\bin\postgresql\postgresql-17.12\bin\pg_ctl.exe -D "C:\laragon\data\postgresql-17" stop
   ```

2. **Jalankan Server Laravel**:
   ```powershell
   cd d:\KSJP\ksjp-backend
   php artisan serve
   ```
   - Filament Admin Panel: `http://127.0.0.1:8000/admin`
   - REST API Base URL: `http://127.0.0.1:8000/api`

## Migrasi, Seeder & Pengujian

```powershell
cd d:\KSJP\ksjp-backend
php artisan migrate:fresh --seed
php vendor\phpunit\phpunit\phpunit
```

Lihat [BLUEPRINT.md](../BLUEPRINT.md) dan [API_CONTRACT.md](../API_CONTRACT.md) di root proyek untuk arsitektur lengkap, daftar akun demo per peran (`siswa`, `guru`, `admin_organisasi`), serta kontrak JSON setiap endpoint API.
