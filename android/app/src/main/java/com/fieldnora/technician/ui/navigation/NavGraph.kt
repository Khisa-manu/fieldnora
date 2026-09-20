package com.fieldnora.technician.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.fieldnora.technician.data.repository.JobRepository
import com.fieldnora.technician.ui.screens.inventory.VanInventoryScreen
import com.fieldnora.technician.ui.screens.jobdetail.JobDetailScreen
import com.fieldnora.technician.ui.screens.jobs.JobsListScreen
import com.fieldnora.technician.ui.screens.settings.SettingsScreen
import com.fieldnora.technician.ui.screens.signature.SignatureScreen
import com.fieldnora.technician.ui.theme.FieldNoraTeal
import com.fieldnora.technician.ui.theme.Slate900

data class BottomNavItem(
    val title: String,
    val route: String,
    val icon: ImageVector
)

@Composable
fun MainNavHost(
    repository: JobRepository
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomNavItems = listOf(
        BottomNavItem("Work Orders", Screen.Jobs.route, Icons.Default.Assignment),
        BottomNavItem("Van Stock", Screen.Inventory.route, Icons.Default.Inventory2),
        BottomNavItem("Settings", Screen.Settings.route, Icons.Default.Settings)
    )

    val showBottomBar = currentRoute in listOf(
        Screen.Jobs.route,
        Screen.Inventory.route,
        Screen.Settings.route
    )

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = Slate900,
                    contentColor = Color.White
                ) {
                    bottomNavItems.forEach { item ->
                        val selected = currentRoute == item.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(item.icon, contentDescription = item.title) },
                            label = { Text(item.title) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Slate900,
                                selectedTextColor = FieldNoraTeal,
                                indicatorColor = FieldNoraTeal,
                                unselectedIconColor = Color(0xFF94A3B8),
                                unselectedTextColor = Color(0xFF94A3B8)
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Jobs.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Jobs.route) {
                JobsListScreen(
                    repository = repository,
                    onJobClick = { jobId ->
                        navController.navigate(Screen.JobDetail.createRoute(jobId))
                    }
                )
            }

            composable(
                route = Screen.JobDetail.route,
                arguments = listOf(navArgument("jobId") { type = NavType.StringType })
            ) { backStackEntry ->
                val jobId = backStackEntry.arguments?.getString("jobId") ?: ""
                JobDetailScreen(
                    jobId = jobId,
                    repository = repository,
                    onNavigateBack = { navController.popBackStack() },
                    onOpenSignature = { id ->
                        navController.navigate(Screen.Signature.createRoute(id))
                    }
                )
            }

            composable(
                route = Screen.Signature.route,
                arguments = listOf(navArgument("jobId") { type = NavType.StringType })
            ) { backStackEntry ->
                val jobId = backStackEntry.arguments?.getString("jobId") ?: ""
                SignatureScreen(
                    jobId = jobId,
                    repository = repository,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Inventory.route) {
                VanInventoryScreen(repository = repository)
            }

            composable(Screen.Settings.route) {
                SettingsScreen(repository = repository)
            }
        }
    }
}
