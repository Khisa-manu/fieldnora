package com.fieldnora.technician.data.api

import android.content.Context
import android.content.SharedPreferences
import com.fieldnora.technician.data.model.JobPriority
import com.fieldnora.technician.data.model.JobStatus
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializer
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private const val PREFS_NAME = "fieldnora_prefs"
    private const val KEY_BASE_URL = "base_url"

    // Hardcoded production base URL
    const val PRODUCTION_BASE_URL: String = "https://fieldnora-production.up.railway.app/"

    var baseUrl: String = PRODUCTION_BASE_URL
        private set

    private var _apiService: FieldNoraApiService? = null

    private val gson = GsonBuilder()
        .registerTypeAdapter(JobStatus::class.java, JsonDeserializer { json, _, _ ->
            JobStatus.fromValue(json?.asString)
        })
        .registerTypeAdapter(JobPriority::class.java, JsonDeserializer { json, _, _ ->
            JobPriority.fromValue(json?.asString)
        })
        .create()

    private val authHeaderInterceptor = Interceptor { chain ->
        val original = chain.request()
        val requestBuilder = original.newBuilder()
            .header("x-org-id", "org-nairobi-prime-01")
            .header("x-user-name", "Brian Kiprop")
            .header("Accept", "application/json")
            .method(original.method, original.body)
        chain.proceed(requestBuilder.build())
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authHeaderInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()

    val apiService: FieldNoraApiService
        get() {
            if (_apiService == null) {
                _apiService = buildService(baseUrl)
            }
            return _apiService!!
        }

    fun cleanUrl(rawUrl: String): String {
        var trimmed = rawUrl.trim()
        if (trimmed.isEmpty()) return PRODUCTION_BASE_URL
        // Fix typo: uip.railway.app -> up.railway.app
        if (trimmed.contains("uip.railway.app")) {
            trimmed = trimmed.replace("uip.railway.app", "up.railway.app")
        }
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "https://$trimmed"
        }
        return if (trimmed.endsWith("/")) trimmed else "$trimmed/"
    }

    private fun buildService(url: String): FieldNoraApiService {
        val sanitized = cleanUrl(url)
        return Retrofit.Builder()
            .baseUrl(sanitized)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(FieldNoraApiService::class.java)
    }

    fun init(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedUrl = prefs.getString(KEY_BASE_URL, null)
        if (!savedUrl.isNullOrBlank() && !savedUrl.contains("10.0.2.2") && !savedUrl.contains("uip.railway.app")) {
            rebuildWithBaseUrl(savedUrl, context)
        } else {
            rebuildWithBaseUrl(PRODUCTION_BASE_URL, context)
        }
    }

    fun rebuildWithBaseUrl(newUrl: String, context: Context? = null): FieldNoraApiService {
        val sanitized = cleanUrl(newUrl)
        return try {
            val newService = buildService(sanitized)
            baseUrl = sanitized
            _apiService = newService

            context?.let {
                val prefs = it.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                prefs.edit().putString(KEY_BASE_URL, sanitized).apply()
            }
            newService
        } catch (e: Exception) {
            val fallback = buildService(PRODUCTION_BASE_URL)
            baseUrl = PRODUCTION_BASE_URL
            _apiService = fallback
            context?.let {
                val prefs = it.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                prefs.edit().putString(KEY_BASE_URL, PRODUCTION_BASE_URL).apply()
            }
            fallback
        }
    }
}
