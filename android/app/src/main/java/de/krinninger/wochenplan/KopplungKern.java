package de.krinninger.wochenplan;

import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Kopplung im WLAN ohne Server: Der Fernseher wartet auf einem Port, das Handy findet ihn per UDP-Rundruf
 * und schickt den (bereits verschlüsselten) Plan direkt per TCP. Keine Android-Klassen, damit es sich einzeln testen lässt.
 *
 * Ablauf Empfang: "WP1\n<Länge>\n<Daten>" → der Empfänger antwortet "OK\n" oder "FALSCH\n".
 * Ablauf Suche:   UDP "WP?" → Antwort "WP!<TCP-Port>!<Name>".
 */
public class KopplungKern {
    public static final int SUCH_PORT = 8765;
    private static final int MAX_BYTES = 20_000_000;

    /** Wird für jede empfangene Nachricht aufgerufen und liefert, ob sie angenommen wurde. */
    public interface Annahme {
        boolean annehmen(String daten) throws Exception;
    }

    public static class Fund {
        public final String ip;
        public final int port;
        public final String name;

        Fund(String ip, int port, String name) {
            this.ip = ip;
            this.port = port;
            this.name = name;
        }
    }

    // ---------- Empfänger ----------

    private ServerSocket server;
    private DatagramSocket rundruf;
    private volatile boolean laeuft;

    public synchronized int starten(String name, Annahme annahme) throws IOException {
        stoppen();
        try {
            server = new ServerSocket(SUCH_PORT);
        } catch (IOException e) {
            server = new ServerSocket(0);
        }
        final ServerSocket s = server;
        laeuft = true;
        final int port = s.getLocalPort();

        Thread tcp = new Thread(() -> {
            while (laeuft && !s.isClosed()) {
                try (Socket c = s.accept()) {
                    c.setSoTimeout(15_000);
                    bearbeiten(c, annahme);
                } catch (Exception e) {
                    if (s.isClosed()) break;
                }
            }
        }, "kopplung-tcp");
        tcp.setDaemon(true);
        tcp.start();

        try {
            rundruf = new DatagramSocket(null);
            rundruf.setReuseAddress(true);
            rundruf.bind(new InetSocketAddress(SUCH_PORT));
            final DatagramSocket u = rundruf;
            Thread udp = new Thread(() -> {
                byte[] puffer = new byte[256];
                while (laeuft && !u.isClosed()) {
                    try {
                        DatagramPacket p = new DatagramPacket(puffer, puffer.length);
                        u.receive(p);
                        String text = new String(p.getData(), 0, p.getLength(), StandardCharsets.UTF_8);
                        if (text.equals("WP?")) {
                            byte[] antwort = ("WP!" + port + "!" + name).getBytes(StandardCharsets.UTF_8);
                            u.send(new DatagramPacket(antwort, antwort.length, p.getAddress(), p.getPort()));
                        }
                    } catch (Exception e) {
                        if (u.isClosed()) break;
                    }
                }
            }, "kopplung-udp");
            udp.setDaemon(true);
            udp.start();
        } catch (Exception e) {
            // Ohne Rundruf-Port geht die Kopplung trotzdem, dann per IP-Adresse
            rundruf = null;
        }
        return port;
    }

    private void bearbeiten(Socket c, Annahme annahme) throws Exception {
        DataInputStream in = new DataInputStream(c.getInputStream());
        OutputStream out = c.getOutputStream();
        if (!"WP1".equals(zeile(in))) return;
        int laenge;
        try {
            laenge = Integer.parseInt(zeile(in).trim());
        } catch (NumberFormatException e) {
            return;
        }
        if (laenge <= 0 || laenge > MAX_BYTES) {
            out.write("ZUGROSS\n".getBytes(StandardCharsets.UTF_8));
            return;
        }
        byte[] daten = new byte[laenge];
        in.readFully(daten);
        boolean ok = false;
        try {
            ok = annahme.annehmen(new String(daten, StandardCharsets.UTF_8));
        } catch (Exception e) {
            ok = false;
        }
        out.write((ok ? "OK\n" : "FALSCH\n").getBytes(StandardCharsets.UTF_8));
        out.flush();
    }

    private static String zeile(InputStream in) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        int z;
        while ((z = in.read()) != -1 && z != '\n') {
            if (b.size() > 64) throw new IOException("Zeile zu lang");
            b.write(z);
        }
        return new String(b.toByteArray(), StandardCharsets.UTF_8);
    }

    public synchronized void stoppen() {
        laeuft = false;
        try {
            if (server != null) server.close();
        } catch (IOException ignore) {
        }
        if (rundruf != null) rundruf.close();
        server = null;
        rundruf = null;
    }

    // ---------- Sender ----------

    /** Eigene IPv4-Adresse im WLAN/LAN (für die Anzeige auf dem Fernseher). */
    public static String lokaleIp() {
        try {
            for (NetworkInterface n : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                if (!n.isUp() || n.isLoopback()) continue;
                for (InetAddress a : Collections.list(n.getInetAddresses())) {
                    if (a instanceof Inet4Address && a.isSiteLocalAddress()) return a.getHostAddress();
                }
            }
        } catch (Exception ignore) {
        }
        return "";
    }

    /** Sucht Fernseher im selben Netz (UDP-Rundruf). */
    public static List<Fund> suchen(int wartenMs) {
        Map<String, Fund> funde = new LinkedHashMap<>();
        try (DatagramSocket s = new DatagramSocket()) {
            s.setBroadcast(true);
            byte[] frage = "WP?".getBytes(StandardCharsets.UTF_8);
            List<InetAddress> ziele = new ArrayList<>();
            ziele.add(InetAddress.getByName("255.255.255.255"));
            try {
                for (NetworkInterface n : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                    if (!n.isUp() || n.isLoopback()) continue;
                    for (InterfaceAddress ia : n.getInterfaceAddresses()) {
                        if (ia.getBroadcast() != null) ziele.add(ia.getBroadcast());
                    }
                }
            } catch (Exception ignore) {
            }
            for (InetAddress z : ziele) {
                try {
                    s.send(new DatagramPacket(frage, frage.length, z, SUCH_PORT));
                } catch (Exception ignore) {
                }
            }
            long ende = System.currentTimeMillis() + wartenMs;
            byte[] puffer = new byte[256];
            while (true) {
                long rest = ende - System.currentTimeMillis();
                if (rest <= 0) break;
                s.setSoTimeout((int) rest);
                try {
                    DatagramPacket p = new DatagramPacket(puffer, puffer.length);
                    s.receive(p);
                    String t = new String(p.getData(), 0, p.getLength(), StandardCharsets.UTF_8);
                    if (!t.startsWith("WP!")) continue;
                    String[] teile = t.split("!", 3);
                    int port = Integer.parseInt(teile[1]);
                    String ip = p.getAddress().getHostAddress();
                    funde.put(ip + ":" + port, new Fund(ip, port, teile.length > 2 ? teile[2] : ip));
                } catch (java.net.SocketTimeoutException e) {
                    break;
                } catch (Exception ignore) {
                }
            }
        } catch (Exception ignore) {
        }
        return new ArrayList<>(funde.values());
    }

    /** Schickt die Daten und gibt die Antwort des Fernsehers zurück ("OK", "FALSCH", …). */
    public static String senden(String ip, int port, String daten) throws IOException {
        byte[] bytes = daten.getBytes(StandardCharsets.UTF_8);
        try (Socket c = new Socket()) {
            c.connect(new InetSocketAddress(ip, port), 5_000);
            c.setSoTimeout(30_000);
            OutputStream out = c.getOutputStream();
            out.write(("WP1\n" + bytes.length + "\n").getBytes(StandardCharsets.UTF_8));
            out.write(bytes);
            out.flush();
            return zeile(c.getInputStream()).trim();
        }
    }
}
