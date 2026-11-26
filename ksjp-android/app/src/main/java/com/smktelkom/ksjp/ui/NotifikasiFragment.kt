package com.smktelkom.ksjp.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.smktelkom.ksjp.R
import com.smktelkom.ksjp.data.local.SessionManager
import com.smktelkom.ksjp.data.model.NotifikasiDto
import com.smktelkom.ksjp.data.remote.ApiClient
import com.smktelkom.ksjp.databinding.FragmentNotifikasiBinding
import kotlinx.coroutines.launch

class NotifikasiFragment : Fragment() {

    private var _binding: FragmentNotifikasiBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: NotifikasiAdapter

    private var allNotifs: List<NotifikasiDto> = emptyList()
    private var activeFilterId: Int = R.id.chipNotifAll

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentNotifikasiBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        adapter = NotifikasiAdapter(::markSingleRead)

        binding.rvNotif.layoutManager = LinearLayoutManager(requireContext())
        binding.rvNotif.adapter = adapter

        binding.chipGroupNotifFilter.setOnCheckedStateChangeListener { _, checkedIds ->
            activeFilterId = checkedIds.firstOrNull() ?: R.id.chipNotifAll
            applyFilter()
        }

        binding.btnMarkAllRead.setOnClickListener { markAllRead() }
        binding.swipeNotif.setOnRefreshListener { loadNotifikasi() }

        loadNotifikasi()
    }

    private fun loadNotifikasi() {
        binding.swipeNotif.isRefreshing = true
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = ApiClient.create(sessionManager).getNotifikasi(limit = 50)
                if (res.code() == 401) {
                    (activity as? MainActivity)?.redirectToLogin()
                    return@launch
                }
                val body = res.body()
                allNotifs = body?.data.orEmpty()
                (activity as? MainActivity)?.updateUnreadBadge(body?.unreadCount ?: 0)

                val pergantian = body?.pengingatPergantianJam
                if (pergantian?.pengingatAktif == true && !pergantian.pesanPengingat.isNullOrBlank()) {
                    binding.tvNotifPergantianBanner.visibility = View.VISIBLE
                    binding.tvNotifPergantianBanner.text = pergantian.pesanPengingat
                } else {
                    binding.tvNotifPergantianBanner.visibility = View.GONE
                }

                applyFilter()
            } catch (_: Exception) {
                binding.tvNotifEmpty.visibility = View.VISIBLE
                binding.tvNotifEmpty.text = "Gagal memuat notifikasi dari server."
            } finally {
                _binding?.swipeNotif?.isRefreshing = false
            }
        }
    }

    private fun applyFilter() {
        val filtered = allNotifs.filter { item ->
            when (activeFilterId) {
                R.id.chipNotifMomentum -> item.tipe == "momentum"
                R.id.chipNotifKalender -> item.tipe == "kalender"
                R.id.chipNotifUnread -> !item.isRead
                else -> true
            }
        }
        adapter.submitList(filtered)
        binding.tvNotifEmpty.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun markSingleRead(item: NotifikasiDto) {
        if (item.isRead) return
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                ApiClient.create(sessionManager).markNotifikasiRead(item.id)
                loadNotifikasi()
            } catch (_: Exception) {
            }
        }
    }

    private fun markAllRead() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                ApiClient.create(sessionManager).markAllNotifikasiRead()
                loadNotifikasi()
            } catch (_: Exception) {
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
