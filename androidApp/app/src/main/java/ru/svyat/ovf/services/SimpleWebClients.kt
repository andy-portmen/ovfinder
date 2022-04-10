package ru.svyat.ovf.services

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import ru.svyat.ovf.dto.VpnInfo
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.*
import java.util.concurrent.atomic.AtomicInteger

const val URL = "http://www.vpngate.net/api/iphone/"

fun loadVpns() = runBlocking(Dispatchers.IO) {
    val start = Date()
    val url = URL(URL)
    Log.i("INTERNET", "$start start loading vpns from $URL")
    (url.openConnection() as HttpURLConnection).run {
        requestMethod = "GET"
        doOutput = true
        connectTimeout = 10000
        val result = mutableListOf<VpnInfo>()
        val counter = AtomicInteger()
        inputStream.use {
            InputStreamReader(it).forEachLine { line ->
                if (counter.getAndIncrement() > 2 &&
                    line != "*"
                )
                    result.add(VpnInfo(line))
            }
        }
        Log.i("INTERNET", "downloaded in ${(Date().time - start.time)} seconds")
        return@runBlocking result
    }
}