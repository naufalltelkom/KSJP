package com.smktelkom.ksjp.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.smktelkom.ksjp.R
import com.smktelkom.ksjp.data.local.SessionManager
import com.smktelkom.ksjp.data.model.JadwalHarianData
import com.smktelkom.ksjp.data.remote.ApiClient
import com.smktelkom.ksjp.databinding.FragmentDashboardBinding
import com.smktelkom.ksjp.util.DateUtils
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private var lastHarianData: JadwalHarianData? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        bindUserHeader()

        binding.cardShortcutJadwal.setOnClickListener {
            (activity as? MainActivity)?.selectTab(R.id.nav_jadwal)
        }
        binding.cardLiveSession.setOnClickListener {
            (activity as? MainActivity)?.selectTab(R.id.nav_jadwal)
        }
        binding.cardShortcutKalender.setOnClickListener {
            (activity as? MainActivity)?.selectTab(R.id.nav_kalender)
        }
        binding.cardShortcutNotif.setOnClickListener {
            (activity as? MainActivity)?.selectTab(R.id.nav_notifikasi)
        }
        binding.cardLatestNotif.setOnClickListener {
            (activity as? MainActivity)?.selectTab(R.id.nav_notifikasi)
        }

        binding.swipeRefresh.setOnRefreshListener { loadDashboard() }
        viewLifecycleOwner.lifecycleScope.launch {
            while (isActive) {
                delay(10_000L)
                lastHarianData?.let { renderLiveHighlight(it) }
            }
        }
        loadDashboard()
    }

    private fun bindUserHeader() {
        val user = sessionManager.getUser() ?: return
        binding.tvGreetingName.text = user.namaLengkap
        binding.tvClassPill.text = user.kelas?.namaKelas ?: DateUtils.roleLabel(user.role)
        binding.tvSchoolYearPill.text = user.kelas?.tahunAjaran ?: "T.A. 2026/2027"
        binding.tvWaliKelas.text = user.kelas?.waliKelas ?: "-"
        binding.tvKonsentrasi.text = user.kelas?.konsentrasi ?: DateUtils.roleLabel(user.role)
    }

    private fun loadDashboard() {
        binding.swipeRefresh.isRefreshing = true
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val api = ApiClient.create(sessionManager)
                val jadwalDef = async { api.getJadwal(mode = "harian") }
                val kalenderDef = async { api.getKalender() }
                val notifDef = async { api.getNotifikasi(limit = 10) }

                val jadwalRes = jadwalDef.await()
                val kalenderRes = kalenderDef.await()
                val notifRes = notifDef.await()

                if (jadwalRes.code() == 401) {
                    (activity as? MainActivity)?.redirectToLogin()
                    return@launch
                }

                val harian = jadwalRes.body()?.data
                lastHarianData = harian
                val slots = harian?.jadwal.orEmpty()
                val momentumTotal = slots.count { it.isMomentum }
                binding.tvMomentumCount.text = "$momentumTotal Perubahan"

                if (harian != null) {
                    renderLiveHighlight(harian)
                }

                val pergantian = harian?.pergantianJam

                if (pergantian?.pengingatAktif == true && !pergantian.pesanPengingat.isNullOrBlank()) {
                    binding.tvPergantianAlert.visibility = View.VISIBLE
                    binding.tvPergantianAlert.text = pergantian.pesanPengingat
                } else {
                    binding.tvPergantianAlert.visibility = View.GONE
                }

                val todayIso = harian?.tanggal ?: DateUtils.todayIso()
                val agendaList = kalenderRes.body()?.data.orEmpty()
                val nextAgenda = agendaList.firstOrNull { it.tanggalSelesai >= todayIso } ?: agendaList.firstOrNull()
                if (nextAgenda != null) {
                    binding.tvAgendaPreview.text = nextAgenda.judul
                    binding.tvAgendaDate.text =
                        "${DateUtils.formatRange(nextAgenda.tanggalMulai, nextAgenda.tanggalSelesai)} • ${nextAgenda.penyelenggara ?: "SMK Telkom"}"
                }

                val notifBody = notifRes.body()
                val unread = notifBody?.unreadCount ?: 0
                binding.tvUnreadCount.text = "$unread Baru"
                (activity as? MainActivity)?.updateUnreadBadge(unread)

                val latestNotif = notifBody?.data?.firstOrNull()
                if (latestNotif != null) {
                    binding.tvLatestNotifTitle.text = latestNotif.judul
                    binding.tvLatestNotifBody.text = latestNotif.pesan
                } else {
                    binding.tvLatestNotifTitle.text = "Belum ada notifikasi"
                    binding.tvLatestNotifBody.text = "-"
                }
            } catch (_: Exception) {
                binding.tvLiveSubject.text = "Gagal terhubung ke server API"
                binding.tvLiveMeta.text = sessionManager.getBaseUrl()
            } finally {
                _binding?.swipeRefresh?.isRefreshing = false
            }
        }
    }

    private fun renderLiveHighlight(harian: JadwalHarianData) {
        val slots = harian.jadwal
        val targetDate = harian.tanggal
        val withLive = slots.map { slot ->
            slot to DateUtils.computeLiveStatus(slot.jamMulai, slot.jamSelesai, slot.mataPelajaran, targetDate)
        }
        val activeEntry = withLive.firstOrNull { it.second.isLive }
        val nextEntry = withLive.firstOrNull { it.second.status == "akan_datang" && !it.second.isBreak }
            ?: withLive.firstOrNull { it.second.status == "akan_datang" }
        val chosen = activeEntry ?: nextEntry ?: withLive.firstOrNull()

        if (chosen != null) {
            val (highlight, live) = chosen
            binding.tvLiveBadge.text = when {
                live.isLive -> "SEDANG BERLANGSUNG"
                live.status == "akan_datang" -> "SESI BERIKUTNYA"
                else -> harian.hari.uppercase()
            }
            binding.tvLiveTime.text = if (live.isLive && live.sisaMenit != null) {
                "${DateUtils.shortTime(highlight.jamMulai)}–${DateUtils.shortTime(highlight.jamSelesai)} • Sisa ${live.sisaMenit} mnt"
            } else {
                "${DateUtils.shortTime(highlight.jamMulai)} – ${DateUtils.shortTime(highlight.jamSelesai)} WIB"
            }
            binding.tvLiveSubject.text = highlight.mataPelajaran
            binding.tvLiveMeta.text = if (highlight.namaGuru == "-") "Waktu Istirahat" else highlight.namaGuru
            binding.tvLiveRoomPill.text = highlight.ruangan
            binding.tvLiveMomentumTag.visibility = if (highlight.isMomentum) View.VISIBLE else View.GONE
            binding.tvLiveMomentumTag.text = DateUtils.momentumLabel(highlight.statusPerubahan)
        } else {
            binding.tvLiveBadge.text = harian.hari.uppercase()
            binding.tvLiveTime.text = DateUtils.formatIndoDate(targetDate)
            binding.tvLiveSubject.text = "Tidak ada jadwal pelajaran hari ini"
            binding.tvLiveMeta.text = if (harian.isLibur) "Hari libur akademik" else "-"
            binding.tvLiveRoomPill.text = "Santai"
            binding.tvLiveMomentumTag.visibility = View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
