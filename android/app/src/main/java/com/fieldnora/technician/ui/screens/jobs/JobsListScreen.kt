package com.fieldnora.technician.ui.screens.jobs

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fieldnora.technician.data.model.Job
import com.fieldnora.technician.data.model.JobStatus
import com.fieldnora.technician.data.repository.JobRepository
import com.fieldnora.technician.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobsListScreen(
    repository: JobRepository,
    onJobClick: (String) -> Unit,
    onOpenProfile: () -> Unit = {}
) {
    val jobs by repository.jobs.collectAsState()
    val syncMessage by repository.syncMessage.collectAsState()
    val currentTech by repository.currentTechnician.collectAsState()
    val scope = rememberCoroutineScope()
    var selectedFilter by remember { mutableStateOf<String>("All") }

    val filteredJobs = remember(jobs, selectedFilter) {
        if (selectedFilter == "All") jobs
        else jobs.filter { it.status.name.equals(selectedFilter, ignoreCase = true) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "fieldnora",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Slate50
                        )
                        Text(
                            text = "Tech: ${currentTech.name} (${currentTech.vehicleReg})",
                            style = MaterialTheme.typography.labelSmall,
                            color = FieldNoraTealLight
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { scope.launch { repository.refreshJobsFromNetwork() } }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Sync",
                            tint = Slate50
                        )
                    }
                    IconButton(onClick = onOpenProfile) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(androidx.compose.foundation.shape.CircleShape)
                                .background(FieldNoraTeal),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = currentTech.name.split(" ").mapNotNull { it.firstOrNull()?.toString() }.take(2).joinToString(""),
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Slate900
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Slate50)
                .padding(paddingValues)
        ) {
            // Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("All", "IN_PROGRESS", "SCHEDULED", "COMPLETED").forEach { filter ->
                    val isSelected = selectedFilter == filter
                    val label = when (filter) {
                        "IN_PROGRESS" -> "In Progress"
                        "SCHEDULED" -> "Scheduled"
                        "COMPLETED" -> "Completed"
                        else -> "All Orders (${jobs.size})"
                    }
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedFilter = filter },
                        label = { Text(label, fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = FieldNoraTeal,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            // Work Orders List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredJobs, key = { it.id }) { job ->
                    JobCard(job = job, onClick = { onJobClick(job.id) })
                }

                if (filteredJobs.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 48.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No work orders in this category",
                                color = Slate500,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun JobCard(job: Job, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header: Job number & Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = job.jobNumber,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = FieldNoraTealDark,
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(FieldNoraTealLight)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                )

                StatusBadge(status = job.status)
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = job.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = job.description,
                style = MaterialTheme.typography.bodyMedium,
                color = Slate700,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(12.dp))
            Divider(color = Slate100, thickness = 1.dp)
            Spacer(modifier = Modifier.height(12.dp))

            // Footer info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = Slate500,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = job.safeCustomer.address,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500,
                        maxLines = 1
                    )
                }

                Text(
                    text = "KES %,d".format(job.totalAmountKes.toLong()),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
            }
        }
    }
}

@Composable
fun StatusBadge(status: JobStatus) {
    val (bgColor, textColor, label) = when (status) {
        JobStatus.SCHEDULED -> Triple(Color(0xFFE0F2FE), Color(0xFF0369A1), "SCHEDULED")
        JobStatus.ASSIGNED -> Triple(Color(0xFFE0F2FE), Color(0xFF0284C7), "ASSIGNED")
        JobStatus.NEW -> Triple(Color(0xFFE0F2FE), Color(0xFF0284C7), "NEW")
        JobStatus.EN_ROUTE -> Triple(Color(0xFFEDE9FE), Color(0xFF6D28D9), "EN ROUTE")
        JobStatus.ON_SITE -> Triple(Color(0xFFFEF3C7), Color(0xFFB45309), "ON SITE")
        JobStatus.IN_PROGRESS -> Triple(Color(0xFFCCFBF1), Color(0xFF0F766E), "IN PROGRESS")
        JobStatus.COMPLETED -> Triple(Color(0xFFD1FAE5), Color(0xFF047857), "COMPLETED")
        JobStatus.INVOICED -> Triple(Color(0xFFF1F5F9), Color(0xFF334155), "INVOICED")
        JobStatus.DRAFT -> Triple(Color(0xFFF1F5F9), Color(0xFF475569), "DRAFT")
        JobStatus.CANCELLED -> Triple(Color(0xFFFFE4E6), Color(0xFFE11D48), "CANCELLED")
        else -> Triple(Color(0xFFF1F5F9), Color(0xFF475569), status.displayName.uppercase())
    }

    Text(
        text = label,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = textColor,
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 3.dp)
    )
}
