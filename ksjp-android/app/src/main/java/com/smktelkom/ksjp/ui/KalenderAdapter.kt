package com.smktelkom.ksjp.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.smktelkom.ksjp.R
import com.smktelkom.ksjp.data.model.KalenderItemDto
import com.smktelkom.ksjp.databinding.ItemKalenderAgendaBinding
import com.smktelkom.ksjp.util.DateUtils

class KalenderAdapter(
    private val onClickItem: (KalenderItemDto) -> Unit,
) : RecyclerView.Adapter<KalenderAdapter.AgendaViewHolder>() {

    private val items = mutableListOf<KalenderItemDto>()

    fun submitList(list: List<KalenderItemDto>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AgendaViewHolder {
        val binding = ItemKalenderAgendaBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false,
        )
        return AgendaViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AgendaViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class AgendaViewHolder(
        private val binding: ItemKalenderAgendaBinding,
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: KalenderItemDto) {
            val ctx = binding.root.context
            binding.tvKalKategori.text = DateUtils.kategoriLabel(item.kategori, item.sumber)
            binding.tvKalPenyelenggara.text = item.penyelenggara ?: "SMK Telkom Purwokerto"
            binding.tvKalJudul.text = item.judul
            binding.tvKalTanggal.text = DateUtils.formatRange(item.tanggalMulai, item.tanggalSelesai)
            binding.tvKalTarget.text = "Target: ${item.targetKelas ?: "Semua Kelas"}"

            when {
                item.isLibur -> {
                    binding.tvKalKategori.setBackgroundColor(ContextCompat.getColor(ctx, R.color.telkom_red))
                    binding.tvKalKategori.setTextColor(ContextCompat.getColor(ctx, R.color.surface_white))
                }
                item.sumber == "organisasi" -> {
                    binding.tvKalKategori.setBackgroundColor(ContextCompat.getColor(ctx, R.color.amber_bg))
                    binding.tvKalKategori.setTextColor(ContextCompat.getColor(ctx, R.color.amber_text))
                }
                else -> {
                    binding.tvKalKategori.setBackgroundColor(ContextCompat.getColor(ctx, R.color.blue_bg))
                    binding.tvKalKategori.setTextColor(ContextCompat.getColor(ctx, R.color.blue_text))
                }
            }

            binding.root.setOnClickListener { onClickItem(item) }
        }
    }
}
