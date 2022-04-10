@file:Suppress("MemberVisibilityCanBePrivate")

package ru.svyat.ovf.dto

import android.util.Base64

data class VpnInfo(private val line: String) {
    val name: String
    val ip: String
    val score: Int?
    val ping: Int?
    val speed: Long?
    val countryName: String
    val countryCode: String
    val sessionsCount: Long?
    val uptime: Long?
    val usersCount: Long?
    val totalTraffic: Long?
    val logLevel: String
    val operator: String
    val message: String
    val config: String

    init {
        val values = line.split(",")
        name = values[0]
        ip = values[1]
        score = values[2].toIntOrNull()
        ping = values[3].toIntOrNull()
        speed = values[4].toLongOrNull()
        countryName = values[5]
        countryCode = values[6]
        sessionsCount = values[7].toLongOrNull()
        uptime = values[8].toLongOrNull()
        usersCount = values[9].toLongOrNull()
        totalTraffic = values[10].toLongOrNull()
        logLevel = values[11]
        operator = values[12]
        message = values[13]
        config = String(Base64.decode(values[14], Base64.DEFAULT))
    }
}