package com.fieldnora.technician.data.api

import com.fieldnora.technician.data.model.InventoryItem
import com.fieldnora.technician.data.model.Job
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
