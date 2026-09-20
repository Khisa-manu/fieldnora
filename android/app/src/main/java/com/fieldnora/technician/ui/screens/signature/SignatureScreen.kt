package com.fieldnora.technician.ui.screens.signature

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Done
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignatureScreen(
    jobId: String,
    repository: JobRepository,
    onNavigateBack: () -> Unit
) {
    var signerName by remember { mutableStateOf("") }
    val pathPoints = remember { mutableStateListOf<List<Offset>>() }
    var currentStroke by remember { mutableStateOf(listOf<Offset>()) }
    val scope = rememberCoroutineScope()
    var isSubmitting by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Customer Sign-Off", fontWeight = FontWeight.Bold, color = Slate50) },
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Sign on the screen to confirm service completion and authorize KRA eTIMS invoice generation.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF64748B)
            )

            OutlinedTextField(
                value = signerName,
                onValueChange = { signerName = it },
                label = { Text("Customer Full Name / Representative") },
                placeholder = { Text("e.g. Grace Wanjiku") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            // Touch Signature Pad
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
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
                        // Draw finalized strokes
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
                                    style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
                                )
                            }
                        }

                        // Draw current active stroke
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
                                style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
                            )
                        }
                    }

                    if (pathPoints.isEmpty() && currentStroke.isEmpty()) {
                        Text(
                            text = "Draw customer signature here with finger or stylus",
                            color = Color(0xFF94A3B8),
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.align(Alignment.Center)
                        )
                    }

                    // Clear button
                    IconButton(
                        onClick = {
                            pathPoints.clear()
                            currentStroke = emptyList()
                        },
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(8.dp)
                    ) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear Pad", tint = Color(0xFF94A3B8))
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Submit Button
            Button(
                onClick = {
                    if (signerName.isNotBlank() && pathPoints.isNotEmpty()) {
                        isSubmitting = true
                        scope.launch {
                            repository.submitSignature(
                                jobId = jobId,
                                signerName = signerName,
                                signatureBase64 = "data:image/svg+xml;base64,mockSignature"
                            )
                            isSubmitting = false
                            onNavigateBack()
                        }
                    }
                },
                enabled = signerName.isNotBlank() && pathPoints.isNotEmpty() && !isSubmitting,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669))
            ) {
                Icon(Icons.Default.Done, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isSubmitting) "Syncing Sign-Off..." else "Accept & Generate eTIMS Invoice",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }
        }
    }
}
