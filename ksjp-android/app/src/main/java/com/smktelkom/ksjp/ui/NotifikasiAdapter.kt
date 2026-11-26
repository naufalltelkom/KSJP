package com.smktelkom.ksjp.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.smktelkom.ksjp.R
import com.smktelkom.ksjp.data.model.NotifikasiDto
import com.smktelkom.ksjp.databinding.ItemNotifikasiBinding

class NotifikasiAdapter(
    private val onClickNotif: (NotifikasiDto) -> Unit,
) : RecyclerView.Adapter<NotifikasiAdapter.NotifViewHolder>() {

    private val items = mutableListOf<NotifikasiDto>()

    fun submitList(list: List<NotifikasiDto>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotifViewHolder {
        val binding = ItemNotifikasiBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false,
        )
        return NotifViewHolder(binding)
    }

    override fun onBindViewHolder(holder: NotifViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class NotifViewHolder(
        private val binding: ItemNotifikasiBinding,
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: NotifikasiDto) {
            val ctx = binding.root.context
            binding.tvNotifType.text = item.tipe.uppercase()
            binding.tvNotifTitle.text = item.judul
            binding.tvNotifMessage.text = item.pesan
            binding.tvNotifTime.text = item.createdAt?.take(16)?.replace("T", " ") ?: ""
            binding.tvNotifUnreadDot.visibility = if (item.isRead) View.GONE else View.VISIBLE

            binding.root.strokeColor = ContextCompat.getColor(
                ctx,
                if (item.isRead) R.color.surface_high else R.color.telkom_red,
            )
            binding.root.alpha = if (item.isRead) 0.85f else 1.0f

            binding.root.setOnClickListener { onClickNotif(item) }
        }
    }
}
