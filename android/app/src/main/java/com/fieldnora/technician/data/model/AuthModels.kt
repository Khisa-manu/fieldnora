package com.fieldnora.technician.data.model

import com.google.gson.annotations.SerializedName

data class TechnicianProfile(
    @SerializedName("id") val id: String = "tech-01",
    @SerializedName("orgId") val orgId: String = "org-nairobi-prime-01",
    @SerializedName("userId") val userId: String = "usr-tech-01",
    @SerializedName("name") val name: String = "Brian Kiprop",
    @SerializedName("phone") val phone: String = "+254 711 450 780",
    @SerializedName("email") val email: String = "brian@fieldnora.co.ke",
    @SerializedName("specialization") val specialization: String = "HVAC & Commercial Air Conditioning",
    @SerializedName("vehicleReg") val vehicleReg: String = "KDG 441X",
    @SerializedName("activeStatus") val activeStatus: String = "on_job",
    @SerializedName("rating") val rating: Double = 4.9,
    @SerializedName("skills") val skills: List<String> = emptyList()
)

data class UserInfo(
    @SerializedName("id") val id: String = "",
    @SerializedName("orgId") val orgId: String = "",
    @SerializedName("name") val name: String = "",
    @SerializedName("email") val email: String = "",
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("role") val role: String = "technician"
)

data class OrganizationInfo(
    @SerializedName("id") val id: String = "org-nairobi-prime-01",
    @SerializedName("name") val name: String = "Nairobi Prime Technical Services Ltd",
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("county") val county: String? = "Nairobi"
)

data class LoginRequest(
    @SerializedName("identifier") val identifier: String,
    @SerializedName("email") val email: String? = null,
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("password") val password: String = "password"
)

data class RegisterRequest(
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("specialization") val specialization: String? = "HVAC & Commercial Air Conditioning",
    @SerializedName("vehicleReg") val vehicleReg: String? = null,
    @SerializedName("password") val password: String = "password"
)

data class LoginResponse(
    @SerializedName("token") val token: String? = null,
    @SerializedName("user") val user: UserInfo? = null,
    @SerializedName("technician") val technician: TechnicianProfile? = null,
    @SerializedName("organization") val organization: OrganizationInfo? = null,
    @SerializedName("error") val error: String? = null
)

data class ForgotPasswordRequest(
    @SerializedName("identifier") val identifier: String
)

data class ForgotPasswordResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String = "",
    @SerializedName("otp") val otp: String? = null,
    @SerializedName("destination") val destination: String? = null,
    @SerializedName("error") val error: String? = null
)

data class ResetPasswordRequest(
    @SerializedName("identifier") val identifier: String,
    @SerializedName("code") val code: String,
    @SerializedName("newPassword") val newPassword: String
)

data class ResetPasswordResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String = "",
    @SerializedName("error") val error: String? = null
)
