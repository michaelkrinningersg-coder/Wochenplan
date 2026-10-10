package de.krinninger.wochenplan;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // eigenes Plugin für Updates aus der App heraus
        registerPlugin(Aktualisierer.class);
        // Plan im WLAN vom Handy auf den Fernseher übertragen
        registerPlugin(Kopplung.class);
        // frei gewählte Abgleich-Datei (Drive, Nextcloud, Gerät)
        registerPlugin(Dateispeicher.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        // Fernbedienung: Die Web-Oberfläche soll die Pfeiltasten direkt bekommen
        if (getBridge() != null) {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.setFocusable(true);
                webView.setFocusableInTouchMode(true);
                webView.requestFocus();
            }
        }
    }
}
