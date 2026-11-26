package com.smktelkom.ksjp.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.smktelkom.ksjp.data.local.SessionManager
import com.smktelkom.ksjp.data.remote.ApiClient
import com.smktelkom.ksjp.databinding.FragmentProfilBinding
import com.smktelkom.ksjp.util.DateUtils
import kotlinx.coroutines.launch

class ProfilFragment : Fragment() {

    private var _binding: FragmentProfilBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentProfilBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        val user = sessionManager.getUser()
        if (user != null) {
            binding.tvProfilName.text = user.namaLengkap
            binding.tvProfilSubtitle.text =
                "${user.kelas?.namaKelas ?: DateUtils.roleLabel(user.role)} • NIS ${user.nis ?: "-"}"

            binding.tvProfilDetails.text = buildString {
                appendLine("Nama Lengkap : ${user.namaLengkap}")
                appendLine("NIS / Kode   : ${user.nis ?: "-"}")
                appendLine("Username     : ${user.username}")
                appendLine("Peran RBAC   : ${DateUtils.roleLabel(user.role)}")
                appendLine("Jenis Kelamin: ${user.jenisKelamin ?: "-"}")
                user.kelas?.let {
                    appendLine("Kelas        : ${it.namaKelas} (${it.tahunAjaran})")
                    appendLine("Konsentrasi  : ${it.konsentrasi}")
                    appendLine("Wali Kelas   : ${it.waliKelas}")
                }
            }.trim()
        }

        binding.etProfilBaseUrl.setText(sessionManager.getBaseUrl())

        binding.btnSaveUrl.setOnClickListener {
            val newUrl = binding.etProfilBaseUrl.text?.toString()?.trim().orEmpty()
            if (newUrl.isNotEmpty()) {
                sessionManager.setBaseUrl(newUrl)
                Toast.makeText(
                    requireContext(),
                    "Alamat server disimpan: ${sessionManager.getBaseUrl()}",
                    Toast.LENGTH_SHORT,
                ).show()
            }
        }

        binding.btnLogout.setOnClickListener { performLogout() }
    }

    private fun performLogout() {
        binding.btnLogout.isEnabled = false
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                ApiClient.create(sessionManager).logout()
            } catch (_: Exception) {
                // Tetap hapus sesi lokal meski offline
            } finally {
                (activity as? MainActivity)?.redirectToLogin()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
