package com.smktelkom.ksjp.util

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class LiveSlotStatus(
    val status: String,
    val label: String,
    val isLive: Boolean,
    val isBreak: Boolean,
    val sisaMenit: Int?,
)

object DateUtils {
    private val bulanIndo = listOf(
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    )

    fun todayIso(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        return sdf.format(Date())
    }

    fun nowClockWib(): String {
        val sdf = SimpleDateFormat("HH:mm:ss", Locale.US)
        return "${sdf.format(Date())} WIB"
    }

    fun weekdayDateIso(dayOffsetFromMonday: Int): String {
        val cal = Calendar.getInstance()
        val dow = cal.get(Calendar.DAY_OF_WEEK)
        val diffToMon = if (dow == Calendar.SUNDAY) -6 else Calendar.MONDAY - dow
        cal.add(Calendar.DAY_OF_MONTH, diffToMon + dayOffsetFromMonday)
        return SimpleDateFormat("yyyy-MM-dd", Locale.US).format(cal.time)
    }

    fun shortTime(raw: String?): String {
        if (raw.isNullOrBlank()) return "--:--"
        return raw.take(5)
    }

    private fun toSeconds(raw: String?): Int? {
        if (raw.isNullOrBlank()) return null
        val parts = raw.split(":")
        if (parts.size < 2) return null
        val h = parts[0].toIntOrNull() ?: return null
        val m = parts[1].toIntOrNull() ?: return null
        val s = parts.getOrNull(2)?.toIntOrNull() ?: 0
        return h * 3600 + m * 60 + s
    }

    fun computeLiveStatus(
        jamMulai: String?,
        jamSelesai: String?,
        mataPelajaran: String?,
        targetDateIso: String,
    ): LiveSlotStatus {
        val today = todayIso()
        val isBreak = mataPelajaran?.lowercase()?.startsWith("istirahat") == true
        val startSec = toSeconds(jamMulai)
        val endSec = toSeconds(jamSelesai)

        if (startSec == null || endSec == null) {
            return LiveSlotStatus("akan_datang", "Terjadwal", false, isBreak, null)
        }

        if (targetDateIso != today) {
            val isPastDay = targetDateIso < today
            return LiveSlotStatus(
                status = if (isPastDay) "selesai" else "akan_datang",
                label = if (isPastDay) "Selesai" else "Akan Datang",
                isLive = false,
                isBreak = isBreak,
                sisaMenit = null,
            )
        }

        val cal = Calendar.getInstance()
        val nowSec =
            cal.get(Calendar.HOUR_OF_DAY) * 3600 +
                cal.get(Calendar.MINUTE) * 60 +
                cal.get(Calendar.SECOND)

        return when {
            nowSec in startSec until endSec -> {
                val sisa = ((endSec - nowSec) + 59) / 60
                LiveSlotStatus("sedang_berlangsung", "Sedang Berlangsung", true, isBreak, sisa.coerceAtLeast(1))
            }
            nowSec >= endSec -> {
                LiveSlotStatus("selesai", "Selesai", false, isBreak, 0)
            }
            else -> {
                val menuju = ((startSec - nowSec) + 59) / 60
                LiveSlotStatus("akan_datang", "Akan Datang", false, isBreak, menuju.coerceAtLeast(1))
            }
        }
    }

    fun formatIndoDate(iso: String?): String {
        if (iso.isNullOrBlank()) return "-"
        val parts = iso.split("-")
        if (parts.size != 3) return iso
        val year = parts[0]
        val month = parts[1].toIntOrNull() ?: return iso
        val day = parts[2].toIntOrNull() ?: return iso
        val monthName = bulanIndo.getOrNull(month - 1) ?: parts[1]
        return "$day $monthName $year"
    }

    fun formatRange(start: String?, end: String?): String {
        if (start.isNullOrBlank()) return "-"
        if (end.isNullOrBlank() || start == end) return formatIndoDate(start)
        return "${formatIndoDate(start)} – ${formatIndoDate(end)}"
    }

    fun momentumLabel(status: String?): String = when (status) {
        "penggantian_guru" -> "Penggantian Guru"
        "pindah_ruangan" -> "Pindah Ruangan"
        "ganti_mapel" -> "Ganti Mapel"
        "jam_kosong" -> "Jam Kosong / Tugas"
        "kegiatan_khusus" -> "Kegiatan Khusus"
        "jadwal_tambahan" -> "Jadwal Tambahan"
        else -> "Jadwal Momentum"
    }

    fun roleLabel(role: String?): String = when (role) {
        "siswa" -> "Siswa"
        "guru" -> "Guru / Wali Kelas"
        "admin_organisasi" -> "Admin Organisasi"
        else -> role ?: "-"
    }

    fun kategoriLabel(kategori: String?, sumber: String?): String {
        if (sumber == "organisasi" || kategori == "agenda_organisasi") return "Agenda Organisasi"
        return when (kategori) {
            "libur_umum" -> "Libur Umum"
            "libur_tahun_pelajaran", "libur_semester" -> "Libur Semester"
            "masuk_sekolah" -> "Masuk Sekolah"
            "upacara" -> "Upacara Nasional"
            "ujian_asesmen" -> "Asesmen / Ujian"
            "ukk" -> "Perkiraan UKK"
            "penyerahan_lhb" -> "Penyerahan LHB"
            "ramadhan_idul_fitri" -> "Ramadhan / Idul Fitri"
            "pkl" -> "PKL Kelas XII"
            "hut_sekolah" -> "HUT SMK Telkom"
            "kelulusan" -> "Kelulusan"
            else -> "Kegiatan Sekolah"
        }
    }
}
