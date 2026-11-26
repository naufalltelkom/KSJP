package com.smktelkom.ksjp.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smktelkom.ksjp.BuildConfig
import com.smktelkom.ksjp.data.local.SessionManager
import com.smktelkom.ksjp.data.model.LoginRequest
import com.smktelkom.ksjp.data.remote.ApiClient
import com.smktelkom.ksjp.databinding.ActivityLoginBinding
import kotlinx.coroutines.launch
import org.json.JSONObject

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sessionManager = SessionManager(this)

        if (sessionManager.isLoggedIn()) {
            openMain()
            return
        }

        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.etBaseUrl.setText(sessionManager.getBaseUrl())

        binding.chipDemoSiswa.setOnClickListener {
            binding.etIdentifier.setText("541251004")
            binding.etPassword.setText("stematel2026")
            hideError()
        }
        binding.chipDemoGuru.setOnClickListener {
            binding.etIdentifier.setText("firda.ayu")
            binding.etPassword.setText("guru123")
            hideError()
        }
        binding.chipDemoOsis.setOnClickListener {
            binding.etIdentifier.setText("osis.stematel")
            binding.etPassword.setText("org123")
            hideError()
        }

        binding.chipUrlWifi.setOnClickListener {
            binding.etBaseUrl.setText(BuildConfig.DEFAULT_WIFI_BASE_URL)
        }
        binding.chipUrlEmulator.setOnClickListener {
            binding.etBaseUrl.setText(BuildConfig.EMULATOR_BASE_URL)
        }
        binding.chipUrlUsb.setOnClickListener {
            binding.etBaseUrl.setText(BuildConfig.USB_ADB_BASE_URL)
        }

        binding.btnLogin.setOnClickListener { performLogin() }
    }

    private fun performLogin() {
        val identifier = binding.etIdentifier.text?.toString()?.trim().orEmpty()
        val password = binding.etPassword.text?.toString().orEmpty()
        val baseUrl = binding.etBaseUrl.text?.toString()?.trim().orEmpty()

        if (identifier.isEmpty() || password.isEmpty()) {
            showError("NIS/Username dan kata sandi wajib diisi.")
            return
        }
        if (baseUrl.isNotEmpty()) {
            sessionManager.setBaseUrl(baseUrl)
        }

        hideError()
        setLoading(true)

        lifecycleScope.launch {
            try {
                val api = ApiClient.create(sessionManager)
                val response = api.login(LoginRequest(identifier, password, "ksjp-android"))
                val body = response.body()

                if (response.isSuccessful && body?.success == true && body.data != null) {
                    sessionManager.saveSession(body.data.token, body.data.user)
                    openMain()
                } else {
                    val errText = response.errorBody()?.string()
                    val parsedMsg = errText?.let {
                        try {
                            JSONObject(it).optString("message")
                        } catch (_: Exception) {
                            null
                        }
                    }
                    showError(parsedMsg?.takeIf { it.isNotBlank() } ?: body?.message ?: "Login gagal (${response.code()}).")
                }
            } catch (e: Exception) {
                showError("Gagal terhubung ke ${sessionManager.getBaseUrl()} (${e.localizedMessage ?: "Network Error"}).")
            } finally {
                setLoading(false)
            }
        }
    }

    private fun openMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    private fun setLoading(loading: Boolean) {
        binding.btnLogin.isEnabled = !loading
        binding.progressLogin.visibility = if (loading) View.VISIBLE else View.GONE
    }

    private fun showError(msg: String) {
        binding.tvError.text = msg
        binding.tvError.visibility = View.VISIBLE
    }

    private fun hideError() {
        binding.tvError.visibility = View.GONE
    }
}
