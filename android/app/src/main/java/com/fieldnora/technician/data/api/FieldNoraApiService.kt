package com.fieldnora.technician.data.api

import com.fieldnora.technician.data.model.InventoryItem
import com.fieldnora.technician.data.model.Job
import com.fieldnora.technician.data.model.LoginRequest
import com.fieldnora.technician.data.model.RegisterRequest
import com.fieldnora.technician.data.model.LoginResponse
import com.fieldnora.technician.data.model.ForgotPasswordRequest
import com.fieldnora.technician.data.model.ForgotPasswordResponse
import com.fieldnora.technician.data.model.ResetPasswordRequest
import com.fieldnora.technician.data.model.ResetPasswordResponse
import retrofit2.Response
import retrofit2.http.*

data class UpdateStatusRequest(
    val status: String,
    val notes: String? = null
)

data class SubmitSignatureRequest(
    val signedBy: String,
    val signatureBase64: String,
    val notes: String? = null
)

interface FieldNoraApiService {
    @POST("api/auth/login")
    suspend fun login(
        @Body request: LoginRequest,
        @Header("x-org-id") orgId: String = "org-nairobi-prime-01"
    ): Response<LoginResponse>

    @POST("api/auth/register")
    suspend fun register(
        @Body request: RegisterRequest,
        @Header("x-org-id") orgId: String = "org-nairobi-prime-01"
    ): Response<LoginResponse>

    @POST("api/auth/forgot-password")
    suspend fun requestPasswordReset(
        @Body request: ForgotPasswordRequest,
        @Header("x-org-id") orgId: String = "org-nairobi-prime-01"
    ): Response<ForgotPasswordResponse>

    @POST("api/auth/reset-password")
    suspend fun resetPassword(
        @Body request: ResetPasswordRequest,
        @Header("x-org-id") orgId: String = "org-nairobi-prime-01"
    ): Response<ResetPasswordResponse>

    @POST("api/auth/logout")
    suspend fun logout(): Response<Map<String, Any>>

    @GET("api/jobs")
    suspend fun getAssignedJobs(
        @Header("x-org-id") orgId: String = "org-nairobi-prime-01",
        @Query("technicianId") technicianId: String? = null
    ): Response<List<Job>>

    @GET("api/jobs/{id}")
    suspend fun getJobDetails(
        @Path("id") jobId: String,
        @Header("x-org-id") orgId: String = "org-nairobi-prime-01"
    ): Response<Job>

    @PATCH("api/jobs/{id}/status")
    suspend fun updateJobStatus(
        @Path("id") jobId: String,
        @Body request: UpdateStatusRequest,
        @Header("x-org-id") orgId: String = "org-nairobi-prime-01"
    ): Response<Job>

    @POST("api/jobs/{id}/signature")
    suspend fun submitCustomerSignature(
        @Path("id") jobId: String,
        @Body request: SubmitSignatureRequest,
        @Header("x-org-id") orgId: String = "org-nairobi-prime-01"
    ): Response<Job>

    @GET("api/inventory")
    suspend fun getVanInventory(
        @Header("x-org-id") orgId: String = "org-nairobi-prime-01"
    ): Response<List<InventoryItem>>
}
