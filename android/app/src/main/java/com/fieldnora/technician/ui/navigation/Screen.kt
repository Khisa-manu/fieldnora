package com.fieldnora.technician.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Login : Screen("login", "Technician Sign In")
    object Register : Screen("register", "Technician Registration")
    object ForgotPassword : Screen("forgot_password", "Reset Password")
    object Jobs : Screen("jobs", "Work Orders")
    object JobDetail : Screen("jobs/{jobId}", "Work Order Details") {
        fun createRoute(jobId: String) = "jobs/$jobId"
    }
    object Signature : Screen("jobs/{jobId}/signature", "Customer Sign-Off") {
        fun createRoute(jobId: String) = "jobs/$jobId/signature"
    }
    object LiveTracking : Screen("jobs/{jobId}/tracking", "Live Tracking") {
        fun createRoute(jobId: String) = "jobs/$jobId/tracking"
    }
    object Inventory : Screen("inventory", "Van Stock")
    object Settings : Screen("settings", "Field Settings")
    object Profile : Screen("profile", "Technician Account")
}
