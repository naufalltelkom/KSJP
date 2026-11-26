package com.smktelkom.ksjp.data.local

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.smktelkom.ksjp.BuildConfig
import com.smktelkom.ksjp.data.model.UserDto

/**
 * Menyimpan token Sanctum (login 1x persisten), profil user, dan URL server API.
 */
class SessionManager(context: Context) {
    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    fun saveSession(token: String, user: UserDto) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_USER_JSON, gson.toJson(user))
            .apply()
    }

    fun updateUser(user: UserDto) {
        prefs.edit()
            .putString(KEY_USER_JSON, gson.toJson(user))
            .apply()
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getUser(): UserDto? {
        val raw = prefs.getString(KEY_USER_JSON, null) ?: return null
        return try {
            gson.fromJson(raw, UserDto::class.java)
        } catch (_: Exception) {
            null
        }
    }

    fun isLoggedIn(): Boolean = !getToken().isNullOrBlank() && getUser() != null

    fun clearSession() {
        prefs.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_USER_JSON)
            .apply()
    }

    fun getBaseUrl(): String {
        val raw = prefs.getString(KEY_BASE_URL, BuildConfig.DEFAULT_WIFI_BASE_URL)
            ?: BuildConfig.DEFAULT_WIFI_BASE_URL
        val trimmed = raw.trim()
        return if (trimmed.endsWith("/")) trimmed else "$trimmed/"
    }

    fun setBaseUrl(url: String) {
        val trimmed = url.trim()
        val normalized = if (trimmed.endsWith("/")) trimmed else "$trimmed/"
        prefs.edit().putString(KEY_BASE_URL, normalized).apply()
    }

    fun getLastNotifiedId(): Int = prefs.getInt(KEY_LAST_NOTIF_ID, 0)

    fun setLastNotifiedId(id: Int) {
        prefs.edit().putInt(KEY_LAST_NOTIF_ID, id).apply()
    }

    companion object {
        private const val PREFS_NAME = "ksjp_session_prefs"
        private const val KEY_TOKEN = "sanctum_token"
        private const val KEY_USER_JSON = "auth_user_json"
        private const val KEY_BASE_URL = "api_base_url"
        private const val KEY_LAST_NOTIF_ID = "last_notified_id"
    }
}
