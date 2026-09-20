package com.fieldnora.technician.data.repository

import android.content.Context
import com.fieldnora.technician.data.api.RetrofitClient
import com.fieldnora.technician.data.api.SubmitSignatureRequest
import com.fieldnora.technician.data.api.UpdateStatusRequest
import com.fieldnora.technician.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

class JobRepository(private val context: Context) {
    private val _jobs = MutableStateFlow<List<Job>>(emptyList())
    val jobs: StateFlow<List<Job>> = _jobs.asStateFlow()

    private val _inventory = MutableStateFlow<List<InventoryItem>>(emptyList())
    val inventory: StateFlow<List<InventoryItem>> = _inventory.asStateFlow()

    private val _syncMessage = MutableStateFlow<String?>("Local database ready (Offline mode supported)")
    val syncMessage: StateFlow<String?> = _syncMessage.asStateFlow()

    init {
        loadInitialData()
    }

    private fun loadInitialData() {
        val sampleCustomers = listOf(
            Customer(
                id = "cust-1",
                name = "Safaricom Annex HQ",
                companyName = "Safaricom PLC",
                phone = "+254 722 000 123",
                email = "facilities@safaricom.co.ke",
                address = "Waiyaki Way, Westlands, Nairobi",
                county = "Nairobi",
                latitude = -1.2635,
                longitude = 36.8028
            ),
            Customer(
                id = "cust-2",
                name = "Karen Green Estate",
                companyName = "Karen Green Estate Management",
                phone = "+254 733 456 789",
                email = "caretaker@karengreen.co.ke",
                address = "Mbagathi Ridge, Karen, Nairobi",
                county = "Nairobi",
                latitude = -1.3197,
                longitude = 36.7065
            ),
            Customer(
                id = "cust-3",
                name = "Eldoret Medical Suites",
                companyName = "Rift Healthcare Consortium",
                phone = "+254 711 234 567",
                email = "ops@eldoretmedical.com",
                address = "Uganda Road, Eldoret CBD",
                county = "Uasin Gishu",
                latitude = 0.5143,
                longitude = 35.2698
            )
        )

        _jobs.value = listOf(
            Job(
                id = "job-101",
                jobNumber = "WO-2026-089",
                title = "Commercial HVAC Airflow Diagnostic",
                description = "VRF unit in 4th floor server room throwing error code E3. Refrigerant pressure check & filter sanitization.",
                trade = "HVAC & Cold Room",
                status = JobStatus.IN_PROGRESS,
                priority = JobPriority.HIGH,
                customerId = "cust-1",
                customer = sampleCustomers[0],
                scheduledDate = "2026-09-20",
                scheduledTime = "10:30 AM",
                estimatedDurationHours = 3.0,
                totalAmountKes = 11500.0,
                lineItems = listOf(
                    JobLineItem("li-1", "HVAC Diagnostic Labour (3 hrs)", 3.0, 2500.0, 7500.0),
                    JobLineItem("li-2", "R410A Refrigerant Top-up (1kg)", 1.0, 4000.0, 4000.0)
                )
            ),
            Job(
                id = "job-102",
                jobNumber = "WO-2026-090",
                title = "Borehole Submersible Pump Overhaul",
                description = "Measure static water depth, replace worn non-return foot valve, and megger motor windings.",
                trade = "Plumbing & Pumps",
                status = JobStatus.SCHEDULED,
                priority = JobPriority.MEDIUM,
                customerId = "cust-2",
                customer = sampleCustomers[1],
                scheduledDate = "2026-09-20",
                scheduledTime = "02:00 PM",
                estimatedDurationHours = 2.5,
                totalAmountKes = 8500.0,
                lineItems = listOf(
                    JobLineItem("li-3", "Pump Overhaul Labour", 2.5, 2000.0, 5000.0),
                    JobLineItem("li-4", "1-inch Brass Foot Valve", 1.0, 3500.0, 3500.0)
                )
            ),
            Job(
                id = "job-103",
                jobNumber = "WO-2026-091",
                title = "Main Power Distribution Board Breaker Trip",
                description = "Tripping on phase 2 during heavy X-ray autoclave load. Thermal scan & breaker replacement.",
                trade = "Electrical & Solar",
                status = JobStatus.SCHEDULED,
                priority = JobPriority.EMERGENCY,
                customerId = "cust-3",
                customer = sampleCustomers[2],
                scheduledDate = "2026-09-21",
                scheduledTime = "09:00 AM",
                estimatedDurationHours = 2.0,
                totalAmountKes = 14200.0,
                lineItems = listOf(
                    JobLineItem("li-5", "Emergency Diagnostics", 2.0, 3500.0, 7000.0),
                    JobLineItem("li-6", "Schneider 63A 3-Pole MCB", 1.0, 7200.0, 7200.0)
                )
            )
        )

        _inventory.value = listOf(
            InventoryItem("inv-1", "GAS-R410A", "R410A Refrigerant (1kg)", "HVAC", 3500.0, 24, "kg"),
            InventoryItem("inv-2", "ELEC-CB-32", "Schneider 32A 1-Pole MCB", "Electrical", 1200.0, 40, "pcs"),
            InventoryItem("inv-3", "PLUMB-PPR-25", "PPR Pipe PN20 25mm", "Plumbing", 850.0, 65, "lengths"),
            InventoryItem("inv-4", "SEC-IP-4MP", "Hikvision 4MP IP Dome Camera", "Security", 6500.0, 15, "pcs"),
            InventoryItem("inv-5", "SOLAR-INV-5KW", "Growatt 5kW Hybrid Inverter", "Solar", 98000.0, 3, "units"),
            InventoryItem("inv-6", "WATER-FLTR-10", "10-inch Sediment Filter Cartridge", "Water", 650.0, 50, "pcs")
        )
    }

    suspend fun refreshJobsFromNetwork() {
        try {
            val response = RetrofitClient.apiService.getAssignedJobs()
            if (response.isSuccessful && response.body() != null) {
                _jobs.value = response.body()!!
                _syncMessage.value = "Synced with Cloud Run at ${SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())}"
            } else {
                _syncMessage.value = "Using local cache (Server code: ${response.code()})"
            }
        } catch (e: Exception) {
            _syncMessage.value = "Offline mode active (Local changes saved)"
        }
    }

    suspend fun updateJobStatus(jobId: String, newStatus: JobStatus): Boolean {
        // Update local state immediately for instant feedback
        _jobs.value = _jobs.value.map { job ->
            if (job.id == jobId) {
                job.copy(status = newStatus, isOfflineModified = true)
            } else job
        }

        // Try syncing to API
        return try {
            val response = RetrofitClient.apiService.updateJobStatus(
                jobId,
                UpdateStatusRequest(status = newStatus.value)
            )
            if (response.isSuccessful) {
                _jobs.value = _jobs.value.map { job ->
                    if (job.id == jobId) job.copy(isOfflineModified = false) else job
                }
            }
            true
        } catch (e: Exception) {
            // Keep local offline state
            true
        }
    }

    suspend fun submitSignature(jobId: String, signerName: String, signatureBase64: String): Boolean {
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault()).format(Date())
        _jobs.value = _jobs.value.map { job ->
            if (job.id == jobId) {
                job.copy(
                    status = JobStatus.COMPLETED,
                    signedBy = signerName,
                    signedAt = now,
                    isOfflineModified = true
                )
            } else job
        }

        return try {
            val response = RetrofitClient.apiService.submitCustomerSignature(
                jobId,
                SubmitSignatureRequest(signedBy = signerName, signatureBase64 = signatureBase64)
            )
            if (response.isSuccessful) {
                _jobs.value = _jobs.value.map { job ->
                    if (job.id == jobId) job.copy(isOfflineModified = false) else job
                }
            }
            true
        } catch (e: Exception) {
            true
        }
    }
}
