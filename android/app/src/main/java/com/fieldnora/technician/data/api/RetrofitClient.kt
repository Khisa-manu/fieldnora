package com.fieldnora.technician.data.api

import android.content.Context
import android.content.SharedPreferences
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

    private fun buildService(url: String): FieldNoraApiService {
        val sanitized = if (url.endsWith("/")) url else "$url/"
        return Retrofit.Builder()
            .baseUrl(sanitized)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FieldNoraApiService::class.java)
    }

    fun init(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedUrl = prefs.getString(KEY_BASE_URL, null)
        if (!savedUrl.isNullOrBlank() && !savedUrl.contains("10.0.2.2")) {
            rebuildWithBaseUrl(savedUrl, context)
        } else {
            rebuildWithBaseUrl(PRODUCTION_BASE_URL, context)
        }
    }

    fun rebuildWithBaseUrl(newUrl: String, context: Context? = null): FieldNoraApiService {
        val sanitized = if (newUrl.endsWith("/")) newUrl.trim() else "${newUrl.trim()}/"
        baseUrl = sanitized
        val newService = buildService(sanitized)
        _apiService = newService

        context?.let {
            val prefs = it.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(KEY_BASE_URL, sanitized).apply()
        }

        return newService
    }
}
