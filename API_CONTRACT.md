# API CONTRACT — KSJP (Kalender Siswa & Jadwal Pelajaran)

**Base URL (Local Dev):** `http://127.0.0.1:8000/api`  
**Autentikasi:** Laravel Sanctum Bearer Token (`Authorization: Bearer <token>`)  
**Content-Type:** `application/json`  
**Accept:** `application/json`  

---

## Akun Bawaan Seeder (Untuk Pengujian)

| Role | Identifier (NIS / Username) | Email (Filament `/admin`) | Password | Keterangan |
|---|---|---|---|---|
| `siswa` | `541251004` (s.d. `541251302`, 29 siswa) | `541251004@student.smktelkom-pwt.sch.id` | `stematel2026` | Siswa XI PPLG 4 (`Achmad Fanani` dkk). Tidak bisa login ke `/admin`. |
| `guru` | `firda.ayu` / `GURU001` | `firda@smktelkom-pwt.sch.id` | `guru123` | Wali Kelas XI PPLG 4 (`Firda Ayu Nirmala, S.Kom`). Akses penuh Jadwal Reguler & Jadwal Momentum di `/admin`. |
| `admin_organisasi` | `osis.stematel` / `ORG001` | `osis@smktelkom-pwt.sch.id` | `org123` | Pengurus OSIS SMK Telkom Purwokerto. Akses kelola agenda organisasi di `/admin`. |

---

## 1. Autentikasi

### 1.1 `POST /api/login`
Login 1x persisten menggunakan **NIS** atau **Username** (atau email). Token Sanctum tidak kedaluwarsa (`expiration = null`) sampai pengguna memanggil `/api/logout`.

**Request Body:**
```json
{
  "identifier": "541251004",
  "password": "stematel2026",
  "device_name": "android-pixel-8"
}
```
> Catatan: Endpoint juga menerima field `nis` atau `username` sebagai pengganti `identifier`.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "1|xYzAbCdEfGhIjKlMnOpQrStUvWxYz...",
    "token_type": "Bearer",
    "user": {
      "id": 7,
      "nis": "541251004",
      "username": "541251004",
      "nama_lengkap": "ACHMAD FANANI",
      "email": "541251004@student.smktelkom-pwt.sch.id",
      "role": "siswa",
      "jenis_kelamin": "L",
      "jabatan_organisasi": null,
      "id_kelas": 1,
      "kelas": {
        "id": 1,
        "nama_kelas": "XI PPLG 4",
        "tingkat": "XI",
        "konsentrasi": "Rekayasa Perangkat Lunak",
        "wali_kelas": "Firda Ayu Nirmala, S.Kom",
        "tahun_ajaran": "2026/2027"
      }
    }
  }
}
```

**Response `401 Unauthorized`:**
```json
{
  "success": false,
  "message": "NIS/Username atau password tidak sesuai."
}
```

### 1.2 `GET /api/me` *(Requires Bearer Token)*
Mengambil profil pengguna yang sedang login beserta data kelasnya.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "nis": "541251004",
    "username": "541251004",
    "nama_lengkap": "ACHMAD FANANI",
    "email": "541251004@student.smktelkom-pwt.sch.id",
    "role": "siswa",
    "jenis_kelamin": "L",
    "jabatan_organisasi": null,
    "id_kelas": 1,
    "kelas": {
      "id": 1,
      "nama_kelas": "XI PPLG 4",
      "tingkat": "XI",
      "konsentrasi": "Rekayasa Perangkat Lunak",
      "wali_kelas": "Firda Ayu Nirmala, S.Kom",
      "tahun_ajaran": "2026/2027"
    }
  }
}
```

### 1.3 `POST /api/logout` *(Requires Bearer Token)*
Mencabut token Sanctum yang sedang digunakan.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Logout berhasil. Token telah dicabut."
}
```

---

## 2. Jadwal Pelajaran & Jadwal Dinamis (Momentum)

### 2.1 `GET /api/jadwal` *(Requires Bearer Token)*
Mengambil jadwal pelajaran kelas. Jika terdapat data di `jadwal_momentum` pada tanggal yang diminta, endpoint **otomatis menimpa** slot jadwal reguler dan menyertakan `"is_momentum": true`.

**Query Parameters:**
- `tanggal` *(opsional, format `YYYY-MM-DD`, default: hari ini)*
- `mode` *(opsional: `harian` | `mingguan`, default: `harian`)*
- `id_kelas` *(opsional, hanya untuk `guru` / `admin_organisasi`; `siswa` otomatis terkunci ke kelasnya sendiri)*

**Response `200 OK` (`mode=harian`):**
```json
{
  "success": true,
  "mode": "harian",
  "kelas": {
    "id": 1,
    "nama_kelas": "XI PPLG 4",
    "tingkat": "XI",
    "konsentrasi": "Rekayasa Perangkat Lunak",
    "wali_kelas": "Firda Ayu Nirmala, S.Kom",
    "tahun_ajaran": "2026/2027"
  },
  "data": {
    "tanggal": "2026-11-25",
    "hari": "Rabu",
    "is_libur": false,
    "agenda_hari_ini": [],
    "pergantian_jam": {
      "waktu_server": "09:10:00",
      "slot_aktif": {
        "id": 9,
        "momentum_id": 1,
        "jam_ke": 1,
        "jam_mulai": "07:00:00",
        "jam_selesai": "09:15:00",
        "mata_pelajaran": "Pemrograman Web (React & Frontend)",
        "nama_guru": "Firda Ayu Nirmala, S.Kom (Guru Pengganti)",
        "ruangan": "Lab RPL Terpadu Lt. 2",
        "is_momentum": true,
        "status_perubahan": "pindah_ruangan",
        "keterangan": "Perpindahan ruangan ke Lab RPL Terpadu Lt. 2 untuk praktikum proyek KSJP.",
        "jadwal_reguler_asli": {
          "id": 9,
          "mata_pelajaran": "Pemrograman Web (React & Frontend)",
          "nama_guru": "Budi Santoso, S.Kom",
          "ruangan": "Lab RPL 2",
          "jam_mulai": "07:00:00",
          "jam_selesai": "09:15:00"
        }
      },
      "slot_berikutnya": {
        "id": 10,
        "momentum_id": null,
        "jam_ke": 2,
        "jam_mulai": "09:30:00",
        "jam_selesai": "11:45:00",
        "mata_pelajaran": "Pemodelan Perangkat Lunak",
        "nama_guru": "Firda Ayu Nirmala, S.Kom",
        "ruangan": "Lab RPL 1",
        "is_momentum": false,
        "status_perubahan": null,
        "keterangan": null,
        "jadwal_reguler_asli": null
      },
      "sisa_menit_jam_aktif": 5,
      "menit_menuju_jam_berikutnya": 20,
      "pengingat_aktif": true,
      "pesan_pengingat": "Pergantian jam dalam 5 menit (Pemodelan Perangkat Lunak)."
    },
    "jadwal": [
      {
        "id": 9,
        "momentum_id": 1,
        "jam_ke": 1,
        "jam_mulai": "07:00:00",
        "jam_selesai": "09:15:00",
        "mata_pelajaran": "Pemrograman Web (React & Frontend)",
        "nama_guru": "Firda Ayu Nirmala, S.Kom (Guru Pengganti)",
        "ruangan": "Lab RPL Terpadu Lt. 2",
        "is_momentum": true,
        "status_perubahan": "pindah_ruangan",
        "keterangan": "Perpindahan ruangan ke Lab RPL Terpadu Lt. 2 untuk praktikum proyek KSJP.",
        "jadwal_reguler_asli": {
          "id": 9,
          "mata_pelajaran": "Pemrograman Web (React & Frontend)",
          "nama_guru": "Budi Santoso, S.Kom",
          "ruangan": "Lab RPL 2",
          "jam_mulai": "07:00:00",
          "jam_selesai": "09:15:00"
        }
      },
      {
        "id": 10,
        "momentum_id": null,
        "jam_ke": 2,
        "jam_mulai": "09:30:00",
        "jam_selesai": "11:45:00",
        "mata_pelajaran": "Pemodelan Perangkat Lunak",
        "nama_guru": "Firda Ayu Nirmala, S.Kom",
        "ruangan": "Lab RPL 1",
        "is_momentum": false,
        "status_perubahan": null,
        "keterangan": null,
        "jadwal_reguler_asli": null
      }
    ]
  }
}
```

> Pada `mode=mingguan`, field `data` berupa array berisi objek jadwal harian dari Senin sampai Sabtu dalam minggu tersebut.

---

## 3. Kalender Pendidikan 2026/2027 & Agenda Organisasi

### 3.1 `GET /api/kalender` *(Requires Bearer Token)*
Mengembalikan agenda Kalender Pendidikan SMK Telkom Purwokerto TP 2026/2027 serta agenda kegiatan siswa dari organisasi (`OSIS`, `MPK`, `PMR`, `Pramuka`).

**Query Parameters:**
- `bulan` *(opsional, `1..12`)*
- `tahun` *(opsional, misal `2026` atau `2027`)*
- `kategori` *(opsional, misal `libur_umum`, `ujian_asesmen`, `upacara`, `agenda_organisasi`)*
- `sumber` *(opsional: `resmi_sekolah` | `organisasi`)*
- `search` *(opsional, kata kunci judul/deskripsi/penyelenggara)*

**Response `200 OK`:**
```json
{
  "success": true,
  "tahun_pelajaran": "2026/2027",
  "total": 2,
  "data": [
    {
      "id": 6,
      "judul": "Mengikuti Upacara HUT Kemerdekaan RI",
      "tanggal_mulai": "2026-08-17",
      "tanggal_selesai": "2026-08-17",
      "kategori": "upacara",
      "sumber": "resmi_sekolah",
      "penyelenggara": "SMK Telkom Purwokerto",
      "target_kelas": "Semua Kelas",
      "is_libur": false,
      "deskripsi": "Upacara Hari Besar Nasional memperingati HUT Kemerdekaan Republik Indonesia."
    },
    {
      "id": 50,
      "judul": "Classmeeting Stematel Semester Ganjil",
      "tanggal_mulai": "2026-12-14",
      "tanggal_selesai": "2026-12-17",
      "kategori": "agenda_organisasi",
      "sumber": "organisasi",
      "penyelenggara": "OSIS",
      "target_kelas": "Semua Kelas",
      "is_libur": false,
      "deskripsi": "Kompetisi olahraga dan e-sport antar kelas pasca-PSAS oleh OSIS SMK Telkom Purwokerto."
    }
  ]
}
```

---

## 4. Notifikasi Real-time & Pengingat Pergantian Jam

### 4.1 `GET /api/notifikasi` *(Requires Bearer Token)*
Mengembalikan notifikasi terbaru (jadwal momentum baru, agenda organisasi, pengumuman) beserta status pengingat pergantian jam real-time.

**Query Parameters:**
- `tipe` *(opsional: `momentum` | `pergantian_jam` | `kalender` | `pengumuman`)*
- `unread_only` *(opsional: `0` | `1`)*
- `limit` *(opsional, `1..100`, default `30`)*

**Response `200 OK`:**
```json
{
  "success": true,
  "unread_count": 2,
  "pengingat_pergantian_jam": {
    "waktu_server": "09:10:00",
    "slot_aktif": { "..." },
    "slot_berikutnya": { "..." },
    "sisa_menit_jam_aktif": 5,
    "menit_menuju_jam_berikutnya": 20,
    "pengingat_aktif": true,
    "pesan_pengingat": "Pergantian jam dalam 5 menit (Pemodelan Perangkat Lunak)."
  },
  "data": [
    {
      "id": 1,
      "judul": "Jadwal Momentum: Pindah Ruangan XI PPLG 4",
      "pesan": "Pemrograman Web (React & Frontend) pada 25 Nov 2026 dipindahkan ke Lab RPL Terpadu Lt. 2 bersama Firda Ayu Nirmala, S.Kom.",
      "tipe": "momentum",
      "id_kelas": 1,
      "data_payload": {
        "id_jadwal_momentum": 1,
        "id_kelas": 1,
        "tanggal": "2026-11-25",
        "status_perubahan": "pindah_ruangan",
        "ruangan_baru": "Lab RPL Terpadu Lt. 2"
      },
      "is_read": false,
      "created_at": "2026-11-25T22:55:00+07:00"
    }
  ]
}
```

### 4.2 `POST /api/notifikasi/{id}/read` *(Requires Bearer Token)*
Menandai satu notifikasi sebagai sudah dibaca untuk user yang sedang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Notifikasi ditandai sudah dibaca."
}
```

### 4.3 `POST /api/notifikasi/read-all` *(Requires Bearer Token)*
Menandai seluruh notifikasi yang terlihat oleh user sebagai sudah dibaca.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Seluruh notifikasi ditandai sudah dibaca."
}
```

---

## Error Responses Standar

- `401 Unauthenticated`: Token tidak disertakan atau tidak valid.
- `403 Forbidden`: Akses ditolak (misal siswa meminta `id_kelas` milik kelas lain).
- `404 Not Found`: Resource tidak ditemukan.
- `422 Unprocessable Entity`: Error validasi input (`errors` object standar Laravel).
