package com.fieldnora.technician.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import com.fieldnora.technician.data.api.RetrofitClient
import com.fieldnora.technician.data.repository.JobRepository
import com.fieldnora.technician.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    repository: JobRepository,
    onLoggedOut: () -> Unit = {},
    onViewProfile: () -> Unit = {}
) {
    val context = LocalContext.current
    var serverUrl by remember { mutableStateOf(RetrofitClient.baseUrl) }
    val syncMessage by repository.syncMessage.collectAsState()
    val currentTech by repository.currentTechnician.collectAsState()
    val scope = rememberCoroutineScope()
    var isTestingConnection by remember { mutableStateOf(false) }
    var showLogoutConfirm by remember { mutableStateOf(false) }
    var isLoggingOut by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Field Settings & Account", fontWeight = FontWeight.Bold, color = Slate50) },
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
            // Active Technician Account Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(FieldNoraTeal),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = currentTech.name.split(" ").mapNotNull { it.firstOrNull()?.toString() }.take(2).joinToString(""),
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(currentTech.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Slate900)
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = FieldNoraTealLight
                                ) {
                                    Text(
                                        text = currentTech.vehicleReg,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = FieldNoraTealDark,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(currentTech.specialization, style = MaterialTheme.typography.bodySmall, color = Slate500)
                            Text("${currentTech.phone} • ⭐ ${currentTech.rating}", style = MaterialTheme.typography.labelSmall, color = FieldNoraTeal)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Divider(color = Slate100)
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = onViewProfile,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.AccountBox, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Full Profile", fontSize = 12.sp)
                        }

                        Button(
                            onClick = { showLogoutConfirm = true },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFFEE2E2),
                                contentColor = Color(0xFFDC2626)
                            )
                        ) {
                            Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Log Out", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Sync Configuration Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("API Gateway & Synchronization", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Slate900)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Connects with the FieldNora Web Dashboard backend.", style = MaterialTheme.typography.bodyMedium, color = Slate500)

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = serverUrl,
                        onValueChange = { serverUrl = it },
                        label = { Text("Backend Server URL") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )

                    if (serverUrl.contains("uip.railway.app")) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFFFEF3C7))
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Typo detected ('uip' instead of 'up')", fontSize = 11.sp, color = Color(0xFF92400E))
                            TextButton(
                                onClick = { serverUrl = serverUrl.replace("uip.railway.app", "up.railway.app") },
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Text("Fix Typo", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFB45309))
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Quick URL Presets
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { serverUrl = RetrofitClient.PRODUCTION_BASE_URL },
                            modifier = Modifier.weight(1.2f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                        ) {
                            Text("Railway Production", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = { serverUrl = "http://10.0.2.2:3000/" },
                            modifier = Modifier.weight(0.9f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                        ) {
                            Text("Emulator", fontSize = 11.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = {
                            isTestingConnection = true
                            val cleaned = RetrofitClient.cleanUrl(serverUrl)
                            serverUrl = cleaned
                            RetrofitClient.rebuildWithBaseUrl(cleaned, context)
                            scope.launch {
                                repository.refreshJobsFromNetwork()
                                isTestingConnection = false
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Slate900)
                    ) {
                        Icon(Icons.Default.CloudSync, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(if (isTestingConnection) "Connecting..." else "Save URL & Sync Database")
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Status: ${syncMessage ?: "Ready"}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500
                    )
                }
            }

            // Architecture Spec Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Native Android Build Spec", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Slate900)
                    Text("• Language: Kotlin 1.9.24", style = MaterialTheme.typography.bodyMedium, color = Slate700)
                    Text("• UI Framework: Jetpack Compose + Material 3", style = MaterialTheme.typography.bodyMedium, color = Slate700)
                    Text("• Target SDK: Android 14 (API 34)", style = MaterialTheme.typography.bodyMedium, color = Slate700)
                    Text("• Package ID: com.fieldnora.technician", style = MaterialTheme.typography.bodyMedium, color = Slate700)
                    Text("• Offline Persistence: Coroutine StateFlow + Local Cache", style = MaterialTheme.typography.bodyMedium, color = Slate700)
                }
            }
        }

        if (showLogoutConfirm) {
            AlertDialog(
                onDismissRequest = { showLogoutConfirm = false },
                title = { Text("Sign Out of Shift?", fontWeight = FontWeight.Bold) },
                text = {
                    Text(
                        "Are you sure you want to log out as ${currentTech.name}? Unsynced local work order items will remain cached on device."
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            showLogoutConfirm = false
                            isLoggingOut = true
                            scope.launch {
                                repository.logout()
                                isLoggingOut = false
                                onLoggedOut()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFDC2626),
                            contentColor = Color.White
                        )
                    ) {
                        Text("Log Out", fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showLogoutConfirm = false }) {
                        Text("Cancel")
                    }
                },
                shape = RoundedCornerShape(16.dp),
                containerColor = Color.White
            )
        }
    }
}
