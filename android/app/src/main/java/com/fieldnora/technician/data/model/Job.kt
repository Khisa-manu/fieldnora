package com.fieldnora.technician.data.model

import com.google.gson.annotations.SerializedName

enum class JobStatus(val value: String, val displayName: String) {
    @SerializedName("scheduled") SCHEDULED("scheduled", "Scheduled"),
    @SerializedName("en_route") EN_ROUTE("en_route", "En Route"),
    @SerializedName("on_site") ON_SITE("on_site", "On Site"),
    @SerializedName("in_progress") IN_PROGRESS("in_progress", "In Progress"),
    @SerializedName("completed") COMPLETED("completed", "Completed"),
    @SerializedName("invoiced") INVOICED("invoiced", "Invoiced");

    companion object {
        fun fromValue(value: String): JobStatus {
            return entries.firstOrNull { it.value.equals(value, ignoreCase = true) } ?: SCHEDULED
        }
    }
}

enum class JobPriority(val label: String) {
    @SerializedName("low") LOW("Low"),
    @SerializedName("medium") MEDIUM("Medium"),
    @SerializedName("high") HIGH("High"),
    @SerializedName("emergency") EMERGENCY("Emergency")
}

data class JobLineItem(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("quantity") val quantity: Double,
    @SerializedName("unitPriceKes") val unitPriceKes: Double,
    @SerializedName("totalKes") val totalKes: Double
)

data class Job(
    @SerializedName("id") val id: String,
    @SerializedName("jobNumber") val jobNumber: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("trade") val trade: String,
    @SerializedName("status") val status: JobStatus = JobStatus.SCHEDULED,
    @SerializedName("priority") val priority: JobPriority = JobPriority.MEDIUM,
    @SerializedName("customerId") val customerId: String,
    @SerializedName("customer") val customer: Customer,
    @SerializedName("scheduledDate") val scheduledDate: String,
    @SerializedName("scheduledTime") val scheduledTime: String,
    @SerializedName("estimatedDurationHours") val estimatedDurationHours: Double = 2.0,
    @SerializedName("totalAmountKes") val totalAmountKes: Double = 0.0,
    @SerializedName("lineItems") val lineItems: List<JobLineItem> = emptyList(),
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("signedBy") val signedBy: String? = null,
    @SerializedName("signedAt") val signedAt: String? = null,
    @SerializedName("isOfflineModified") val isOfflineModified: Boolean = false
)
