# fieldnora - Native Android Technician App (Kotlin + Jetpack Compose)

This is the production-ready native Android application for **fieldnora**, built purely with **Kotlin** and modern **Jetpack Compose + Material 3**. All React Native and Expo dependencies have been removed.

---

## 📱 Tech Stack & Architecture

- **Language:** Kotlin 1.9.23 (JVM Target 17)
- **UI Framework:** Jetpack Compose with Material 3 Design System
- **Minimum SDK:** API 26 (Android 8.0 Oreo)
- **Target SDK / Compile SDK:** API 34 (Android 14)
- **Package Identifier:** `com.fieldnora.technician`
- **Networking:** Retrofit 2.11 + OkHttp 4.12 with JSON Serialization
- **Concurrency & State:** Kotlin Coroutines + `StateFlow`
- **Navigation:** Jetpack Compose Navigation (`androidx.navigation:navigation-compose`)
- **Native Hardware Integration:**
  - GPS Geolocation & Turn-by-Turn Navigation via Google Maps Intents
  - Phone Dialing Intent (`android.permission.CALL_PHONE`)
  - Direct WhatsApp Dispatch Integration
  - Native Stylus & Touch Digital Signature Pad (`androidx.compose.foundation.Canvas`)

---

## 🚀 How to Open and Build in Android Studio

### Step 1: Open in Android Studio
1. Open **Android Studio** (Koala, Iguana, Hedgehog, or newer).
2. Choose **Open** (or **File > Open**).
3. Select the `android` folder in this repository:
   ```text
   /path/to/fieldnora/android
   ```
4. Allow Gradle to finish syncing dependencies.

### Step 2: Build the APK
- **Option A (Android Studio GUI):**
  Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
  Once complete, click the **locate** link in the event log notification.

- **Option B (Terminal / CLI with Gradle Wrapper):**
  ```bash
  cd android
  ./gradlew assembleRelease
  ```
  *(Or for debug testing: `./gradlew assembleDebug`)*

### Output APK File Location:
```text
android/app/build/outputs/apk/release/app-release.apk
```
*(Or `android/app/build/outputs/apk/debug/app-debug.apk`)*

---

## 🏗️ Project Directory Structure

```text
android/
├── build.gradle.kts                # Top-level Gradle configuration
├── settings.gradle.kts             # Project modules & repository mirrors
├── gradle.properties               # AndroidX, JVM memory options
├── gradle/
│   ├── libs.versions.toml          # Gradle version catalog (Compose, Kotlin, Retrofit)
│   └── wrapper/
│       └── gradle-wrapper.properties
└── app/
    ├── build.gradle.kts            # App module build script (API 34, Compose, Proguard)
    ├── proguard-rules.pro          # Proguard keep rules for models & Gson
    └── src/
        └── main/
            ├── AndroidManifest.xml # Permissions (Internet, GPS, Phone, Camera)
            ├── res/                # Vector drawables, themes, strings, adaptive icons
            └── java/com/fieldnora/technician/
                ├── FieldNoraApplication.kt
                ├── MainActivity.kt
                ├── data/
                │   ├── model/      # Job, Customer, InventoryItem, Status
                │   ├── api/        # Retrofit interface & OkHttp client
                │   └── repository/ # JobRepository with offline cache
                └── ui/
                    ├── theme/      # Colors, Material3 Theme, Typography
                    ├── navigation/ # Screen routes & NavHost
                    └── screens/
                        ├── jobs/       # Work orders list with status filters
                        ├── jobdetail/  # Detailed work order & native intents
                        ├── signature/  # Touch canvas signature capture
                        ├── inventory/  # Van stock & parts catalog
                        └── settings/   # Cloud Run API sync config
```
