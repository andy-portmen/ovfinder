package ru.svyat.ovf.ui

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import ru.svyat.ovf.R
import ru.svyat.ovf.dto.VpnInfo
import ru.svyat.ovf.services.saveConfig

class VpnRVAdapter(private val vpns: List<VpnInfo>) :
    RecyclerView.Adapter<VpnRVAdapter.VpnHolder>() {
    inner class VpnHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        init {
            itemView.setOnClickListener {
                saveConfig(vpns[adapterPosition].name, vpns[adapterPosition].config)
            }
        }

        private val ip: TextView = itemView.findViewById(R.id.txt_ip)
        private val speed: TextView = itemView.findViewById(R.id.txt_speed)
        private val ping: TextView = itemView.findViewById(R.id.txt_ping)
        private val countryCode: TextView = itemView.findViewById(R.id.txt_country_code)
        private val logLevel: TextView = itemView.findViewById(R.id.txt_log_level)

        fun bind(vpn: VpnInfo) {
            ip.text = vpn.ip
            countryCode.text = vpn.countryCode
            speed.text = vpn.speed?.let { "%.2fMB/s".format(it / (1024*1024F)) }?.toString() ?: "-"
            ping.text = vpn.ping?.toString() ?: "-"
            logLevel.text = vpn.logLevel
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VpnHolder =
        VpnHolder(
            LayoutInflater.from(parent.context)
                .inflate(R.layout.vpn_item, parent, false)
        )

    override fun onBindViewHolder(holder: VpnHolder, position: Int) {
        holder.bind(vpns[position])
    }

    override fun getItemCount(): Int = vpns.size
}