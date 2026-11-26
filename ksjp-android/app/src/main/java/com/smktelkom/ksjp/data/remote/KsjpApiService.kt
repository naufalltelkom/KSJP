package com.smktelkom.ksjp.data.remote

import com.smktelkom.ksjp.data.model.ApiResponse
import com.smktelkom.ksjp.data.model.BasicResponse
import com.smktelkom.ksjp.data.model.JadwalHarianResponse
import com.smktelkom.ksjp.data.model.KalenderResponse
import com.smktelkom.ksjp.data.model.LoginData
import com.smktelkom.ksjp.data.model.LoginRequest
import com.smktelkom.ksjp.data.model.NotifikasiResponse
import com.smktelkom.ksjp.data.model.UserDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface KsjpApiService {
    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<LoginData>>

    @GET("me")
    suspend fun me(): Response<ApiResponse<UserDto>>

    @POST("logout")
    suspend fun logout(): Response<BasicResponse>

    @GET("jadwal")
    suspend fun getJadwal(
        @Query("tanggal") tanggal: String? = null,
        @Query("mode") mode: String = "harian",
        @Query("id_kelas") idKelas: Int? = null,
    ): Response<JadwalHarianResponse>

    @GET("kalender")
    suspend fun getKalender(
        @Query("bulan") bulan: Int? = null,
        @Query("tahun") tahun: Int? = null,
        @Query("kategori") kategori: String? = null,
        @Query("sumber") sumber: String? = null,
        @Query("search") search: String? = null,
    ): Response<KalenderResponse>

    @GET("notifikasi")
    suspend fun getNotifikasi(
        @Query("tipe") tipe: String? = null,
        @Query("unread_only") unreadOnly: Int? = null,
        @Query("limit") limit: Int = 50,
    ): Response<NotifikasiResponse>

    @POST("notifikasi/{id}/read")
    suspend fun markNotifikasiRead(@Path("id") id: Int): Response<BasicResponse>

    @POST("notifikasi/read-all")
    suspend fun markAllNotifikasiRead(): Response<BasicResponse>
}
