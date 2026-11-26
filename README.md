# KSJP — Kalender Siswa & Jadwal Pelajaran

Proyek sistem informasi jadwal pelajaran dinamis (**Momentum**), kalender pendidikan resmi **2026/2027**, dan notifikasi real-time untuk **SMK Telkom Purwokerto**.

## Struktur Monorepo
- `ksjp-backend/` — Laravel 13 + Filament Admin v5 + Laravel Sanctum + PostgreSQL 17
- `ksjp-web/` — React 19 + Vite + Tailwind CSS v4 (siap deploy di Vercel dengan Root Directory `ksjp-web`)
- `ksjp-android/` — Kotlin Android (Android Studio + Retrofit 2 + Material 3)
- [BLUEPRINT.md](BLUEPRINT.md) — Dokumentasi arsitektur tetap & RBAC 3 peran (`siswa`, `guru`, `admin_organisasi`)
- [API_CONTRACT.md](API_CONTRACT.md) — Spesifikasi REST API JSON
