package ru.svyat.ovf.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import ru.svyat.ovf.R
import ru.svyat.ovf.services.getSavedConfigs
import ru.svyat.ovf.ui.FileRVAdapter

class OVFinder : AppCompatActivity(R.layout.init){
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        with(findViewById<RecyclerView>(R.id.file_list)){
            adapter = FileRVAdapter(getSavedConfigs())
            layoutManager = LinearLayoutManager(this@OVFinder)
        }
        findViewById<FloatingActionButton>(R.id.btn_get_vpns).setOnClickListener{
            Log.i(null, "vpn updating gonna be started")
            startActivity(Intent(this, VpnLoad::class.java))
        }
    }
}