package com.fieldnora.technician.data.auth

import android.content.Context
import android.content.SharedPreferences
import com.fieldnora.technician.data.model.OrganizationInfo
import com.fieldnora.technician.data.model.TechnicianProfile
import com.fieldnora.technician.data.model.UserInfo
import com.google.gson.Gson

class SessionManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    companion object {
        private const val PREF_NAME = "fieldnora_technician_session"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_TECH_PROFILE = "tech_profile"
        private const val KEY_USER_INFO = "user_info"
        private const val KEY_ORG_INFO = "org_info"
        private const val KEY_LAST_LOGIN_TIME = "last_login_time"

        val DEMO_TECHNICIANS = listOf(
            TechnicianProfile(
                id = "tech-01",
                userId = "usr-tech-01",
                name = "Brian Kiprop",
                phone = "+254 711 450 780",
                email = "brian@fieldnora.co.ke",
                specialization = "HVAC & Commercial Air Conditioning",
                vehicleReg = "KDG 441X",
                activeStatus = "on_job",
                rating = 4.9,
                skills = listOf("Split AC servicing", "Chiller overhaul", "Gas refill R410A", "Ductwork")
            ),
            TechnicianProfile(
                id = "tech-02",
                userId = "usr-tech-02",
                name = "Dennis Mutua",
                phone = "+254 724 670 890",
                email = "dennis@fieldnora.co.ke",
                specialization = "Licensed Master Electrician & Solar",
                vehicleReg = "KDA 789M",
                activeStatus = "en_route",
                rating = 4.8,
                skills = listOf("3-Phase Distribution", "Solar Inverters", "Circuit Troubleshooting", "Surge Protection")
            ),
            TechnicianProfile(
                id = "tech-03",
                userId = "usr-tech-03",
                name = "Samuel Chege",
                phone = "+254 735 889 123",
                email = "samuel@fieldnora.co.ke",
                specialization = "Senior Plumbing & Drainage Engineer",
                vehicleReg = "KCX 230P",
                activeStatus = "available",
                rating = 5.0,
                skills = listOf("High Pressure Jetting", "Water Booster Pumps", "PPR Pipe Fusion", "Leak Detection")
            )
        )
    }

    var isLoggedIn: Boolean
        get() = prefs.getBoolean(KEY_IS_LOGGED_IN, false)
        private set(value) = prefs.edit().putBoolean(KEY_IS_LOGGED_IN, value).apply()

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getTechnician(): TechnicianProfile {
        val json = prefs.getString(KEY_TECH_PROFILE, null)
        return if (!json.isNullOrBlank()) {
            try {
                gson.fromJson(json, TechnicianProfile::class.java)
            } catch (_: Exception) {
                DEMO_TECHNICIANS.first()
            }
        } else {
            DEMO_TECHNICIANS.first()
        }
    }

    fun getUser(): UserInfo? {
        val json = prefs.getString(KEY_USER_INFO, null) ?: return null
        return try {
            gson.fromJson(json, UserInfo::class.java)
        } catch (_: Exception) {
            null
        }
    }

    fun getOrganization(): OrganizationInfo {
        val json = prefs.getString(KEY_ORG_INFO, null)
        return if (!json.isNullOrBlank()) {
            try {
                gson.fromJson(json, OrganizationInfo::class.java)
            } catch (_: Exception) {
                OrganizationInfo()
            }
        } else {
            OrganizationInfo()
        }
    }

    fun saveSession(
        token: String,
        technician: TechnicianProfile,
        user: UserInfo? = null,
        organization: OrganizationInfo? = null
    ) {
        val editor = prefs.edit()
        editor.putBoolean(KEY_IS_LOGGED_IN, true)
        editor.putString(KEY_TOKEN, token)
        editor.putString(KEY_TECH_PROFILE, gson.toJson(technician))
        if (user != null) {
            editor.putString(KEY_USER_INFO, gson.toJson(user))
        }
        if (organization != null) {
            editor.putString(KEY_ORG_INFO, gson.toJson(organization))
        }
        editor.putLong(KEY_LAST_LOGIN_TIME, System.currentTimeMillis())
        editor.apply()
    }

    fun clearSession() {
        prefs.edit()
            .putBoolean(KEY_IS_LOGGED_IN, false)
            .remove(KEY_TOKEN)
            .remove(KEY_USER_INFO)
            .apply()
    }
}
