# fieldnora - Native Android Technician App (Kotlin + Jetpack Compose)

This is the production-ready native Android application for **fieldnora**, built purely with **Kotlin** and modern **Jetpack Compose + Material 3**. All React Native and Expo dependencies have been removed.

---

## 📱 Tech Stack & Architecture

- **Language:** Kotlin 1.9.24 (JVM Target 17, Compose Compiler 1.5.14)
- **UI Framework:** Jetpack Compose with Material 3 Design System
- **Minimum SDK:** API 26 (Android 8.0 Oreo)
- **Target SDK / Compile SDK:** API 34 (Android 14)
- **Package Identifier:** `com.fieldnora.technician`
- **Networking:** Retrofit 2.11 + OkHttp 4.12 with JSON Serialization
  - **Base URL:** `https://fieldnora-production.up.railway.app/` (Hardcoded default in `RetrofitClient.kt`)
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

## 🛠️ Common Build Issues & Troubleshooting

### 1. "SDK location not found" / Missing `ANDROID_HOME`
If running Gradle from the command line, Android Gradle Plugin needs to know where your Android SDK lives. Create a `local.properties` file inside `android/`:
```properties
# macOS:
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk

# Windows:
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk

# Linux:
sdk.dir=/home/YOUR_USERNAME/Android/Sdk
```
Alternatively, set the environment variable:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk # (macOS)
export ANDROID_HOME=$HOME/Android/Sdk        # (Linux)
```

### 2. JDK Version Requirement (Java 17)
Android Gradle Plugin 8.4 requires **Java 17**. Check your active Java version:
```bash
java -version
```
In Android Studio, confirm the Gradle JDK is set to JDK 17 under **Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK**.

### 3. Execution Permission on `./gradlew`
If you receive `permission denied: ./gradlew`, grant execute permissions:
```bash
chmod +x ./gradlew
```

### 4. Direct Device Install via ADB
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
# or release:
adb install -r app/build/outputs/apk/release/app-release.apk
```

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
