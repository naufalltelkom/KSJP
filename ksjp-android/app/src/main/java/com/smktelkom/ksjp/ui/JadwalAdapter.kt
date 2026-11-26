package com.smktelkom.ksjp.ui

import android.graphics.Paint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.smktelkom.ksjp.R
import com.smktelkom.ksjp.data.model.JadwalSlotDto
import com.smktelkom.ksjp.databinding.ItemJadwalSlotBinding
import com.smktelkom.ksjp.util.DateUtils

class JadwalAdapter(
    private val onClickSlot: (JadwalSlotDto) -> Unit,
) : RecyclerView.Adapter<JadwalAdapter.SlotViewHolder>() {

    private val items = mutableListOf<JadwalSlotDto>()
    private var targetDateIso: String = DateUtils.todayIso()

    fun submitList(slots: List<JadwalSlotDto>, dateIso: String) {
        items.clear()
        items.addAll(slots)
        targetDateIso = dateIso
        notifyDataSetChanged()
    }

    fun refreshTimeBadges() {
        if (items.isNotEmpty()) {
            notifyDataSetChanged()
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SlotViewHolder {
        val binding = ItemJadwalSlotBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false,
        )
        return SlotViewHolder(binding)
    }

    override fun onBindViewHolder(holder: SlotViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class SlotViewHolder(
        private val binding: ItemJadwalSlotBinding,
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(slot: JadwalSlotDto) {
            val ctx = binding.root.context
            val live = DateUtils.computeLiveStatus(
                slot.jamMulai,
                slot.jamSelesai,
                slot.mataPelajaran,
                targetDateIso,
            )

            binding.tvSlotTime.text =
                "${DateUtils.shortTime(slot.jamMulai)} – ${DateUtils.shortTime(slot.jamSelesai)}"
            binding.tvJamKe.text = if (live.isLive && live.sisaMenit != null) {
                "Sisa ${live.sisaMenit} mnt"
            } else {
                "Jam ke-${slot.jamKe}"
            }
            binding.tvMapel.text = slot.mataPelajaran
            binding.tvGuru.text = if (slot.namaGuru == "-") "Waktu Istirahat" else slot.namaGuru
            binding.tvRoomPill.text = slot.ruangan

            binding.tvLiveStatusBadge.visibility = View.VISIBLE
            when {
                live.isLive -> {
                    binding.tvLiveStatusBadge.text = "SEDANG BERLANGSUNG"
                    binding.tvLiveStatusBadge.setBackgroundColor(
                        ContextCompat.getColor(ctx, R.color.emerald_text),
                    )
                    binding.tvLiveStatusBadge.setTextColor(
                        ContextCompat.getColor(ctx, R.color.surface_white),
                    )
                }
                live.status == "selesai" -> {
                    binding.tvLiveStatusBadge.text = "SELESAI"
                    binding.tvLiveStatusBadge.setBackgroundColor(
                        ContextCompat.getColor(ctx, R.color.surface_high),
                    )
                    binding.tvLiveStatusBadge.setTextColor(
                        ContextCompat.getColor(ctx, R.color.ink_secondary),
                    )
                }
                else -> {
                    binding.tvLiveStatusBadge.text = "AKAN DATANG"
                    binding.tvLiveStatusBadge.setBackgroundColor(
                        ContextCompat.getColor(ctx, R.color.blue_bg),
                    )
                    binding.tvLiveStatusBadge.setTextColor(
                        ContextCompat.getColor(ctx, R.color.blue_text),
                    )
                }
            }

            if (live.isLive) {
                binding.viewStripe.setBackgroundColor(
                    ContextCompat.getColor(ctx, R.color.emerald_text),
                )
                binding.tvSlotTime.setBackgroundColor(
                    ContextCompat.getColor(ctx, R.color.emerald_bg),
                )
                binding.tvSlotTime.setTextColor(
                    ContextCompat.getColor(ctx, R.color.emerald_text),
                )
            } else if (slot.isMomentum) {
                binding.viewStripe.setBackgroundColor(
                    ContextCompat.getColor(ctx, R.color.telkom_red),
                )
                binding.tvSlotTime.setBackgroundColor(
                    ContextCompat.getColor(ctx, R.color.telkom_red_soft),
                )
                binding.tvSlotTime.setTextColor(
                    ContextCompat.getColor(ctx, R.color.telkom_red_on_soft),
                )
            } else {
                binding.viewStripe.setBackgroundColor(
                    ContextCompat.getColor(ctx, R.color.surface_high),
                )
                binding.tvSlotTime.setBackgroundColor(
                    ContextCompat.getColor(ctx, R.color.surface_container),
                )
                binding.tvSlotTime.setTextColor(
                    ContextCompat.getColor(ctx, R.color.ink_primary),
                )
            }

            if (slot.isMomentum) {
                binding.tvMomentumBadge.visibility = View.VISIBLE
                binding.tvMomentumBadge.text =
                    "MOMENTUM • ${DateUtils.momentumLabel(slot.statusPerubahan).uppercase()}"

                val asli = slot.jadwalRegulerAsli
                if (asli != null) {
                    binding.tvOriginalBaseline.visibility = View.VISIBLE
                    binding.tvOriginalBaseline.paintFlags =
                        binding.tvOriginalBaseline.paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
                    binding.tvOriginalBaseline.text =
                        "Sebelumnya: ${asli.mataPelajaran} • ${asli.ruangan} (${asli.namaGuru})"
                } else {
                    binding.tvOriginalBaseline.visibility = View.GONE
                }

                if (!slot.keterangan.isNullOrBlank()) {
                    binding.tvKeterangan.visibility = View.VISIBLE
                    binding.tvKeterangan.text = slot.keterangan
                } else {
                    binding.tvKeterangan.visibility = View.GONE
                }
            } else {
                binding.tvMomentumBadge.visibility = View.GONE
                binding.tvOriginalBaseline.visibility = View.GONE
                binding.tvKeterangan.visibility = View.GONE
            }

            binding.root.setOnClickListener { onClickSlot(slot) }
        }
    }
}
