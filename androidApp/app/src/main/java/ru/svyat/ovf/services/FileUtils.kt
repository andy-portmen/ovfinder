package ru.svyat.ovf.services

import android.os.Build.VERSION.SDK_INT
import android.os.Build.VERSION_CODES.KITKAT
import android.os.Environment.*
import android.util.Log
import java.io.File
import java.io.FileWriter
import java.util.concurrent.atomic.AtomicInteger

const val EXTENSION = ".ovpn"
const val DIR_NAME = "/OVFinder"

val FILES_STORAGE =
    if (SDK_INT >= KITKAT) "${getExternalStoragePublicDirectory(DIRECTORY_DOCUMENTS).absolutePath}$DIR_NAME"
    else "${getExternalStorageDirectory().absolutePath}/Download/$DIR_NAME"

fun getSavedConfigs(): List<File> = File(FILES_STORAGE).listFiles()?.asList() ?: emptyList()
fun saveConfig(name: String, content: String) = createFile(name, content)
fun deleteConfig(absPath: String){
    val file = File(absPath)
    file.delete()
}

private fun createFile(fileName: String, content: String): File {
    createBaseDir()
    var configFile = File("$FILES_STORAGE/$fileName$EXTENSION")
    val counter = AtomicInteger()
    while (configFile.exists()) {
        configFile = File("$FILES_STORAGE/$fileName-${counter.incrementAndGet()}$EXTENSION")
        Log.w("FILE", "${configFile.absolutePath} already exist, new file is")
    }
    configFile.createNewFile()
    FileWriter(configFile).use { it.write(content) }
    Log.i("FILE", configFile.absolutePath)
    return configFile
}
private fun createBaseDir() {
    val dir = File(FILES_STORAGE)
    if (!dir.exists()) {
        dir.mkdirs()
        Log.i("FILE", "Created $FILES_STORAGE")
    }
}