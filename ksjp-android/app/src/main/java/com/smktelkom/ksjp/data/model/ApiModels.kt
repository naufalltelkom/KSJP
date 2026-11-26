package com.smktelkom.ksjp.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val identifier: String,
    val password: String,
    @SerializedName("device_name") val deviceName: String = "ksjp-android",
)

data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null,
)

data class BasicResponse(
    val success: Boolean,
    val message: String? = null,
)

data class LoginData(
    val token: String,
    @SerializedName("token_type") val tokenType: String,
    val user: UserDto,
)

data class UserDto(
    val id: Int,
    val nis: String? = null,
    val username: String,
    @SerializedName("nama_lengkap") val namaLengkap: String,
    val email: String? = null,
    val role: String,
    @SerializedName("jenis_kelamin") val jenisKelamin: String? = null,
    @SerializedName("jabatan_organisasi") val jabatanOrganisasi: String? = null,
    @SerializedName("id_kelas") val idKelas: Int? = null,
    val kelas: KelasDto? = null,
)

data class KelasDto(
    val id: Int,
    @SerializedName("nama_kelas") val namaKelas: String,
    val tingkat: String,
    val konsentrasi: String,
    @SerializedName("wali_kelas") val waliKelas: String,
    @SerializedName("tahun_ajaran") val tahunAjaran: String,
)

data class JadwalHarianResponse(
    val success: Boolean,
    val mode: String,
    val kelas: KelasDto? = null,
    val data: JadwalHarianData? = null,
)

data class JadwalHarianData(
    val tanggal: String,
    val hari: String,
    @SerializedName("is_libur") val isLibur: Boolean = false,
    @SerializedName("agenda_hari_ini") val agendaHariIni: List<AgendaRingkasDto> = emptyList(),
    @SerializedName("pergantian_jam") val pergantianJam: PergantianJamDto? = null,
    val jadwal: List<JadwalSlotDto> = emptyList(),
)

data class AgendaRingkasDto(
    val id: Int,
    val judul: String,
    val kategori: String,
    val sumber: String,
    val penyelenggara: String? = null,
    @SerializedName("is_libur") val isLibur: Boolean = false,
)

data class PergantianJamDto(
    @SerializedName("waktu_server") val waktuServer: String? = null,
    @SerializedName("slot_aktif") val slotAktif: JadwalSlotDto? = null,
    @SerializedName("slot_berikutnya") val slotBerikutnya: JadwalSlotDto? = null,
    @SerializedName("sisa_menit_jam_aktif") val sisaMenitJamAktif: Int? = null,
    @SerializedName("menit_menuju_jam_berikutnya") val menitMenujuJamBerikutnya: Int? = null,
    @SerializedName("pengingat_aktif") val pengingatAktif: Boolean = false,
    @SerializedName("pesan_pengingat") val pesanPengingat: String? = null,
)

data class JadwalSlotDto(
    val id: Int? = null,
    @SerializedName("momentum_id") val momentumId: Int? = null,
    @SerializedName("jam_ke") val jamKe: Int = 0,
    @SerializedName("jam_mulai") val jamMulai: String? = null,
    @SerializedName("jam_selesai") val jamSelesai: String? = null,
    @SerializedName("mata_pelajaran") val mataPelajaran: String,
    @SerializedName("nama_guru") val namaGuru: String,
    val ruangan: String,
    @SerializedName("is_momentum") val isMomentum: Boolean = false,
    @SerializedName("status_perubahan") val statusPerubahan: String? = null,
    val keterangan: String? = null,
    @SerializedName("jadwal_reguler_asli") val jadwalRegulerAsli: JadwalRegulerAsliDto? = null,
)

data class JadwalRegulerAsliDto(
    val id: Int,
    @SerializedName("mata_pelajaran") val mataPelajaran: String,
    @SerializedName("nama_guru") val namaGuru: String,
    val ruangan: String,
    @SerializedName("jam_mulai") val jamMulai: String? = null,
    @SerializedName("jam_selesai") val jamSelesai: String? = null,
)

data class KalenderResponse(
    val success: Boolean,
    @SerializedName("tahun_pelajaran") val tahunPelajaran: String? = null,
    val total: Int = 0,
    val data: List<KalenderItemDto> = emptyList(),
)

data class KalenderItemDto(
    val id: Int,
    val judul: String,
    @SerializedName("tanggal_mulai") val tanggalMulai: String,
    @SerializedName("tanggal_selesai") val tanggalSelesai: String,
    val kategori: String,
    val sumber: String,
    val penyelenggara: String? = null,
    @SerializedName("target_kelas") val targetKelas: String? = null,
    @SerializedName("is_libur") val isLibur: Boolean = false,
    val deskripsi: String? = null,
)

data class NotifikasiResponse(
    val success: Boolean,
    @SerializedName("unread_count") val unreadCount: Int = 0,
    @SerializedName("pengingat_pergantian_jam") val pengingatPergantianJam: PergantianJamDto? = null,
    val data: List<NotifikasiDto> = emptyList(),
)

data class NotifikasiDto(
    val id: Int,
    val judul: String,
    val pesan: String,
    val tipe: String,
    @SerializedName("id_kelas") val idKelas: Int? = null,
    @SerializedName("is_read") val isRead: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null,
)
