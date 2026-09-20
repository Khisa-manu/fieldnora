package com.fieldnora.technician.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Jobs : Screen("jobs", "Work Orders")
    object JobDetail : Screen("jobs/{jobId}", "Work Order Details") {
        fun createRoute(jobId: String) = "jobs/$jobId"
    }
    object Signature : Screen("jobs/{jobId}/signature", "Customer Sign-Off") {
        fun createRoute(jobId: String) = "jobs/$jobId/signature"
    }
    object Inventory : Screen("inventory", "Van Stock")
    object Settings : Screen("settings", "Field Settings")
}
