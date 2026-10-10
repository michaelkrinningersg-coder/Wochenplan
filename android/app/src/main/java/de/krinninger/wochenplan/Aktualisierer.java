package de.krinninger.wochenplan;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Lädt eine neue Version der App (APK) herunter und öffnet den Android-Installer.
 * Android fragt dabei immer selbst nach – ohne Bestätigung wird nichts installiert.
 */
@CapacitorPlugin(name = "Aktualisierer")
public class Aktualisierer extends Plugin {

    @PluginMethod
    public void version(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            long code = Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode;
            ret.put("code", code);
            ret.put("name", info.versionName);
        } catch (Exception e) {
            ret.put("code", 0);
            ret.put("name", "");
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void installieren(PluginCall call) {
        String adresse = call.getString("url");
        if (adresse == null || !adresse.startsWith("https://")) {
            call.reject("Ungültige Adresse");
            return;
        }
        new Thread(() -> {
            try {
                File ordner = new File(getContext().getCacheDir(), "update");
                if (!ordner.exists() && !ordner.mkdirs()) throw new Exception("Kein Speicherplatz");
                File datei = new File(ordner, "wochenplan.apk");
                laden(adresse, datei);
                getActivity().runOnUiThread(() -> starten(call, datei));
            } catch (Exception e) {
                call.reject("Download fehlgeschlagen: " + e.getMessage());
            }
        }).start();
    }

    private void laden(String adresse, File ziel) throws Exception {
        URL url = new URL(adresse);
        HttpURLConnection verbindung = null;
        // Weiterleitungen (GitHub → Download-Server) selbst folgen
        for (int i = 0; i < 6; i++) {
            verbindung = (HttpURLConnection) url.openConnection();
            verbindung.setInstanceFollowRedirects(false);
            verbindung.setConnectTimeout(20000);
            verbindung.setReadTimeout(60000);
            int status = verbindung.getResponseCode();
            if (status >= 300 && status < 400) {
                String weiter = verbindung.getHeaderField("Location");
                verbindung.disconnect();
                url = new URL(url, weiter);
                continue;
            }
            if (status != 200) throw new Exception("Server antwortet mit " + status);
            break;
        }
        long gesamt = verbindung.getContentLengthLong();
        long geladen = 0;
        int letzte = -1;
        try (InputStream ein = verbindung.getInputStream(); OutputStream aus = new FileOutputStream(ziel)) {
            byte[] puffer = new byte[65536];
            int n;
            while ((n = ein.read(puffer)) > 0) {
                aus.write(puffer, 0, n);
                geladen += n;
                if (gesamt > 0) {
                    int prozent = (int) (geladen * 100 / gesamt);
                    if (prozent != letzte) {
                        letzte = prozent;
                        JSObject p = new JSObject();
                        p.put("prozent", prozent);
                        notifyListeners("fortschritt", p);
                    }
                }
            }
        } finally {
            verbindung.disconnect();
        }
    }

    private void starten(PluginCall call, File datei) {
        JSObject ret = new JSObject();
        // Ab Android 8 muss die App einmalig „Unbekannte Apps installieren“ dürfen
        if (Build.VERSION.SDK_INT >= 26 && !getContext().getPackageManager().canRequestPackageInstalls()) {
            try {
                Intent erlaubnis = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
                erlaubnis.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(erlaubnis);
                ret.put("status", "erlaubnis");
            } catch (ActivityNotFoundException e) {
                ret.put("status", "erlaubnis-manuell");
            }
            call.resolve(ret);
            return;
        }
        try {
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", datei);
            Intent installer = new Intent(Intent.ACTION_VIEW);
            installer.setDataAndType(uri, "application/vnd.android.package-archive");
            installer.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(installer);
            ret.put("status", "gestartet");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Installer konnte nicht geöffnet werden: " + e.getMessage());
        }
    }
}
