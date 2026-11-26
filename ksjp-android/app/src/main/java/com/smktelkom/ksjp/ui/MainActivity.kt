package com.smktelkom.ksjp.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.smktelkom.ksjp.R
import com.smktelkom.ksjp.data.local.SessionManager
import com.smktelkom.ksjp.data.remote.ApiClient
import com.smktelkom.ksjp.databinding.ActivityMainBinding
import com.smktelkom.ksjp.util.KsjpNotifier
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    lateinit var sessionManager: SessionManager
        private set

    private var pollingJob: Job? = null

    private val notifPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { _ -> }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sessionManager = SessionManager(this)

        if (!sessionManager.isLoggedIn()) {
            redirectToLogin()
            return
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        KsjpNotifier.ensureChannel(this)
        requestNotificationPermissionIfNeeded()

        binding.bottomNav.setOnItemSelectedListener { item ->
            val fragment: Fragment = when (item.itemId) {
                R.id.nav_dashboard -> DashboardFragment()
                R.id.nav_jadwal -> JadwalFragment()
                R.id.nav_kalender -> KalenderFragment()
                R.id.nav_notifikasi -> NotifikasiFragment()
                R.id.nav_profil -> ProfilFragment()
                else -> DashboardFragment()
            }
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, fragment)
                .commit()
            true
        }

        if (savedInstanceState == null) {
            binding.bottomNav.selectedItemId = R.id.nav_dashboard
        }

        verifyMeSession()
    }

    override fun onStart() {
        super.onStart()
        startNotificationPolling()
    }

    override fun onStop() {
        pollingJob?.cancel()
        super.onStop()
    }

    fun selectTab(itemId: Int) {
        binding.bottomNav.selectedItemId = itemId
    }

    fun updateUnreadBadge(count: Int) {
        val badge = binding.bottomNav.getOrCreateBadge(R.id.nav_notifikasi)
        if (count > 0) {
            badge.isVisible = true
            badge.number = count
        } else {
            badge.isVisible = false
        }
    }

    fun redirectToLogin() {
        sessionManager.clearSession()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    private fun verifyMeSession() {
        lifecycleScope.launch {
            try {
                val res = ApiClient.create(sessionManager).me()
                if (res.code() == 401) {
                    redirectToLogin()
                    return@launch
                }
                res.body()?.data?.let { sessionManager.updateUser(it) }
            } catch (_: Exception) {
                // Tetap pertahankan sesi lokal jika offline sementara
            }
        }
    }

    private fun startNotificationPolling() {
        pollingJob?.cancel()
        pollingJob = lifecycleScope.launch {
            while (isActive) {
                try {
                    val res = ApiClient.create(sessionManager).getNotifikasi(limit = 20)
                    if (res.isSuccessful) {
                        val body = res.body()
                        val unreadCount = body?.unreadCount ?: 0
                        updateUnreadBadge(unreadCount)

                        val newest = body?.data?.firstOrNull { !it.isRead }
                        val lastNotifiedId = sessionManager.getLastNotifiedId()
                        if (newest != null && newest.id > lastNotifiedId) {
                            sessionManager.setLastNotifiedId(newest.id)
                            if (lastNotifiedId > 0) {
                                KsjpNotifier.showNotification(
                                    this@MainActivity,
                                    newest.id,
                                    newest.judul,
                                    newest.pesan,
                                )
                            }
                        }

                        val alert = body?.pengingatPergantianJam
                        if (alert?.pengingatAktif == true && !alert.pesanPengingat.isNullOrBlank()) {
                            KsjpNotifier.showNotification(
                                this@MainActivity,
                                99001,
                                "Pengingat Pergantian Jam",
                                alert.pesanPengingat,
                            )
                        }
                    }
                } catch (_: Exception) {
                    // Abaikan error sementara saat polling background
                }
                delay(30_000L)
            }
        }
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS,
            ) == PackageManager.PERMISSION_GRANTED
            if (!granted) {
                notifPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}
