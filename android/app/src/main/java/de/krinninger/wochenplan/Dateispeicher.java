package de.krinninger.wochenplan;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Gemeinsame Abgleich-Datei, die die Familie selbst wählt (Android-Dateiauswahl: Google Drive, Nextcloud, Gerät …).
 * Die App merkt sich nur die Adresse der Datei; der Inhalt ist schon in der Web-Oberfläche verschlüsselt.
 */
@CapacitorPlugin(name = "Dateispeicher")
public class Dateispeicher extends Plugin {
    private static final String PREFS = "dateispeicher";
    private static final String KEY = "uri";

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private Uri uri() {
        String s = prefs().getString(KEY, null);
        return s == null ? null : Uri.parse(s);
    }

    private String name(Uri u) {
        try (Cursor c = getContext().getContentResolver().query(u, null, null, null, null)) {
            if (c != null && c.moveToFirst()) {
                int i = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (i >= 0) return c.getString(i);
            }
        } catch (Exception ignored) {
        }
        return u.getLastPathSegment();
    }

    @PluginMethod
    public void info(PluginCall call) {
        JSObject r = new JSObject();
        Uri u = uri();
        r.put("gewaehlt", u != null);
        if (u != null) r.put("name", name(u));
        call.resolve(r);
    }

    /** neu = true: neue Datei anlegen; sonst vorhandene Datei wählen */
    @PluginMethod
    public void waehlen(PluginCall call) {
        boolean neu = Boolean.TRUE.equals(call.getBoolean("neu", false));
        Intent i = new Intent(neu ? Intent.ACTION_CREATE_DOCUMENT : Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType(neu ? "application/json" : "*/*");
        if (neu) i.putExtra(Intent.EXTRA_TITLE, "wochenplan-abgleich.json");
        i.addFlags(
            Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, i, "waehlenErgebnis");
    }

    @ActivityCallback
    private void waehlenErgebnis(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("abgebrochen");
            return;
        }
        Uri u = result.getData().getData();
        try {
            getContext()
                .getContentResolver()
                .takePersistableUriPermission(u, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        } catch (Exception e) {
            call.reject("Der Zugriff auf die Datei konnte nicht gemerkt werden: " + e.getMessage());
            return;
        }
        prefs().edit().putString(KEY, u.toString()).apply();
        JSObject r = new JSObject();
        r.put("name", name(u));
        call.resolve(r);
    }

    @PluginMethod
    public void lesen(PluginCall call) {
        Uri u = uri();
        if (u == null) {
            call.reject("Keine Datei gewählt.");
            return;
        }
        new Thread(() -> {
            try (InputStream in = getContext().getContentResolver().openInputStream(u)) {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                byte[] buf = new byte[8192];
                int n;
                while (in != null && (n = in.read(buf)) > 0) out.write(buf, 0, n);
                JSObject r = new JSObject();
                r.put("text", new String(out.toByteArray(), StandardCharsets.UTF_8));
                call.resolve(r);
            } catch (Exception e) {
                call.reject("Die Datei konnte nicht gelesen werden: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void schreiben(PluginCall call) {
        Uri u = uri();
        String text = call.getString("text");
        if (u == null || text == null) {
            call.reject("Keine Datei gewählt.");
            return;
        }
        new Thread(() -> {
            // „wt“ = vorhandenen Inhalt ersetzen
            try (OutputStream out = getContext().getContentResolver().openOutputStream(u, "wt")) {
                if (out == null) throw new Exception("kein Zugriff");
                out.write(text.getBytes(StandardCharsets.UTF_8));
                out.flush();
                call.resolve();
            } catch (Exception e) {
                call.reject("Die Datei konnte nicht geschrieben werden: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void trennen(PluginCall call) {
        prefs().edit().remove(KEY).apply();
        call.resolve();
    }
}
