package com.smktelkom.ksjp.ui

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.smktelkom.ksjp.R
import com.smktelkom.ksjp.data.local.SessionManager
import com.smktelkom.ksjp.data.model.KalenderItemDto
import com.smktelkom.ksjp.data.remote.ApiClient
import com.smktelkom.ksjp.databinding.FragmentKalenderBinding
import com.smktelkom.ksjp.util.DateUtils
import kotlinx.coroutines.launch

class KalenderFragment : Fragment() {

    private var _binding: FragmentKalenderBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: KalenderAdapter

    private var allItems: List<KalenderItemDto> = emptyList()
    private var activeFilterId: Int = R.id.chipKalAll

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentKalenderBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        adapter = KalenderAdapter(::showAgendaDetail)

        binding.rvKalender.layoutManager = LinearLayoutManager(requireContext())
        binding.rvKalender.adapter = adapter

        binding.chipGroupKalenderFilter.setOnCheckedStateChangeListener { _, checkedIds ->
            activeFilterId = checkedIds.firstOrNull() ?: R.id.chipKalAll
            applyFilter()
        }

        binding.etKalenderSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = applyFilter()
            override fun afterTextChanged(s: Editable?) = Unit
        })

        binding.swipeKalender.setOnRefreshListener { loadKalender() }
        loadKalender()
    }

    private fun loadKalender() {
        binding.swipeKalender.isRefreshing = true
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = ApiClient.create(sessionManager).getKalender()
                if (res.code() == 401) {
                    (activity as? MainActivity)?.redirectToLogin()
                    return@launch
                }
                allItems = res.body()?.data.orEmpty()
                applyFilter()
            } catch (_: Exception) {
                binding.tvKalenderEmpty.visibility = View.VISIBLE
                binding.tvKalenderEmpty.text = "Gagal memuat kalender akademik."
            } finally {
                _binding?.swipeKalender?.isRefreshing = false
            }
        }
    }

    private fun applyFilter() {
        val q = binding.etKalenderSearch.text?.toString()?.trim()?.lowercase().orEmpty()
        val filtered = allItems.filter { item ->
            val matchChip = when (activeFilterId) {
                R.id.chipKalGanjil -> item.tanggalMulai.startsWith("2026-")
                R.id.chipKalGenap -> item.tanggalMulai.startsWith("2027-")
                R.id.chipKalOrg -> item.sumber == "organisasi"
                R.id.chipKalLibur -> item.isLibur
                else -> true
            }
            val matchQuery = if (q.isEmpty()) {
                true
            } else {
                item.judul.lowercase().contains(q) ||
                    (item.deskripsi?.lowercase()?.contains(q) == true) ||
                    (item.penyelenggara?.lowercase()?.contains(q) == true)
            }
            matchChip && matchQuery
        }

        adapter.submitList(filtered)
        binding.tvKalenderEmpty.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun showAgendaDetail(item: KalenderItemDto) {
        val message = buildString {
            appendLine("Tanggal: ${DateUtils.formatRange(item.tanggalMulai, item.tanggalSelesai)}")
            appendLine("Kategori: ${DateUtils.kategoriLabel(item.kategori, item.sumber)}")
            appendLine("Penyelenggara: ${item.penyelenggara ?: "SMK Telkom Purwokerto"}")
            appendLine("Target: ${item.targetKelas ?: "Semua Kelas"}")
            if (item.isLibur) appendLine("Status: Hari Libur (Tidak Ada KBM)")
            if (!item.deskripsi.isNullOrBlank()) {
                appendLine()
                appendLine(item.deskripsi)
            }
        }

        MaterialAlertDialogBuilder(requireContext())
            .setTitle(item.judul)
            .setMessage(message.trim())
            .setPositiveButton("Tutup", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
