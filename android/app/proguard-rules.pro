# FieldNora Proguard Rules
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.fieldnora.technician.data.model.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
