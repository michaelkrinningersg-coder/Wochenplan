package de.krinninger.wochenplan;

import android.os.Build;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Plan im WLAN direkt von Handy zu Fernseher übertragen – ohne Server.
 * Die Daten sind schon in der Web-Oberfläche mit dem Kopplungscode verschlüsselt.
 */
@CapacitorPlugin(name = "Kopplung")
public class Kopplung extends Plugin {
    private final KopplungKern kern = new KopplungKern();
    private volatile CountDownLatch warten;
    private volatile boolean antwortOk;

    @PluginMethod
    public void empfangen(PluginCall call) {
        try {
            String name = Build.MODEL != null ? Build.MODEL : "Fernseher";
            int port = kern.starten(name, daten -> {
                CountDownLatch l = new CountDownLatch(1);
                warten = l;
                antwortOk = false;
                JSObject o = new JSObject();
                o.put("daten", daten);
                notifyListeners("empfangen", o);
                // Die Web-Oberfläche entscheidet (Code richtig?) und meldet es mit antworten()
                l.await(20, TimeUnit.SECONDS);
                return antwortOk;
            });
            JSObject r = new JSObject();
            r.put("ip", KopplungKern.lokaleIp());
            r.put("port", port);
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Der Empfang konnte nicht gestartet werden: " + e.getMessage());
        }
    }

    @PluginMethod
    public void antworten(PluginCall call) {
        antwortOk = Boolean.TRUE.equals(call.getBoolean("ok", false));
        CountDownLatch l = warten;
        if (l != null) l.countDown();
        call.resolve();
    }

    @PluginMethod
    public void stoppen(PluginCall call) {
        kern.stoppen();
        CountDownLatch l = warten;
        if (l != null) l.countDown();
        call.resolve();
    }

    @PluginMethod
    public void suchen(PluginCall call) {
        new Thread(() -> {
            List<KopplungKern.Fund> funde = KopplungKern.suchen(2000);
            JSArray liste = new JSArray();
            for (KopplungKern.Fund f : funde) {
                JSObject o = new JSObject();
                o.put("ip", f.ip);
                o.put("port", f.port);
                o.put("name", f.name);
                liste.put(o);
            }
            JSObject r = new JSObject();
            r.put("geraete", liste);
            call.resolve(r);
        }, "kopplung-suchen").start();
    }

    @PluginMethod
    public void senden(PluginCall call) {
        final String ip = call.getString("ip");
        final Integer port = call.getInt("port", KopplungKern.SUCH_PORT);
        final String daten = call.getString("daten");
        if (ip == null || daten == null) {
            call.reject("Angaben fehlen");
            return;
        }
        new Thread(() -> {
            try {
                String antwort = KopplungKern.senden(ip, port, daten);
                JSObject r = new JSObject();
                r.put("antwort", antwort);
                call.resolve(r);
            } catch (Exception e) {
                call.reject("Keine Verbindung zum Fernseher: " + e.getMessage());
            }
        }, "kopplung-senden").start();
    }

    @Override
    protected void handleOnDestroy() {
        kern.stoppen();
    }
}
