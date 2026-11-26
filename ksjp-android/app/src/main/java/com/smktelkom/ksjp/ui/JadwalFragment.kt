package com.smktelkom.ksjp.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.smktelkom.ksjp.R
import com.smktelkom.ksjp.data.local.SessionManager
import com.smktelkom.ksjp.data.model.JadwalSlotDto
import com.smktelkom.ksjp.data.remote.ApiClient
import com.smktelkom.ksjp.databinding.FragmentJadwalBinding
import com.smktelkom.ksjp.util.DateUtils
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class JadwalFragment : Fragment() {

    private var _binding: FragmentJadwalBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: JadwalAdapter

    private var selectedDate: String = DateUtils.todayIso()
    private var allSlots: List<JadwalSlotDto> = emptyList()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentJadwalBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        adapter = JadwalAdapter(::showSlotDetail)

        binding.rvJadwal.layoutManager = LinearLayoutManager(requireContext())
        binding.rvJadwal.adapter = adapter

        binding.chipGroupDays.setOnCheckedStateChangeListener { _, checkedIds ->
            val checkedId = checkedIds.firstOrNull() ?: return@setOnCheckedStateChangeListener
            selectedDate = when (checkedId) {
                R.id.chipToday -> DateUtils.todayIso()
                R.id.chipSenin -> DateUtils.weekdayDateIso(0)
                R.id.chipSelasa -> DateUtils.weekdayDateIso(1)
                R.id.chipRabu -> DateUtils.weekdayDateIso(2)
                R.id.chipKamis -> DateUtils.weekdayDateIso(3)
                R.id.chipJumat -> DateUtils.weekdayDateIso(4)
                else -> DateUtils.todayIso()
            }
            loadJadwal()
        }

        binding.cbOnlyMomentum.setOnCheckedChangeListener { _, _ -> applyFilter() }
        binding.swipeJadwal.setOnRefreshListener { loadJadwal() }

        viewLifecycleOwner.lifecycleScope.launch {
            while (isActive) {
                delay(10_000L)
                adapter.refreshTimeBadges()
            }
        }

        loadJadwal()
    }

    private fun loadJadwal() {
        binding.swipeJadwal.isRefreshing = true
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = ApiClient.create(sessionManager).getJadwal(tanggal = selectedDate, mode = "harian")
                if (res.code() == 401) {
                    (activity as? MainActivity)?.redirectToLogin()
                    return@launch
                }
                val body = res.body()
                val harian = body?.data
                binding.tvJadwalHeaderDate.text =
                    "${harian?.hari ?: ""}, ${DateUtils.formatIndoDate(harian?.tanggal ?: selectedDate)}"
                binding.tvJadwalHeaderClass.text = body?.kelas?.let {
                    "${it.namaKelas} • Wali Kelas: ${it.waliKelas}"
                } ?: ""

                allSlots = harian?.jadwal.orEmpty()
                applyFilter()
            } catch (_: Exception) {
                binding.tvJadwalEmpty.visibility = View.VISIBLE
                binding.tvJadwalEmpty.text = "Gagal memuat jadwal dari server."
            } finally {
                _binding?.swipeJadwal?.isRefreshing = false
            }
        }
    }

    private fun applyFilter() {
        val onlyMomentum = binding.cbOnlyMomentum.isChecked
        val filtered = if (onlyMomentum) allSlots.filter { it.isMomentum } else allSlots
        adapter.submitList(filtered, selectedDate)
        binding.tvJadwalEmpty.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun showSlotDetail(slot: JadwalSlotDto) {
        val lines = buildString {
            appendLine("Waktu: ${DateUtils.shortTime(slot.jamMulai)} – ${DateUtils.shortTime(slot.jamSelesai)} WIB")
            appendLine("Guru: ${slot.namaGuru}")
            appendLine("Ruangan: ${slot.ruangan}")
            if (slot.isMomentum) {
                appendLine()
                appendLine("Status: ${DateUtils.momentumLabel(slot.statusPerubahan)}")
                slot.keterangan?.let { appendLine("Keterangan: $it") }
                slot.jadwalRegulerAsli?.let {
                    appendLine("Jadwal Reguler Awal: ${it.mataPelajaran} (${it.ruangan})")
                }
            }
        }

        MaterialAlertDialogBuilder(requireContext())
            .setTitle(slot.mataPelajaran)
            .setMessage(lines.trim())
            .setPositiveButton("Tutup", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
