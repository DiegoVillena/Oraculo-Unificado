# =========================================================================
# ProGuard / R8 — Reglas de ofuscación y minificación para Oráculo Unificado
# =========================================================================
# Objetivo: reducir tamaño (R8 tree-shaking) y ofuscar contra ingeniería
# inversa, SIN romper el puente JS<->Nativo de Capacitor ni los componentes
# que usan reflexión (swisseph WASM, SQLite sql.js, i18n).
# =========================================================================

# --- WebView + puente JS de Capacitor ---
# Las clases @CapacitorPlugin exponen métodos a JS vía reflexión; si R8 los
# renombra/elimina, el puente JS se rompe. Conservar miembros públicos.
-keepclassmembers @com.getcapacitor.annotation.CapacitorPlugin class * {
  public *;
}
-keepclassmembers class * {
  @android.webkit.JavascriptInterface <methods>;
}

# --- Capacitor core ---
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class com.getcapacitor.JSObject { *; }
-keep class com.getcapacitor.plugin.* { *; }
# Conservar nombres de clase referenciados desde JS vía registerPlugin().
-keep class com.oraculounificado.app.** { *; }

# --- Swiss Ephemeris (motor astrológico) ---
# swisseph se carga como WASM en la WebView (no es código Java), pero el
# FileProvider y los assets .se1/.wasm no deben tocarse. Conservar recursos.
-keep class swisseph.** { *; }
-keepclassmembers class swisseph.** { *; }

# --- SQLite / sql.js ---
# sql.js corre como WASM en la WebView; el FileProvider de Capacitor se usa
# para acceso a archivos. Conservar el FileProvider y sus paths.
-keep class androidx.core.content.FileProvider { *; }
-keep class androidx.sqlite.** { *; }
-keep class **.sqlite.** { *; }

# --- i18n (recursos strings traducidos) ---
# Los strings se acceden por nombre desde JS (data-i18n). R8 no debe eliminar
# ni renombrar recursos referenciados dinámicamente.
-keepclassmembers class **.R$string { *; }
-keep class **.R$string { *; }

# --- SplashScreen (core-splashscreen) y AppCompat ---
# Sus consumer-rules ya vienen incluidos; las conservamos por seguridad.
-keep class androidx.core.splashscreen.** { *; }
-keep class androidx.appcompat.** { *; }

# --- Metadatos de anotaciones (reflexión) ---
-keepattributes RuntimeVisibleAnnotations,AnnotationDefault,Signature,InnerClasses,EnclosingMethod

# --- Stack traces para crash reporting ---
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# --- Ofuscación agresiva ---
# Renombrar clases/miembros no públicos para dificultar la ingeniería inversa.
-repackageclasses ''
-allowaccessmodification
-overloadaggressively

# --- Eliminar logging en release ---
# Elimina las llamadas a android.util.Log y System.out/err en release, así
# no queda lógica interna en los logs del dispositivo del usuario.
-assumenosideeffects class android.util.Log {
  public static *** v(...);
  public static *** d(...);
  public static *** i(...);
  public static *** w(...);
  public static *** e(...);
}
-assumenosideeffects class java.lang.System {
  public static *** out.println(...);
  public static *** err.println(...);
}