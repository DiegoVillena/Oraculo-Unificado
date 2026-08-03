package com.oraculounificado.app;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextPaint;
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
            // AndroidShare.share(text) que lanza un Intent.ACTION_SEND y abre
            // WhatsApp, email, etc.
            // IMPORTANTE: Las @JavascriptInterface se ejecutan en un hilo de fondo del
            // WebView, NO en el hilo principal. Lanzar una Activity desde un hilo
            // secundario causa un crash, así que usamos runOnUiThread.
            //
            // Estrategia para compatibilidad universal (WhatsApp, Gmail, Telegram...):
            //   - Textos cortos: solo EXTRA_TEXT con MIME text/plain (todas las apps
            //     lo leen completo).
            //   - Textos largos: escribir un archivo .txt temporal y adjuntarlo con
            //     EXTRA_STREAM vía FileProvider. WhatsApp trunca EXTRA_TEXT a medias
            //     (límite interno propio, no evitable), pero acepta archivos sin
            //     truncar como documentos. Para que WhatsApp procese el EXTRA_STREAM,
            //     el MIME debe ser application/pdf (específico, no text/plain ni */*).
            //     Gmail y Telegram leen EXTRA_STREAM sin problema.
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

                            // Para textos largos: adjuntar PDF temporal como documento.
                            // WhatsApp trunca EXTRA_TEXT a medias (límite interno propio),
                            // pero acepta archivos PDF sin truncar. El PDF se genera con
                            // android.graphics.pdf.PdfDocument (API nativa, sin librerías).
                            // Clave para que WhatsApp procese el archivo:
                            //   1. MIME application/pdf (el específico).
                            //   2. NO incluir EXTRA_TEXT: si lo incluye, WhatsApp prioriza
                            //      el texto (truncado) e ignora el PDF.
                            //   3. NO incluir ClipData de texto: confunde al chooser y
                            //      hace que trate el intent como "text/plain" en vez de
                            //      "application/pdf". El PDF va solo por EXTRA_STREAM.
                            if (texto.length() > 500) {
                                Uri fileUri = escribirPdfTemporal(texto);
                                if (fileUri != null) {
                                    sendIntent.putExtra(Intent.EXTRA_STREAM, fileUri);
                                    sendIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                    sendIntent.setType("application/pdf");
                                } else {
                                    // Fallback si falla la generación del PDF
                                    sendIntent.setType("text/plain");
                                    sendIntent.putExtra(Intent.EXTRA_TEXT, texto);
                                }
                            } else {
                                // Texto corto: text/plain + EXTRA_TEXT, todas las apps
                                // lo leen completo sin truncar.
                                sendIntent.setType("text/plain");
                                sendIntent.putExtra(Intent.EXTRA_TEXT, texto);
                                ClipData clip = ClipData.newPlainText("Oraculo", texto);
                                sendIntent.setClipData(clip);
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

            // Puente JS → nativo para abrir URLs externas en el navegador del sistema.
            // Los <a href target="_blank"> no funcionan en WebView sin HTTPS, así que
            // exponemos AndroidOpenUrl.open(url) que lanza Intent.ACTION_VIEW.
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void open(final String url) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                Intent intent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(intent);
                            } catch (Exception e) {
                                // URL inválida o sin navegador instalado
                            }
                        }
                    });
                }
            }, "AndroidOpenUrl");

            // Puente JS → nativo para obtener el locale real del dispositivo.
            // navigator.language en WebView puede devolver 'en-US' aunque el
            // dispositivo esté en español. Este puente devuelve el locale real.
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public String get() {
                    java.util.Locale loc = java.util.Locale.getDefault();
                    return loc.getLanguage();
                }
            }, "AndroidLocale");
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
     * Genera un PDF con el texto completo y lo guarda en el cache de la app.
     * Devuelve una Uri FileProvider para compartirlo como adjunto. WhatsApp
     * acepta PDFs sin truncar (a diferencia de EXTRA_TEXT que corta a medias).
     * Usa android.graphics.pdf.PdfDocument (API nativa Android, sin librerías).
     */
    private Uri escribirPdfTemporal(String texto) {
        PdfDocument document = new PdfDocument();
        try {
            // Configuración de página A4 (595 x 842 pts)
            int pageWidth = 595;
            int pageHeight = 842;
            int margin = 36; // ~0.5 pulgada
            int contentWidth = pageWidth - margin * 2;

            TextPaint paint = new TextPaint();
            paint.setColor(Color.BLACK);
            paint.setTextSize(11);
            paint.setTypeface(Typeface.DEFAULT);
            paint.setAntiAlias(true);

            // Medir el texto y dividirlo en líneas que quepan en el ancho
            // (StaticLayout maneja el wrapping automático)
            android.text.StaticLayout.Builder builder = android.text.StaticLayout.Builder
                    .obtain(texto, 0, texto.length(), paint, contentWidth)
                    .setLineSpacing(2f, 1f);
            android.text.StaticLayout layout = builder.build();

            int lineHeight = (int) (paint.getFontMetrics().bottom - paint.getFontMetrics().top) + 2;
            int linesPerPage = (pageHeight - margin * 2) / lineHeight;
            int totalLines = layout.getLineCount();
            int numPages = (int) Math.ceil((double) totalLines / linesPerPage);
            if (numPages < 1) numPages = 1;

            int lineIdx = 0;
            for (int p = 0; p < numPages; p++) {
                PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(
                        pageWidth, pageHeight, p + 1).create();
                PdfDocument.Page page = document.startPage(pageInfo);
                android.graphics.Canvas canvas = page.getCanvas();

                int y = margin;
                int linesThisPage = Math.min(linesPerPage, totalLines - lineIdx);
                for (int i = 0; i < linesThisPage; i++) {
                    int lineStart = layout.getLineStart(lineIdx);
                    int lineEnd = layout.getLineEnd(lineIdx);
                    String line = texto.substring(lineStart, lineEnd);
                    // Eliminar saltos de línea del texto fuente
                    if (line.endsWith("\n")) line = line.substring(0, line.length() - 1);
                    canvas.drawText(line, margin, y - paint.getFontMetrics().top, paint);
                    y += lineHeight;
                    lineIdx++;
                }
                document.finishPage(page);
                if (lineIdx >= totalLines) break;
            }

            // Guardar el PDF en el cache
            File cacheDir = new File(getCacheDir(), "share");
            if (!cacheDir.exists()) cacheDir.mkdirs();
            File file = new File(cacheDir, "oraculo_resultados.pdf");
            FileOutputStream fos = new FileOutputStream(file);
            document.writeTo(fos);
            fos.close();
            document.close();
            return FileProvider.getUriForFile(this,
                    getPackageName() + ".fileprovider", file);
        } catch (IOException e) {
            document.close();
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