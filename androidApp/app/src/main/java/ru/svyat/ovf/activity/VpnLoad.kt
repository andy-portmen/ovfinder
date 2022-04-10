package ru.svyat.ovf.activity

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import ru.svyat.ovf.R
import ru.svyat.ovf.services.loadVpns
import ru.svyat.ovf.ui.VpnRVAdapter

class VpnLoad: AppCompatActivity(R.layout.vpns) {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val vpns = loadVpns()
        with(findViewById<RecyclerView>(R.id.vpn_list)){
            adapter = VpnRVAdapter(vpns)
            layoutManager = LinearLayoutManager(this@VpnLoad)
        }
    }
}