package com.fieldnora.technician.ui.screens.jobdetail

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fieldnora.technician.data.model.Job
import com.fieldnora.technician.data.model.JobStatus
import com.fieldnora.technician.data.repository.JobRepository
import com.fieldnora.technician.ui.screens.jobs.StatusBadge
import com.fieldnora.technician.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobDetailScreen(
    jobId: String,
    repository: JobRepository,
    onNavigateBack: () -> Unit,
    onOpenSignature: (String) -> Unit
) {
    val jobs by repository.jobs.collectAsState()
    val job = remember(jobs, jobId) { jobs.firstOrNull { it.id == jobId } }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    if (job == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Work order not found")
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(job.jobNumber, fontWeight = FontWeight.Bold, color = Slate50) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Slate50)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Slate50)
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Main Overview Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = job.trade,
                            style = MaterialTheme.typography.labelSmall,
                            color = Slate500,
                            fontWeight = FontWeight.Bold
                        )
                        StatusBadge(status = job.status)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = job.title,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = job.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate700
                    )
                }
            }

            // Customer Contact & Native Intents Card (GPS, Call, WhatsApp)
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Customer & Location",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = job.safeCustomer.name,
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate900
                    )
                    Text(
                        text = job.safeCustomer.address,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Fast Action Buttons: Google Maps GPS, Phone Call, WhatsApp
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // GPS Intent
                        OutlinedButton(
                            onClick = {
                                try {
                                    val gmmIntentUri = Uri.parse("geo:${job.safeCustomer.latitude},${job.safeCustomer.longitude}?q=${Uri.encode(job.safeCustomer.address)}")
                                    val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
                                    context.startActivity(mapIntent)
                                } catch (e: Exception) {
                                    try {
                                        val webUri = Uri.parse("https://www.google.com/maps/search/?api=1&query=${Uri.encode(job.safeCustomer.address)}")
                                        context.startActivity(Intent(Intent.ACTION_VIEW, webUri))
                                    } catch (_: Exception) {}
                                }
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("GPS", fontSize = 12.sp)
                        }

                        // Call Intent
                        OutlinedButton(
                            onClick = {
                                try {
                                    val callIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${job.safeCustomer.phone}"))
                                    context.startActivity(callIntent)
                                } catch (_: Exception) {}
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Call", fontSize = 12.sp)
                        }

                        // WhatsApp Intent
                        Button(
                            onClick = {
                                try {
                                    val cleanPhone = job.safeCustomer.phone.replace("+", "").replace(" ", "").replace("-", "")
                                    val text = "Habari! This is Brian from fieldnora service. I am on my way for work order ${job.jobNumber}."
                                    val url = "https://api.whatsapp.com/send?phone=$cleanPhone&text=${Uri.encode(text)}"
                                    val waIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                    context.startActivity(waIntent)
                                } catch (_: Exception) {}
                            },
                            modifier = Modifier.weight(1.2f),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366))
                        ) {
                            Text("WhatsApp", fontSize = 12.sp, color = Color.White)
                        }
                    }
                }
            }

            // Line items breakdown
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Materials & Labour (KES)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    job.safeLineItems.forEach { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(item.name, style = MaterialTheme.typography.bodyMedium, color = Slate900)
                                Text("${item.quantity} x KES %,d".format(item.unitPriceKes.toLong()), style = MaterialTheme.typography.labelSmall, color = Slate500)
                            }
                            Text(
                                "KES %,d".format(item.totalKes.toLong()),
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                        }
                        Divider(color = Slate100, thickness = 1.dp)
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Total Work Order Amount", fontWeight = FontWeight.Bold, color = Slate900)
                        Text("KES %,d".format(job.totalAmountKes.toLong()), fontWeight = FontWeight.Bold, color = FieldNoraTealDark)
                    }
                }
            }

            // Progression Action Flow
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Workflow Stage",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    when (job.status) {
                        JobStatus.ASSIGNED, JobStatus.NEW, JobStatus.SCHEDULED -> {
                            Button(
                                onClick = { scope.launch { repository.updateJobStatus(job.id, JobStatus.EN_ROUTE) } },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = FieldNoraTeal)
                            ) {
                                Icon(Icons.Default.DirectionsCar, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Mark En Route")
                            }
                        }
                        JobStatus.EN_ROUTE -> {
                            Button(
                                onClick = { scope.launch { repository.updateJobStatus(job.id, JobStatus.ON_SITE) } },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B))
                            ) {
                                Icon(Icons.Default.LocationOn, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Arrived On Site")
                            }
                        }
                        JobStatus.ON_SITE -> {
                            Button(
                                onClick = { scope.launch { repository.updateJobStatus(job.id, JobStatus.IN_PROGRESS) } },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = FieldNoraTeal)
                            ) {
                                Icon(Icons.Default.Build, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Start Diagnostic / Work")
                            }
                        }
                        JobStatus.IN_PROGRESS -> {
                            Button(
                                onClick = { onOpenSignature(job.id) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669))
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Capture Customer Sign-Off & eTIMS")
                            }
                        }
                        JobStatus.COMPLETED, JobStatus.INVOICED -> {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFFD1FAE5))
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = "✓ Work Order Completed & Signed Off",
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF047857)
                                )
                                job.signedBy?.let {
                                    Text("Signed by: $it", style = MaterialTheme.typography.bodyMedium, color = Color(0xFF065F46))
                                }
                            }
                        }
                        else -> {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Slate100)
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = "Current Status: ${job.status.displayName}",
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
