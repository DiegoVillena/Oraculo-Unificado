package com.oraculounificado.app;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Habilitar debugging de WebView solo en compilaciones de depuración.
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        super.onCreate(savedInstanceState);

        // Registrar interfaz JS → nativo para copiar al portapapeles de Android.
        // navigator.clipboard.writeText() NO funciona en WebView sin HTTPS,
        // así que exponemos un puente nativo accesible como AndroidClipboard.copy(text).
        WebView webView = bridge != null ? bridge.getWebView() : null;
        if (webView != null) {
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void copy(String text) {
                    ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                    ClipData clip = ClipData.newPlainText("Oraculo", text);
                    clipboard.setPrimaryClip(clip);
                }
                @JavascriptInterface
                public String read() {
                    ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                    if (clipboard != null && clipboard.hasPrimaryClip()) {
                        ClipData.Item item = clipboard.getPrimaryClip().getItemAt(0);
                        if (item != null) {
                            CharSequence text = item.getText();
                            return text != null ? text.toString() : "";
                        }
                    }
                    return "";
                }
            }, "AndroidClipboard");

            // Puente JS → nativo para abrir el menú "Compartir" de Android.
            // navigator.share() NO funciona en WebView sin HTTPS, así que exponemos
            // AndroidShare.share(text) que lanza un Intent.ACTION_SEND de texto plano
            // y abre WhatsApp, email, etc.
            // IMPORTANTE: Las @JavascriptInterface se ejecutan en un hilo de fondo del
            // WebView, NO en el hilo principal. Lanzar una Activity desde un hilo
            // secundario causa un crash, así que usamos runOnUiThread.
            // Para textos largos, EXTRA_TEXT puede truncarse (límite del Binder ~1MB,
            // y algunas apps receptoras tienen límites propios). Por eso, además de
            // EXTRA_TEXT, escribimos el texto en un archivo .txt temporal y lo
            // adjuntamos con EXTRA_STREAM vía FileProvider. Las apps que soportan
            // archivos (email, Drive, etc.) recibirán el texto completo.
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void share(String text) {
                    final String texto = text;
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            // Evitar lanzar varios choosers apilados si el usuario
                            // pulsa varias veces seguidas el botón de compartir.
                            if (isFinishing() || isDestroyed()) return;
                            Intent sendIntent = new Intent(Intent.ACTION_SEND);
                            sendIntent.setType("text/plain");
                            sendIntent.putExtra(Intent.EXTRA_TEXT, texto);
                            // ClipData soporta textos largos mejor que EXTRA_TEXT solo.
                            ClipData clip = ClipData.newPlainText("Oraculo", texto);
                            sendIntent.setClipData(clip);

                            // Para textos largos: escribir archivo .txt temporal y
                            // adjuntarlo con EXTRA_STREAM para que se comparta completo.
                            if (texto.length() > 500) {
                                Uri fileUri = escribirTxtTemporal(texto);
                                if (fileUri != null) {
                                    sendIntent.putExtra(Intent.EXTRA_STREAM, fileUri);
                                    // Añadir permiso de lectura para el URI del archivo
                                    sendIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                }
                            }

                            // FLAG_ACTIVITY_NEW_TASK para que el chooser se abra en
                            // su propia task y no se apile dentro de la app.
                            sendIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            Intent chooser = Intent.createChooser(sendIntent, "Compartir");
                            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            try {
                                startActivity(chooser);
                            } catch (android.content.ActivityNotFoundException e) {
                                // No hay apps que puedan manejar el Intent
                            }
                        }
                    });
                }
            }, "AndroidShare");
        }

        // Botón físico atrás de Android.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = bridge != null ? bridge.getWebView() : null;
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });
    }

    /**
     * Escribe el texto en un archivo .txt temporal en el cache de la app y
     * devuelve una Uri FileProvider para compartirlo. Esto asegura que las apps
     * receptoras que soportan archivos reciban el texto completo sin truncamiento.
     */
    private Uri escribirTxtTemporal(String texto) {
        try {
            File cacheDir = new File(getCacheDir(), "share");
            if (!cacheDir.exists()) cacheDir.mkdirs();
            File file = new File(cacheDir, "oraculo_compartir.txt");
            FileOutputStream fos = new FileOutputStream(file);
            fos.write(texto.getBytes("UTF-8"));
            fos.close();
            return FileProvider.getUriForFile(this,
                    getPackageName() + ".fileprovider", file);
        } catch (IOException e) {
            return null;
        }
    }

    @Override
    public void onBackPressed() {
        WebView webView = this.bridge != null ? this.bridge.getWebView() : null;
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }
}