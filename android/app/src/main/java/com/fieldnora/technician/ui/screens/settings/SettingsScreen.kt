package com.fieldnora.technician.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
    repository: JobRepository
) {
    val context = LocalContext.current
    var serverUrl by remember { mutableStateOf(RetrofitClient.baseUrl) }
    val syncMessage by repository.syncMessage.collectAsState()
    val scope = rememberCoroutineScope()
    var isTestingConnection by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Field Settings & Sync", fontWeight = FontWeight.Bold, color = Slate50) },
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
            // Technician Profile Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .background(FieldNoraTeal, shape = RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = Color.White)
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text("Brian Kiprop", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Slate900)
                        Text("Lead HVAC & Mechanical Technician", style = MaterialTheme.typography.bodyMedium, color = Slate500)
                        Text("Nairobi Westlands Hub • EAT (UTC+3)", style = MaterialTheme.typography.labelSmall, color = FieldNoraTeal)
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
    }
}
