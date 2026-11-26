# KSJP Web (`ksjp-web`)

Website Portal Siswa & Akademik berbasis **React + Vite + Tailwind CSS v4** untuk proyek **KSJP (Kalender Siswa & Jadwal Pelajaran) — SMK Telkom Purwokerto Tahun Pelajaran 2026/2027**, mengacu pada desain Google Stitch dan terhubung ke REST API `ksjp-backend` (Laravel Sanctum).

## Menjalankan Secara Lokal

Pastikan PostgreSQL 17 dan `ksjp-backend` sudah berjalan di `http://127.0.0.1:8000`:

1. **Terminal 1 (Backend Laravel):**
   ```powershell
   cd d:\KSJP\ksjp-backend
   php artisan serve
   ```
2. **Terminal 2 (Frontend React):**
   ```powershell
   cd d:\KSJP\ksjp-web
   npm run dev
   ```
3. Buka di Google Chrome: `http://localhost:5173`

## Akun Demo Cepat
- **Siswa (XI PPLG 4):** `541251004` / `stematel2026`
- **Guru / Wali Kelas:** `firda.ayu` / `guru123`
- **Admin Organisasi (OSIS):** `osis.stematel` / `org123`
