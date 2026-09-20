import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  Terminal,
  Code2,
  CheckCircle2,
  MapPin,
  Phone,
  Layers,
  FileCode,
  Package,
  Cpu,
  Flame
} from 'lucide-react';

export const MobileAppCenterView: React.FC = () => {
  const { showToast } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'main_activity' | 'build_gradle' | 'job_detail' | 'signature_screen' | 'android_manifest'>('main_activity');

  // Interactive phone preview state
  const [mobileTab, setMobileTab] = useState<'jobs' | 'detail' | 'inventory' | 'settings'>('jobs');
  const [selectedMobileJob, setSelectedMobileJob] = useState<any>({
    id: 'job-101',
    jobNumber: 'WO-2026-089',
    title: 'Commercial HVAC Airflow Diagnostic',
    description: 'VRF unit throwing error code E3 in 4th floor server room. Refrigerant pressure check & filter sanitization.',
    status: 'in_progress',
    customerName: 'Safaricom HQ Annex',
    customerPhone: '+254 722 000 123',
    customerAddress: 'Waiyaki Way, Westlands, Nairobi',
    scheduledTime: '10:30 AM',
    totalKes: 11500
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Command copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadZip = () => {
    showToast('Preparing fieldnora-android-kotlin.zip archive...', 'info');
    window.location.href = '/api/mobile/download-zip';
  };

  const codeSnippets = {
    main_activity: `package com.fieldnora.technician

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.fieldnora.technician.ui.navigation.MainNavHost
import com.fieldnora.technician.ui.theme.FieldNoraTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val app = application as FieldNoraApplication

        setContent {
            FieldNoraTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainNavHost(repository = app.jobRepository)
                }
            }
        }
    }
}`,
    build_gradle: `// android/app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.jetbrains.kotlin.android)
}

android {
    namespace = "com.fieldnora.technician"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.fieldnora.technician"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.kotlinx.coroutines.android)
}`,
    job_detail: `// Native Android Intents for Field Technicians (Kotlin)
// 1. Google Maps Navigation Intent:
val gmmIntentUri = Uri.parse("geo:\${job.customer.latitude},\${job.customer.longitude}?q=\${Uri.encode(job.customer.address)}")
val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
context.startActivity(mapIntent)

// 2. Direct Customer Phone Call Intent:
val callIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:\${job.customer.phone}"))
context.startActivity(callIntent)

// 3. WhatsApp Dispatch Chat Intent:
val cleanPhone = job.customer.phone.replace("+", "").replace(" ", "")
val text = "Habari! This is Brian from fieldnora for work order \${job.jobNumber}."
val waIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://api.whatsapp.com/send?phone=\$cleanPhone&text=\${Uri.encode(text)}"))
context.startActivity(waIntent)`,
    signature_screen: `// Native Jetpack Compose Touch Signature Pad (Canvas API)
Canvas(
    modifier = Modifier
        .fillMaxSize()
        .pointerInput(Unit) {
            detectDragGestures(
                onDragStart = { offset -> currentStroke = listOf(offset) },
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
    pathPoints.forEach { stroke ->
        if (stroke.size > 1) {
            val path = Path().apply {
                moveTo(stroke.first().x, stroke.first().y)
                for (i in 1 until stroke.size) lineTo(stroke[i].x, stroke[i].y)
            }
            drawPath(path, color = Color(0xFF0F172A), style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round))
        }
    }
}`,
    android_manifest: `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.fieldnora.technician">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.CALL_PHONE" />

    <application
        android:name=".FieldNoraApplication"
        android:label="@string/app_name"
        android:theme="@style/Theme.FieldNora">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.FieldNora">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Smartphone className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Native Android App (Pure Kotlin + Jetpack Compose)
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Android Studio APK Ready
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Full native Android application developed purely in <strong>Kotlin 1.9</strong> and <strong>Jetpack Compose (Material 3)</strong>.
              All React Native/Expo dependencies have been completely removed. Ready to open directly in <strong>Android Studio</strong> with full Gradle wrapper and API 34 support.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleDownloadZip}
              className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold bg-[#14B8A6] hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Android Project (.zip)
            </button>
            <a
              href="#build-guide"
              className="px-3.5 py-2 text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              View Gradle Commands
            </a>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Package ID</span>
            <span className="text-xs font-bold text-slate-900 font-mono truncate block mt-0.5">
              com.fieldnora.technician
            </span>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-emerald-700 font-medium block">Native Language & UI</span>
            <span className="text-sm font-bold text-emerald-900 font-mono mt-0.5 block">
              Kotlin + Jetpack Compose
            </span>
          </div>
          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100">
            <span className="text-sky-700 font-medium block">Android SDK Target</span>
            <span className="text-sm font-bold text-sky-900 font-mono mt-0.5 block">
              API 34 (Android 14)
            </span>
          </div>
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100">
            <span className="text-teal-700 font-medium block">Output Release APK</span>
            <span className="text-xs font-bold text-teal-900 font-mono mt-0.5 block">
              app-release.apk
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout: Build Steps vs Interactive Phone Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Android Studio APK Build Guide */}
        <div id="build-guide" className="lg:col-span-7 space-y-5">
          
          {/* Step-by-Step Instructions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-teal-600" />
                How to Open &amp; Build in Android Studio
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">Android Studio Iguana / Koala</span>
            </div>

            {/* Step 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                  Open the "android" Directory in Android Studio
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-teal-700">A.</span>
                  <span>Launch <strong>Android Studio</strong> and select <strong>File ➔ Open</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-teal-700">B.</span>
                  <span>Select the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">android/</code> folder of this project.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-teal-700">C.</span>
                  <span>Android Studio will automatically detect the Gradle project and trigger Gradle Sync.</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                  Build Release or Debug APK
                </span>
                <button
                  onClick={() => handleCopy('cd android && ./gradlew assembleRelease', 'step2')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700"
                  title="Copy command"
                >
                  {copiedKey === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-xs text-slate-700 space-y-1.5">
                <p><strong>Via Android Studio Menu:</strong> Click <strong>Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)</strong>.</p>
                <p><strong>Via Terminal / Command Line:</strong></p>
                <pre className="text-xs font-mono bg-slate-900 text-emerald-300 p-2.5 rounded-lg overflow-x-auto">
                  cd android && ./gradlew assembleRelease
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">3</span>
                  Output APK Location
                </span>
              </div>
              <div className="text-xs text-slate-700 space-y-1.5">
                <div className="p-2 bg-white rounded border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Generated APK Path:</span>
                    <div className="font-mono text-[10px] text-slate-600 break-all select-all mt-0.5">
                      android/app/build/outputs/apk/release/app-release.apk
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Ready to install on any Android phone via USB using <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">adb install app-release.apk</code> or direct download.
                </p>
              </div>
            </div>
          </div>

          {/* Code Viewer Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-teal-600" />
                Native Kotlin Source Code Inspector
              </h3>
              <button
                onClick={() => handleCopy(codeSnippets[activeCodeTab], 'code_tab')}
                className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900"
              >
                {copiedKey === 'code_tab' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy File
              </button>
            </div>

            <div className="flex gap-1.5 border-b border-slate-100 pb-2 overflow-x-auto text-xs">
              {[
                { key: 'main_activity', label: 'MainActivity.kt' },
                { key: 'build_gradle', label: 'build.gradle.kts' },
                { key: 'job_detail', label: 'JobDetailScreen.kt (Intents)' },
                { key: 'signature_screen', label: 'SignatureScreen.kt (Canvas)' },
                { key: 'android_manifest', label: 'AndroidManifest.xml' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCodeTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeCodeTab === tab.key
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <pre className="text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-xl overflow-x-auto max-h-72 leading-relaxed">
              {codeSnippets[activeCodeTab]}
            </pre>
          </div>
        </div>

        {/* Right Column (5 Cols): Live Mobile Device Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900">
                Native Kotlin Jetpack Compose Simulator
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Material 3
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-full max-w-[340px] mx-auto bg-slate-950 p-3 rounded-[38px] shadow-2xl border-4 border-slate-800">
            {/* Camera Hole / Speaker notch */}
            <div className="flex justify-center mb-2">
              <div className="w-16 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Screen Canvas */}
            <div className="bg-[#F8FAFC] rounded-[28px] overflow-hidden flex flex-col h-[560px] text-slate-800 text-xs shadow-inner">
              
              {/* App Bar */}
              <div className="bg-[#0F172A] text-white p-3.5 flex items-center justify-between shrink-0">
                <div>
                  <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">fieldnora android (kotlin)</div>
                  <div className="text-xs font-bold text-white mt-0.5">Technician: Brian Kiprop</div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  4G Online
                </span>
              </div>

              {/* Sub-view Content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {mobileTab === 'jobs' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] px-1 font-bold text-slate-700">
                      <span>Today's Dispatched Orders</span>
                      <span className="text-teal-600">2 Assigned</span>
                    </div>

                    {/* Job Card 1 */}
                    <div
                      onClick={() => setMobileTab('detail')}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                            WO-2026-089
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs mt-1">Commercial HVAC Diagnostic</h4>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                          IN PROGRESS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        VRF unit error code E3 in server room. Check refrigerant pressure.
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                        <span>📍 Westlands, Nairobi</span>
                        <span className="font-bold text-slate-800 font-mono">KES 11,500</span>
                      </div>
                    </div>

                    {/* Job Card 2 */}
                    <div
                      onClick={() => {
                        setSelectedMobileJob({
                          id: 'job-102',
                          jobNumber: 'WO-2026-090',
                          title: 'Borehole Submersible Pump Overhaul',
                          description: 'Measure static water depth and replace worn non-return foot valve.',
                          status: 'scheduled',
                          customerName: 'Karen Green Estate',
                          customerPhone: '+254 733 456 789',
                          customerAddress: 'Mbagathi Ridge, Karen, Nairobi',
                          scheduledTime: '02:00 PM',
                          totalKes: 8500
                        });
                        setMobileTab('detail');
                      }}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            WO-2026-090
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs mt-1">Borehole Submersible Pump</h4>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                          SCHEDULED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        Measure static water depth and replace worn non-return foot valve.
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                        <span>📍 Karen, Nairobi</span>
                        <span className="font-bold text-slate-800 font-mono">KES 8,500</span>
                      </div>
                    </div>
                  </div>
                )}

                {mobileTab === 'detail' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setMobileTab('jobs')}
                      className="text-[11px] font-bold text-teal-700 flex items-center gap-1"
                    >
                      ← Back to Work Orders
                    </button>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-900">{selectedMobileJob.jobNumber}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 uppercase">
                          {selectedMobileJob.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs">{selectedMobileJob.title}</h3>
                      <p className="text-[11px] text-slate-500">{selectedMobileJob.description}</p>
                      
                      <div className="pt-2 border-t border-slate-100 text-[10px] space-y-1">
                        <div><strong>Customer:</strong> {selectedMobileJob.customerName}</div>
                        <div><strong>Location:</strong> {selectedMobileJob.customerAddress}</div>
                      </div>

                      {/* Native Mobile Actions */}
                      <div className="grid grid-cols-3 gap-1 pt-2">
                        <button
                          onClick={() => showToast('Triggering native Google Maps GPS intent...', 'info')}
                          className="p-1.5 bg-slate-900 text-white rounded text-[10px] font-bold text-center"
                        >
                          🗺️ GPS Nav
                        </button>
                        <button
                          onClick={() => showToast(`Triggering native phone call to ${selectedMobileJob.customerPhone}...`, 'info')}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold text-center"
                        >
                          📞 Call
                        </button>
                        <button
                          onClick={() => showToast('Opening WhatsApp dispatch intent...', 'info')}
                          className="p-1.5 bg-emerald-600 text-white rounded text-[10px] font-bold text-center"
                        >
                          💬 WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Progression Workflow */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Technician On-Site Progress
                      </span>
                      <button
                        onClick={() => {
                          showToast('Digital touch signature captured on native Compose Canvas & synced to KRA eTIMS invoice!', 'success');
                          setSelectedMobileJob((prev: any) => ({ ...prev, status: 'completed' }));
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Capture Customer Sign-Off
                      </button>
                    </div>
                  </div>
                )}

                {mobileTab === 'inventory' && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Van Stock & Consumables</span>
                    {[
                      { sku: 'GAS-R410A', name: 'R410A Refrigerant (1kg)', stock: '24 kg', price: 'KES 3,500' },
                      { sku: 'ELEC-CB-32', name: 'Schneider 32A 1-Pole MCB', stock: '40 pcs', price: 'KES 1,200' },
                      { sku: 'PLUMB-PPR-25', name: 'PPR Pipe PN20 25mm', stock: '65 lengths', price: 'KES 850' },
                      { sku: 'SEC-IP-4MP', name: 'Hikvision 4MP IP Dome', stock: '15 pcs', price: 'KES 6,500' }
                    ].map(item => (
                      <div key={item.sku} className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[9px] font-mono text-slate-400">{item.sku} · {item.stock} in van</div>
                        </div>
                        <div className="font-bold text-teal-800 font-mono">{item.price}</div>
                      </div>
                    ))}
                  </div>
                )}

                {mobileTab === 'settings' && (
                  <div className="space-y-2.5 text-[11px]">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-900 block">Kotlin Retrofit Gateway</span>
                      <p className="text-slate-500 text-[10px]">
                        OkHttp 4.12 client connected to Cloud Run API. Offline cache synchronized.
                      </p>
                      <button
                        onClick={() => showToast('Kotlin StateFlow database synced with backend!', 'success')}
                        className="w-full py-1.5 bg-[#0F172A] text-white rounded font-bold text-[10px] mt-1"
                      >
                        Sync Now
                      </button>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 block">Native App Spec</span>
                      <div className="text-slate-500 text-[10px]">Language: Kotlin 1.9.23</div>
                      <div className="text-slate-500 text-[10px]">UI Engine: Jetpack Compose (Material 3)</div>
                      <div className="text-slate-500 text-[10px]">Target SDK: Android 14 (API 34)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom NavigationBar */}
              <div className="bg-[#0F172A] text-white py-2 px-3 border-t border-slate-800 flex items-center justify-around shrink-0 text-[10px]">
                <button
                  onClick={() => setMobileTab('jobs')}
                  className={`flex flex-col items-center ${mobileTab === 'jobs' || mobileTab === 'detail' ? 'text-teal-400 font-bold' : 'text-slate-400'}`}
                >
                  <span>📋</span>
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => setMobileTab('inventory')}
                  className={`flex flex-col items-center ${mobileTab === 'inventory' ? 'text-teal-400 font-bold' : 'text-slate-400'}`}
                >
                  <span>📦</span>
                  <span>Van Stock</span>
                </button>
                <button
                  onClick={() => setMobileTab('settings')}
                  className={`flex flex-col items-center ${mobileTab === 'settings' ? 'text-teal-400 font-bold' : 'text-slate-400'}`}
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
