package com.fieldnora.technician

import android.app.Application
import com.fieldnora.technician.data.repository.JobRepository

class FieldNoraApplication : Application() {
    lateinit var jobRepository: JobRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        jobRepository = JobRepository(applicationContext)
    }

    companion object {
        lateinit var instance: FieldNoraApplication
            private set
    }
}
