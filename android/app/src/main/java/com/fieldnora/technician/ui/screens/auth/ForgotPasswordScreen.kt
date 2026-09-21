package com.fieldnora.technician.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fieldnora.technician.data.repository.JobRepository
import com.fieldnora.technician.ui.theme.*
import kotlinx.coroutines.launch

private enum class ResetStep {
    REQUEST_CODE,
    VERIFY_AND_RESET,
    SUCCESS
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ForgotPasswordScreen(
    repository: JobRepository,
    onPasswordResetSuccess: () -> Unit,
    onNavigateBackToLogin: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager()

    var currentStep by remember { mutableStateOf(ResetStep.REQUEST_CODE) }
    var identifier by remember { mutableStateOf("") }
    var verificationCode by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    var serverOtpHint by remember { mutableStateOf<String?>(null) }

    fun handleRequestCode() {
        if (identifier.isBlank()) {
            errorMessage = "Please enter your technician email, phone, or ID."
            return
        }
        isLoading = true
        errorMessage = null
        focusManager.clearFocus()

        scope.launch {
            val result = repository.requestPasswordReset(identifier)
            isLoading = false
            result.onSuccess { response ->
                successMessage = response.message
                if (!response.otp.isNullOrBlank()) {
                    serverOtpHint = response.otp
                    verificationCode = response.otp
                }
                currentStep = ResetStep.VERIFY_AND_RESET
            }.onFailure { err ->
                errorMessage = err.localizedMessage ?: "Failed to dispatch verification code."
            }
        }
    }

    fun handleResetPassword() {
        if (verificationCode.isBlank()) {
            errorMessage = "Please enter the 6-digit verification code."
            return
        }
        if (newPassword.isBlank() || newPassword.length < 4) {
            errorMessage = "New PIN / Password must be at least 4 characters."
            return
        }
        if (newPassword != confirmPassword) {
            errorMessage = "Passwords do not match."
            return
        }

        isLoading = true
        errorMessage = null
        focusManager.clearFocus()

        scope.launch {
            val result = repository.resetPassword(identifier, verificationCode, newPassword)
            isLoading = false
            result.onSuccess { response ->
                successMessage = response.message
                currentStep = ResetStep.SUCCESS
            }.onFailure { err ->
                errorMessage = err.localizedMessage ?: "Failed to reset password."
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Reset Password",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Slate900
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBackToLogin) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back to Sign In",
                            tint = Slate800
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        containerColor = Slate50
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState()),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                // Step Indicator Header
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(FieldNoraTeal.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (currentStep == ResetStep.SUCCESS) Icons.Default.CheckCircle else Icons.Default.LockReset,
                                    contentDescription = null,
                                    tint = FieldNoraTeal,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column {
                                Text(
                                    text = when (currentStep) {
                                        ResetStep.REQUEST_CODE -> "Technician Account Recovery"
                                        ResetStep.VERIFY_AND_RESET -> "Verify & Set New PIN"
                                        ResetStep.SUCCESS -> "Reset Complete"
                                    },
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Text(
                                    text = when (currentStep) {
                                        ResetStep.REQUEST_CODE -> "Step 1 of 2: Verify identity"
                                        ResetStep.VERIFY_AND_RESET -> "Step 2 of 2: Enter code & new PIN"
                                        ResetStep.SUCCESS -> "Credentials updated"
                                    },
                                    fontSize = 12.sp,
                                    color = Slate500
                                )
                            }
                        }

                        // Error Banner
                        if (errorMessage != null) {
                            Spacer(modifier = Modifier.height(16.dp))
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color(0xFFFEF2F2),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFECACA)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.ErrorOutline,
                                        contentDescription = null,
                                        tint = Color(0xFFDC2626),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = errorMessage ?: "",
                                        color = Color(0xFF991B1B),
                                        fontSize = 12.sp,
                                        lineHeight = 16.sp
                                    )
                                }
                            }
                        }

                        // Success/Info Banner
                        if (successMessage != null && currentStep != ResetStep.SUCCESS) {
                            Spacer(modifier = Modifier.height(14.dp))
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color(0xFFF0FDF4),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBBF7D0)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.CheckCircleOutline,
                                        contentDescription = null,
                                        tint = Color(0xFF16A34A),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = successMessage ?: "",
                                        color = Color(0xFF166534),
                                        fontSize = 12.sp,
                                        lineHeight = 16.sp
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // STEP 1: REQUEST VERIFICATION CODE
                        if (currentStep == ResetStep.REQUEST_CODE) {
                            Text(
                                text = "Enter your work email address or Safaricom/M-Pesa phone number registered with your dispatch organization.",
                                fontSize = 13.sp,
                                color = Slate600,
                                lineHeight = 18.sp
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            OutlinedTextField(
                                value = identifier,
                                onValueChange = {
                                    identifier = it
                                    errorMessage = null
                                },
                                label = { Text("Email or Phone Number") },
                                placeholder = { Text("e.g. tech@fieldnora.co.ke or 0712345678") },
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.Badge,
                                        contentDescription = null,
                                        tint = if (identifier.isNotBlank()) FieldNoraTeal else Slate500
                                    )
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Email,
                                    imeAction = ImeAction.Done
                                ),
                                keyboardActions = KeyboardActions(
                                    onDone = { handleRequestCode() }
                                ),
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = FieldNoraTeal,
                                    unfocusedBorderColor = Slate200
                                )
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { handleRequestCode() },
                                enabled = !isLoading && identifier.isNotBlank(),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = FieldNoraTeal,
                                    contentColor = Color.White
                                )
                            ) {
                                if (isLoading) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(20.dp),
                                        color = Color.White,
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Text("Send Verification Code", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                            }
                        }

                        // STEP 2: ENTER CODE & SET NEW PASSWORD
                        if (currentStep == ResetStep.VERIFY_AND_RESET) {
                            Text(
                                text = "Enter the 6-digit code sent to $identifier and choose your new technician PIN/password.",
                                fontSize = 13.sp,
                                color = Slate600,
                                lineHeight = 18.sp
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Verification Code
                            OutlinedTextField(
                                value = verificationCode,
                                onValueChange = {
                                    if (it.length <= 6) {
                                        verificationCode = it
                                        errorMessage = null
                                    }
                                },
                                label = { Text("6-Digit Verification Code") },
                                placeholder = { Text("123456") },
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.Pin,
                                        contentDescription = null,
                                        tint = if (verificationCode.isNotBlank()) FieldNoraTeal else Slate500
                                    )
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Number,
                                    imeAction = ImeAction.Next
                                ),
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = FieldNoraTeal,
                                    unfocusedBorderColor = Slate200
                                )
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            // New Password
                            OutlinedTextField(
                                value = newPassword,
                                onValueChange = {
                                    newPassword = it
                                    errorMessage = null
                                },
                                label = { Text("New PIN / Password") },
                                placeholder = { Text("Minimum 4 characters") },
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.Lock,
                                        contentDescription = null,
                                        tint = if (newPassword.isNotBlank()) FieldNoraTeal else Slate500
                                    )
                                },
                                trailingIcon = {
                                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                        Icon(
                                            imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                            contentDescription = if (passwordVisible) "Hide" else "Show",
                                            tint = Slate500
                                        )
                                    }
                                },
                                singleLine = true,
                                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Password,
                                    imeAction = ImeAction.Next
                                ),
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = FieldNoraTeal,
                                    unfocusedBorderColor = Slate200
                                )
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            // Confirm Password
                            OutlinedTextField(
                                value = confirmPassword,
                                onValueChange = {
                                    confirmPassword = it
                                    errorMessage = null
                                },
                                label = { Text("Confirm New PIN / Password") },
                                placeholder = { Text("Re-enter new password") },
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.LockReset,
                                        contentDescription = null,
                                        tint = if (confirmPassword.isNotBlank()) FieldNoraTeal else Slate500
                                    )
                                },
                                singleLine = true,
                                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Password,
                                    imeAction = ImeAction.Done
                                ),
                                keyboardActions = KeyboardActions(
                                    onDone = { handleResetPassword() }
                                ),
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = FieldNoraTeal,
                                    unfocusedBorderColor = Slate200
                                )
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { handleResetPassword() },
                                enabled = !isLoading && verificationCode.isNotBlank() && newPassword.isNotBlank(),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = FieldNoraTeal,
                                    contentColor = Color.White
                                )
                            ) {
                                if (isLoading) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(20.dp),
                                        color = Color.White,
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Text("Reset PIN & Sign In", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                TextButton(onClick = { currentStep = ResetStep.REQUEST_CODE }) {
                                    Text("Change Identifier", fontSize = 12.sp, color = Slate600)
                                }
                                TextButton(onClick = { handleRequestCode() }) {
                                    Text("Resend Code", fontSize = 12.sp, color = FieldNoraTeal, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        // STEP 3: SUCCESS CONFIRMATION
                        if (currentStep == ResetStep.SUCCESS) {
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(60.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFFDCFCE7)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = Color(0xFF16A34A),
                                        modifier = Modifier.size(32.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                Text(
                                    text = "Password Reset Successful",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = "Your technician credentials have been securely updated. You may now sign in to your work schedule.",
                                    fontSize = 13.sp,
                                    color = Slate600,
                                    lineHeight = 18.sp
                                )

                                Spacer(modifier = Modifier.height(24.dp))

                                Button(
                                    onClick = onPasswordResetSuccess,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = FieldNoraTeal,
                                        contentColor = Color.White
                                    )
                                ) {
                                    Text("Sign In With New PIN", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Remember your password?",
                        fontSize = 13.sp,
                        color = Slate600
                    )
                    TextButton(onClick = onNavigateBackToLogin) {
                        Text(
                            text = "Sign In",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = FieldNoraTeal
                        )
                    }
                }
            }
        }
    }
}
