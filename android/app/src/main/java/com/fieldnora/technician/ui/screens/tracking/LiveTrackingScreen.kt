package com.fieldnora.technician.ui.screens.tracking

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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

/**
 * Live Map + Technician Navigation View
 * Exact implementation matching design specification and screenshot vwnwt.jpg.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveTrackingScreen(
    jobId: String,
    jobTitle: String = "Water Heater Repair",
    destinationAddress: String = "Apartment5B, Riverside Drive, Nairobi",
    destinationArea: String = "Nairobi CBD",
    technicianName: String = "Alex M.",
    onBack: () -> Unit = {},
    onViewJobDetails: (String) -> Unit = {}
) {
    val context = LocalContext.current
    var isNavigating by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Live Tracking",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { /* Overflow settings */ }) {
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = "Options",
                            tint = Color(0xFFCBD5E1)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF070C13)
                )
            )
        },
        containerColor = Color(0xFF070C13)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Cartographic Map Area (Dark theme with styled labels)
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF090E17))
            ) {
                // Top-Left County Label
                Column(
                    modifier = Modifier
                        .padding(start = 24.dp, top = 20.dp)
                ) {
                    Text(
                        text = "NAIROBI",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF475569),
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Nairobi County",
                        fontSize = 12.sp,
                        color = Color(0xFF334155),
                        fontWeight = FontWeight.Medium
                    )
                }

                // Neighborhood Landmarks
                Text(
                    text = "Westlands",
                    color = Color(0xFFE2E8F0),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.offset(x = 240.dp, y = 40.dp)
                )
                Text(
                    text = "Parklands",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp,
                    modifier = Modifier.offset(x = 290.dp, y = 75.dp)
                )
                Text(
                    text = "Kilimani",
                    color = Color(0xFFCBD5E1),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.offset(x = 60.dp, y = 120.dp)
                )

                // "YOU" Location Beacon
                Box(
                    modifier = Modifier
                        .offset(x = 120.dp, y = 135.dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF2563EB))
                        .border(3.dp, Color.White, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                    )
                }

                // "YOU / Current Location" Card
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF0D1520),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E2B3E)),
                    modifier = Modifier.offset(x = 155.dp, y = 125.dp)
                ) {
                    Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
                        Text(
                            text = "You",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Current Location",
                            color = Color(0xFF94A3B8),
                            fontSize = 10.sp
                        )
                    }
                }

                // "JOB DESTINATION" Pin
                Box(
                    modifier = Modifier
                        .offset(x = 260.dp, y = 130.dp)
                        .size(30.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEA580C))
                        .border(2.5.dp, Color.White, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Work,
                        contentDescription = "Destination",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }

                // "Job Destination / Nairobi CBD" Card
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF0D1520),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E2B3E)),
                    modifier = Modifier.offset(x = 270.dp, y = 170.dp)
                ) {
                    Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
                        Text(
                            text = "Job Destination",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = destinationArea,
                            color = Color(0xFF94A3B8),
                            fontSize = 10.sp
                        )
                    }
                }

                // Floating "Nearby Technicians" Badge
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF0A1018),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E2B3D)),
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(start = 16.dp, bottom = 390.dp)
                ) {
                    Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                        Text(
                            text = "Nearby Technicians",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(top = 2.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF22C55E))
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "3 online",
                                color = Color(0xFF94A3B8),
                                fontSize = 10.sp
                            )
                        }
                    }
                }

                // Floating Recenter Crosshair Button
                IconButton(
                    onClick = { /* Recenter GPS */ },
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(end = 16.dp, bottom = 390.dp)
                        .size(44.dp)
                        .background(Color(0xFF111A26), CircleShape)
                        .border(1.dp, Color(0xFF223145), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.GpsFixed,
                        contentDescription = "Recenter GPS",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            // Bottom Navigation Sheet (Matching vwnwt.jpg)
            Surface(
                shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
                color = Color(0xFF0A1019),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF192435)),
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .padding(16.dp)
                        .navigationBarsPadding(),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Drag Handle
                    Box(
                        modifier = Modifier
                            .align(Alignment.CenterHorizontally)
                            .width(48.dp)
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(Color(0xFF475569))
                    )

                    // Job Info Row
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFEA580C)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Work,
                                contentDescription = "Job",
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "NEXT JOB",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFFF97316)
                            )
                            Text(
                                text = jobTitle,
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(top = 2.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = "Location",
                                    tint = Color(0xFF94A3B8),
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = destinationAddress,
                                    fontSize = 12.sp,
                                    color = Color(0xFFCBD5E1)
                                )
                            }
                        }
                    }

                    // 3 Metric Cards Row (ETA 18 min | Distance 6.8 km | Priority Medium)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Card 1: ETA
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFF0E1622),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1A2638))
                        ) {
                            Row(
                                modifier = Modifier.padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Schedule,
                                    contentDescription = "ETA",
                                    tint = Color(0xFF38BDF8),
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Column {
                                    Text("ETA", fontSize = 9.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.Bold)
                                    Text("18 min", fontSize = 15.sp, color = Color(0xFF38BDF8), fontWeight = FontWeight.Black)
                                    Text("11:00 AM", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                }
                            }
                        }

                        // Card 2: Distance
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFF0E1622),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1A2638))
                        ) {
                            Row(
                                modifier = Modifier.padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AltRoute,
                                    contentDescription = "Distance",
                                    tint = Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Column {
                                    Text("DISTANCE", fontSize = 9.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.Bold)
                                    Text("6.8 km", fontSize = 15.sp, color = Color.White, fontWeight = FontWeight.Black)
                                }
                            }
                        }

                        // Card 3: Priority
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFF0E1622),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1A2638))
                        ) {
                            Row(
                                modifier = Modifier.padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(22.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color(0xFF0F2F23)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Work,
                                        contentDescription = "Priority",
                                        tint = Color(0xFF34D399),
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                Column {
                                    Text("JOB PRIORITY", fontSize = 9.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.Bold)
                                    Text("Medium", fontSize = 14.sp, color = Color(0xFFF97316), fontWeight = FontWeight.Black)
                                }
                            }
                        }
                    }

                    // Technician Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF1E293B)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Technician",
                                    tint = Color.White
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Technician: $technicianName",
                                    color = Color.White,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF22C55E))
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Online", fontSize = 11.sp, color = Color(0xFF94A3B8))
                                }
                            }
                        }

                        IconButton(
                            onClick = { /* Contact */ },
                            modifier = Modifier
                                .size(36.dp)
                                .background(Color(0xFF131C28), RoundedCornerShape(10.dp))
                                .border(1.dp, Color(0xFF212E41), RoundedCornerShape(10.dp))
                        ) {
                            Icon(
                                imageVector = Icons.Default.PhoneAndroid,
                                contentDescription = "Device",
                                tint = Color(0xFFCBD5E1),
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }

                    // Encryption Subtext
                    Text(
                        text = "All data is live and encrypted \uD83D\uDD12",
                        fontSize = 11.sp,
                        color = Color(0xFF94A3B8)
                    )

                    // Action Buttons
                    Button(
                        onClick = {
                            isNavigating = true
                            val gmmIntentUri = Uri.parse("google.navigation:q=-1.2635,36.8020&mode=d")
                            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
                                setPackage("com.google.android.apps.maps")
                            }
                            if (mapIntent.resolveActivity(context.packageManager) != null) {
                                context.startActivity(mapIntent)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Navigation,
                            contentDescription = "Navigate",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "Start Navigation",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Opens in Google Maps",
                                fontSize = 10.sp,
                                color = Color(0xFFBFDBFE)
                            )
                        }
                    }

                    OutlinedButton(
                        onClick = { onViewJobDetails(jobId) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = Color(0xFF090F17),
                            contentColor = Color.White
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E2C3F))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Assignment,
                            contentDescription = "Details",
                            tint = Color(0xFFCBD5E1),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "View Job Details",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }
}
