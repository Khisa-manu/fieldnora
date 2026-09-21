package com.fieldnora.technician.ui.screens.signature

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fieldnora.technician.data.repository.JobRepository
import com.fieldnora.technician.ui.theme.*
import kotlinx.coroutines.launch

val NoraGreenPrimary = Color(0xFF16A34A)
val NoraGreenDark = Color(0xFF138844)
val NoraGreenLight = Color(0xFFEEF9F1)
val NoraGreenBorder = Color(0xFFC6F0D8)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignatureScreen(
    jobId: String,
    repository: JobRepository,
    onNavigateBack: () -> Unit
) {
    var signerName by remember { mutableStateOf("John Mwangi") }
    var starRating by remember { mutableStateOf(4) }
    var additionalNotes by remember { mutableStateOf("") }
    var mpesaConfirmed by remember { mutableStateOf(true) }

    val pathPoints = remember { mutableStateListOf<List<Offset>>() }
    var currentStroke by remember { mutableStateOf(listOf<Offset>()) }
    val scope = rememberCoroutineScope()
    var isSubmitting by remember { mutableStateOf(false) }
    var showCompletedDialog by remember { mutableStateOf(false) }

    val displayJobNumber = if (jobId.isNotBlank() && jobId.startsWith("#")) jobId else if (jobId.isNotBlank()) "#$jobId" else "#FN-2400-0897"

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Job Completion",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = Slate900
                        )
                        Text(
                            text = displayJobNumber,
                            fontSize = 12.sp,
                            color = Slate500,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Slate900)
                    }
                },
                actions = {
                    IconButton(onClick = { /* More actions */ }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More Options", tint = Slate700)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = Color(0xFFF8FAFC)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // =================================================================
            // CARD 1: SUCCESS BANNER
            // =================================================================
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NoraGreenLight),
                border = androidx.compose.foundation.BorderStroke(1.dp, NoraGreenBorder)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(NoraGreenPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = "Success",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Column {
                        Text(
                            text = "Great work! Job completed.",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Slate900
                        )
                        Text(
                            text = "Please collect customer signature and complete the job.",
                            fontSize = 12.sp,
                            color = Slate700
                        )
                    }
                }
            }

            // =================================================================
            // CARD 2: CUSTOMER SIGNATURE CARD
            // =================================================================
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = null,
                            tint = NoraGreenPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Customer Signature",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Slate900
                        )
                    }

                    // Signature Drawing Box
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(130.dp)
                            .border(1.dp, Slate200, RoundedCornerShape(8.dp))
                            .background(Color.White)
                    ) {
                        Canvas(
                            modifier = Modifier
                                .fillMaxSize()
                                .pointerInput(Unit) {
                                    detectDragGestures(
                                        onDragStart = { offset ->
                                            currentStroke = listOf(offset)
                                        },
                                        onDrag = { change, _ ->
                                            change.consume()
                                            currentStroke = currentStroke + change.position
                                        },
                                        onDragEnd = {
                                            if (currentStroke.isNotEmpty()) {
                                                pathPoints.add(currentStroke)
                                                currentStroke = emptyList()
                                            }
                                        }
                                    )
                                }
                        ) {
                            // Render drawn strokes
                            pathPoints.forEach { stroke ->
                                if (stroke.size > 1) {
                                    val path = Path().apply {
                                        moveTo(stroke.first().x, stroke.first().y)
                                        for (i in 1 until stroke.size) {
                                            lineTo(stroke[i].x, stroke[i].y)
                                        }
                                    }
                                    drawPath(
                                        path = path,
                                        color = Color(0xFF0F172A),
                                        style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
                                    )
                                }
                            }

                            if (currentStroke.size > 1) {
                                val activePath = Path().apply {
                                    moveTo(currentStroke.first().x, currentStroke.first().y)
                                    for (i in 1 until currentStroke.size) {
                                        lineTo(currentStroke[i].x, currentStroke[i].y)
                                    }
                                }
                                drawPath(
                                    path = activePath,
                                    color = Color(0xFF0F172A),
                                    style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
                                )
                            }
                        }

                        if (pathPoints.isEmpty() && currentStroke.isEmpty()) {
                            Text(
                                text = signerName,
                                color = Color(0xFF1E293B),
                                fontSize = 26.sp,
                                fontWeight = FontWeight.Light,
                                modifier = Modifier.align(Alignment.Center)
                            )
                        }
                    }

                    // Bottom info & Clear button
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Sign above with your finger",
                            fontSize = 11.5.sp,
                            color = Slate500
                        )

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            modifier = Modifier.clickable {
                                pathPoints.clear()
                                currentStroke = emptyList()
                            }
                        ) {
                            Icon(
                                Icons.Default.Refresh,
                                contentDescription = "Clear",
                                tint = NoraGreenPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Clear",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = NoraGreenPrimary
                            )
                        }
                    }
                }
            }

            // =================================================================
            // CARD 3: CUSTOMER FEEDBACK
            // =================================================================
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            tint = NoraGreenPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Customer Feedback",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Slate900
                        )
                    }

                    // Customer Name Input
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "Customer Name",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate700
                        )
                        OutlinedTextField(
                            value = signerName,
                            onValueChange = { signerName = it },
                            modifier = Modifier.fillMaxWidth(),
                            trailingIcon = {
                                Icon(Icons.Default.Person, contentDescription = null, tint = Slate500)
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NoraGreenPrimary,
                                unfocusedBorderColor = Slate200
                            )
                        )
                    }

                    // Rating: How was our service?
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "How was our service?",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate700
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            (1..5).forEach { star ->
                                val isFilled = star <= starRating
                                Icon(
                                    imageVector = if (isFilled) Icons.Filled.Star else Icons.Outlined.Star,
                                    contentDescription = "Rating $star",
                                    tint = if (isFilled) NoraGreenPrimary else Slate300(),
                                    modifier = Modifier
                                        .size(22.dp)
                                        .clickable { starRating = star }
                                )
                            }
                        }
                    }

                    // Additional Notes (Optional)
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "Additional Notes (Optional)",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate700
                        )
                        OutlinedTextField(
                            value = additionalNotes,
                            onValueChange = { additionalNotes = it },
                            placeholder = { Text("Add any notes or feedback...", fontSize = 12.sp, color = Slate400()) },
                            modifier = Modifier.fillMaxWidth(),
                            trailingIcon = {
                                Icon(Icons.Default.Edit, contentDescription = null, tint = Slate400(), modifier = Modifier.size(16.dp))
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NoraGreenPrimary,
                                unfocusedBorderColor = Slate200
                            ),
                            minLines = 2
                        )
                    }
                }
            }

            // =================================================================
            // CARD 4: JOB SUMMARY
            // =================================================================
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Column {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = "📋",
                                fontSize = 14.sp
                            )
                            Text(
                                text = "Job Summary",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Slate900
                            )
                        }

                        // Labour
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Labour", fontWeight = FontWeight.Bold, fontSize = 12.5.sp, color = Slate900)
                            Text("2.5 hrs", fontWeight = FontWeight.Bold, fontSize = 12.5.sp, color = Slate900)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(start = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("- Diagnostic & Inspection", fontSize = 12.sp, color = Slate700)
                            Text("KSh 1,500.00", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate900)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(start = 16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Repair & Testing", fontSize = 12.sp, color = Slate700)
                            Text("KSh 2,000.00", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate900)
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        // Materials Used
                        Text("Materials Used", fontWeight = FontWeight.Bold, fontSize = 12.5.sp, color = Slate900)
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(start = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Replacement Capacitor (10µF)", fontSize = 12.sp, color = Slate700)
                            Text("KSh 450.00", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate900)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(start = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Electrical Tape", fontSize = 12.sp, color = Slate700)
                            Text("KSh 150.00", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate900)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(start = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Cable Clip Set", fontSize = 12.sp, color = Slate700)
                            Text("KSh 200.00", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate900)
                        }
                    }

                    // Mint Green Total Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(NoraGreenLight)
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Total", fontWeight = FontWeight.Bold, fontSize = 13.5.sp, color = NoraGreenPrimary)
                        Text("KSh 4,300.00", fontWeight = FontWeight.Black, fontSize = 14.sp, color = NoraGreenPrimary)
                    }
                }
            }

            // =================================================================
            // CARD 5: M-PESA PAYMENT RECEIVED
            // =================================================================
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(NoraGreenPrimary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("📱", fontSize = 16.sp)
                            }
                            Column {
                                Text(
                                    text = "M-Pesa Payment Received",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.5.sp,
                                    color = Slate900
                                )
                                Text(
                                    text = "Confirm payment with customer.",
                                    fontSize = 11.5.sp,
                                    color = Slate500
                                )
                            }
                        }

                        Switch(
                            checked = mpesaConfirmed,
                            onCheckedChange = { mpesaConfirmed = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = NoraGreenPrimary,
                                uncheckedThumbColor = Color.White,
                                uncheckedTrackColor = Slate300()
                            )
                        )
                    }
                }

                if (mpesaConfirmed) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.padding(start = 4.dp)
                    ) {
                        Text(
                            text = "Payment confirmed via M-Pesa",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate700
                        )
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = "Confirmed",
                            tint = NoraGreenPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            // =================================================================
            // CARD 6: COMPLETE & SYNC JOB BUTTON
            // =================================================================
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
            ) {
                Button(
                    onClick = {
                        isSubmitting = true
                        scope.launch {
                            repository.submitSignature(
                                jobId = jobId,
                                signerName = signerName,
                                signatureBase64 = "data:image/svg+xml;base64,sampleSignature"
                            )
                            isSubmitting = false
                            showCompletedDialog = true
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = NoraGreenDark)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = if (isSubmitting) "Syncing Job..." else "Complete & Sync Job",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("☁", fontSize = 16.sp, color = Color.White)
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        Icons.Default.Refresh,
                        contentDescription = "Sync",
                        tint = NoraGreenPrimary,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "Job will sync when online",
                        fontSize = 11.5.sp,
                        color = Slate500,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }

    if (showCompletedDialog) {
        AlertDialog(
            onDismissRequest = { showCompletedDialog = false },
            title = { Text("Job Completed", fontWeight = FontWeight.Bold) },
            text = {
                Text("Order $displayJobNumber has been digitally signed by $signerName and verified via M-Pesa payment.")
            },
            confirmButton = {
                TextButton(onClick = {
                    showCompletedDialog = false
                    onNavigateBack()
                }) {
                    Text("Done", color = NoraGreenPrimary, fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}

private fun Slate300() = Color(0xFFCBD5E1)
private fun Slate400() = Color(0xFF94A3B8)
