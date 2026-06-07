# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ─────────────────────────────────────────────────────────────────────────────
# Capacitor + Cordova keep rules
#
# This is a Capacitor (WebView) app: the real app lives in assets/www and is
# NOT touched by R8 — R8 only minifies the thin Android/Java shell. Capacitor
# and Cordova resolve plugins by reflection and expose methods to the JS bridge,
# so those classes/members must be kept or plugin calls fail silently at runtime.
# ─────────────────────────────────────────────────────────────────────────────

# Keep the Capacitor framework and all plugins (resolved via reflection).
-keep public class com.getcapacitor.** { *; }
-keep public class com.getcapacitor.plugin.** { *; }

# Keep any class annotated as a Capacitor plugin, plus its bridge-exposed members.
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.annotation.CapacitorPlugin *;
    @com.getcapacitor.PluginMethod public <methods>;
}

# Keep Cordova plugins bridged through capacitor-cordova-android-plugins.
-keep class org.apache.cordova.** { *; }
-keep public class * extends org.apache.cordova.CordovaPlugin { *; }

# Keep classes referenced from JS via @JavascriptInterface.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Annotations drive Capacitor's reflective plugin resolution — keep them.
-keepattributes *Annotation*, JavascriptInterface

# Preserve line numbers so release stack traces remain debuggable, but hide the
# original source file names (no information leak, still readable traces).
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
