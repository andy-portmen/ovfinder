package ru.svyat.ovf.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import ru.svyat.ovf.R
import ru.svyat.ovf.services.deleteConfig
import java.io.File

class FileRVAdapter(private val files: List<File>): RecyclerView.Adapter<FileRVAdapter.FileHolder>() {
    inner class FileHolder(itemView: View): RecyclerView.ViewHolder(itemView){
        init {
            itemView.setOnClickListener{
                Toast.makeText(itemView.context.applicationContext, "call connector app", Toast.LENGTH_LONG).show()
            }
            itemView.findViewById<Button>(R.id.btn_delete).setOnClickListener{
                deleteConfig(files[adapterPosition].absolutePath)
            }
        }
        val name: TextView = itemView.findViewById(R.id.txt_file_name)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FileHolder =
        FileHolder(LayoutInflater.from(parent.context)
            .inflate(R.layout.file_item, parent, false))

    override fun onBindViewHolder(holder: FileHolder, position: Int) {
        holder.name.text = files[position].name
    }

    override fun getItemCount(): Int = files.size
}