package de.krinninger.wochenplan;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.List;

/**
 * Einmaliger Kauf „Wochenplan Pro“ über Google Play Abrechnung.
 * Produkt-ID in der Play Console: wochenplan_pro (Einmalprodukt, nicht Abo).
 * Die Bestätigung (acknowledge) erfolgt hier; ohne sie erstattet Google den Kauf nach 3 Tagen.
 */
@CapacitorPlugin(name = "Kauf")
public class Kauf extends Plugin implements PurchasesUpdatedListener {
    static final String PRODUKT = "wochenplan_pro";

    private BillingClient client;
    private ProductDetails details;
    private PluginCall offenerKauf;

    private interface Bereit {
        void los(boolean ok);
    }

    /** Verbindung zu Google Play herstellen (bei Bedarf neu) */
    private void verbinden(Bereit danach) {
        if (client == null) {
            client = BillingClient.newBuilder(getContext())
                    .setListener(this)
                    .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                    .build();
        }
        if (client.isReady()) {
            danach.los(true);
            return;
        }
        client.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult r) {
                danach.los(r.getResponseCode() == BillingClient.BillingResponseCode.OK);
            }

            @Override
            public void onBillingServiceDisconnected() {
                // beim nächsten Aufruf wird neu verbunden
            }
        });
    }

    /** Ist „Pro“ gekauft? Bestätigt offene Käufe nebenbei. */
    private void pruefen(java.util.function.Consumer<Boolean> ergebnis) {
        client.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
                (r, liste) -> {
                    boolean pro = false;
                    if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        for (Purchase p : liste) {
                            if (p.getProducts().contains(PRODUKT) && p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                                pro = true;
                                bestaetigen(p);
                            }
                        }
                    }
                    ergebnis.accept(pro);
                });
    }

    private void bestaetigen(Purchase p) {
        if (p.isAcknowledged()) return;
        client.acknowledgePurchase(
                AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(),
                r -> { });
    }

    private void produktLaden(Runnable danach) {
        QueryProductDetailsParams.Product produkt = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(PRODUKT)
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
        client.queryProductDetailsAsync(
                QueryProductDetailsParams.newBuilder().setProductList(Collections.singletonList(produkt)).build(),
                (r, liste) -> {
                    details = (r.getResponseCode() == BillingClient.BillingResponseCode.OK && !liste.isEmpty()) ? liste.get(0) : null;
                    danach.run();
                });
    }

    @PluginMethod
    public void status(PluginCall call) {
        verbinden(ok -> {
            if (!ok) {
                JSObject o = new JSObject();
                o.put("pro", false);
                o.put("bereit", false);
                call.resolve(o);
                return;
            }
            pruefen(pro -> produktLaden(() -> {
                JSObject o = new JSObject();
                o.put("pro", pro);
                o.put("bereit", true);
                if (details != null && details.getOneTimePurchaseOfferDetails() != null) {
                    o.put("preis", details.getOneTimePurchaseOfferDetails().getFormattedPrice());
                }
                call.resolve(o);
            }));
        });
    }

    @PluginMethod
    public void wiederherstellen(PluginCall call) {
        verbinden(ok -> {
            if (!ok) {
                call.reject("Google Play ist nicht erreichbar.");
                return;
            }
            pruefen(pro -> {
                JSObject o = new JSObject();
                o.put("pro", pro);
                call.resolve(o);
            });
        });
    }

    @PluginMethod
    public void kaufen(PluginCall call) {
        verbinden(ok -> {
            if (!ok) {
                call.reject("Google Play ist nicht erreichbar.");
                return;
            }
            produktLaden(() -> {
                if (details == null) {
                    call.reject("Pro ist in Google Play noch nicht verfügbar.");
                    return;
                }
                BillingFlowParams.ProductDetailsParams pd = BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(details)
                        .build();
                BillingFlowParams fluss = BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(Collections.singletonList(pd))
                        .build();
                offenerKauf = call;
                getActivity().runOnUiThread(() -> {
                    BillingResult r = client.launchBillingFlow(getActivity(), fluss);
                    if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        offenerKauf = null;
                        call.reject("Kauf konnte nicht gestartet werden.");
                    }
                });
            });
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult r, List<Purchase> liste) {
        PluginCall call = offenerKauf;
        offenerKauf = null;
        if (call == null) return;
        int code = r.getResponseCode();
        if (code == BillingClient.BillingResponseCode.OK && liste != null) {
            boolean pro = false;
            for (Purchase p : liste) {
                if (p.getProducts().contains(PRODUKT) && p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    pro = true;
                    bestaetigen(p);
                }
            }
            JSObject o = new JSObject();
            o.put("pro", pro);
            call.resolve(o);
        } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            JSObject o = new JSObject();
            o.put("pro", false);
            call.resolve(o);
        } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            pruefen(pro -> {
                JSObject o = new JSObject();
                o.put("pro", pro);
                call.resolve(o);
            });
        } else {
            call.reject("Kauf nicht abgeschlossen (" + code + ").");
        }
    }
}
