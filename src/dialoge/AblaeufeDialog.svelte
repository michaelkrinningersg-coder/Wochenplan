<script lang="ts">
  // Tagesabläufe (Presets): speichern, umbenennen, einer Woche oder einem Datum zuordnen, Tage kopieren
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { ABSCHNITTE, TAGE, tagName } from '../lib/konstanten'
  import { app, zeigeHinweis } from '../lib/speicher.svelte'
  import { neueId } from '../lib/startplan'
  import type { TagId } from '../lib/typen'
  import { ausKey, datumKey } from '../lib/zeit'

  // ---------- gespeicherte Abläufe ----------
  let neuName = $state('')
  let neuAus = $state<TagId>('mo')
  let loeschenId = $state<string | null>(null)

  function speichernAus() {
    const name = neuName.trim()
    if (!name) return
    const quelle = $state.snapshot(app.plan.woche[neuAus])
    const kopie = {} as typeof quelle
    for (const ab of ABSCHNITTE) kopie[ab.id] = (quelle[ab.id] ?? []).map((x) => ({ ...x, id: neueId() }))
    app.plan.vorlagen.push({ id: neueId(), name: name.slice(0, 40), tag: kopie })
    neuName = ''
    zeigeHinweis(`Ablauf „${name}“ gespeichert`)
  }
  function loeschen(id: string) {
    app.plan.vorlagen = app.plan.vorlagen.filter((v) => v.id !== id)
    for (const [d, vid] of Object.entries(app.plan.datumVorlage)) if (vid === id) delete app.plan.datumVorlage[d]
    loeschenId = null
  }
  function vorlageName(id: string) {
    return app.plan.vorlagen.find((v) => v.id === id)?.name ?? ''
  }

  // ---------- Woche zuordnen ----------
  function montag(d: Date): Date {
    const m = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    m.setDate(m.getDate() - ((m.getDay() + 6) % 7))
    return m
  }
  let wochenStart = $state(montag(new Date()))
  let ziel = $state<'standard' | 'woche'>('woche')
  let wahlWerktag = $state('')
  let wahlSa = $state('')
  let wahlSo = $state('')

  const wochenTage = $derived(
    TAGE.map((t, i) => {
      const d = new Date(wochenStart)
      d.setDate(d.getDate() + i)
      return { id: t.id, key: datumKey(d), d }
    }),
  )
  const kurzDatum = (d: Date) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' })
  const kw = $derived.by(() => {
    const d = new Date(wochenStart)
    d.setDate(d.getDate() + 3)
    const jan4 = new Date(d.getFullYear(), 0, 4)
    return 1 + Math.round(((d.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7)
  })
  function woche(schritt: number) {
    const d = new Date(wochenStart)
    d.setDate(d.getDate() + 7 * schritt)
    wochenStart = d
  }
  function wahlFuer(tag: TagId) {
    return tag === 'sa' ? wahlSa : tag === 'so' ? wahlSo : wahlWerktag
  }
  // Vorbelegung aus den bereits zugeordneten Daten der Woche
  $effect(() => {
    if (ziel !== 'woche') return
    const zu = (k: string) => app.plan.datumVorlage[k] ?? ''
    wahlWerktag = zu(wochenTage[0].key)
    wahlSa = zu(wochenTage[5].key)
    wahlSo = zu(wochenTage[6].key)
  })

  function wocheUebernehmen() {
    if (ziel === 'woche') {
      for (const w of wochenTage) {
        const id = wahlFuer(w.id)
        if (id) app.plan.datumVorlage[w.key] = id
        else delete app.plan.datumVorlage[w.key]
      }
      zeigeHinweis(`KW ${kw} (${kurzDatum(wochenTage[0].d)}–${kurzDatum(wochenTage[6].d)}) ist eingeteilt`)
    } else {
      let n = 0
      for (const t of TAGE) {
        const v = app.plan.vorlagen.find((x) => x.id === wahlFuer(t.id))
        if (!v) continue
        const quelle = $state.snapshot(v.tag)
        for (const ab of ABSCHNITTE) app.plan.woche[t.id][ab.id] = (quelle[ab.id] ?? []).map((x) => ({ ...x, id: neueId() }))
        n++
      }
      zeigeHinweis(n ? `Die Standardwoche nutzt jetzt die gewählten Abläufe (${n} Tage)` : 'Kein Ablauf gewählt')
    }
  }

  // ---------- einzelnes Datum ----------
  let datum = $state(datumKey())
  let datumWahl = $state('')
  $effect(() => {
    datumWahl = app.plan.datumVorlage[datum] ?? ''
  })
  function datumUebernehmen() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return
    if (datumWahl) app.plan.datumVorlage[datum] = datumWahl
    else delete app.plan.datumVorlage[datum]
    const text = ausKey(datum).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
    zeigeHinweis(datumWahl ? `${text}: „${vorlageName(datumWahl)}“` : `${text}: normaler Wochentag`)
  }

  // kommende Zuordnungen anzeigen
  const zuordnungen = $derived(
    Object.entries(app.plan.datumVorlage)
      .filter(([d]) => d >= datumKey())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 14),
  )
</script>

<Fenster titel="Tagesabläufe" breit>
  <div class="inhalt">
    <section>
      <h3>Gespeicherte Abläufe</h3>
      <p class="hilfe">Ein Ablauf ist ein ganzer Tag (z. B. „Kita-Tag“, „Ferien“, „Wochenende“, „Krank“).</p>
      {#if app.plan.vorlagen.length}
        <ul class="liste">
          {#each app.plan.vorlagen as v (v.id)}
            <li>
              <input type="text" bind:value={v.name} aria-label="Name des Ablaufs" maxlength="40" />
              <span class="anzahl">{ABSCHNITTE.reduce((s, ab) => s + (v.tag[ab.id]?.length ?? 0), 0)} Aufgaben</span>
              {#if loeschenId === v.id}
                <button class="knopf klein gefahr" onclick={() => loeschen(v.id)}>Wirklich löschen</button>
              {:else}
                <button class="knopf klein" onclick={() => (loeschenId = v.id)} aria-label="„{v.name}“ löschen"><Symbol name="muell" /></button>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p class="hilfe">Noch keine Abläufe gespeichert.</p>
      {/if}
      <div class="reihe neu">
        <input type="text" bind:value={neuName} placeholder="Name, z. B. Ferien" maxlength="40" aria-label="Name des neuen Ablaufs" />
        <span class="name zeile">aus</span>
        <select bind:value={neuAus} aria-label="Ablauf übernehmen von">
          {#each TAGE as t (t.id)}<option value={t.id}>{t.lang}</option>{/each}
        </select>
        <button class="knopf haupt" onclick={speichernAus} disabled={!neuName.trim()}><Symbol name="plus" />Speichern</button>
      </div>
    </section>

    <section>
      <h3>Woche einteilen</h3>
      <div class="reihe">
        <button class="knopf klein" aria-pressed={ziel === 'woche'} onclick={() => (ziel = 'woche')}>Eine bestimmte Woche</button>
        <button class="knopf klein" aria-pressed={ziel === 'standard'} onclick={() => (ziel = 'standard')}>Jede Woche (Standard)</button>
      </div>
      {#if ziel === 'woche'}
        <div class="reihe wochenwahl">
          <button class="knopf rund" onclick={() => woche(-1)} aria-label="Woche davor"><Symbol name="zurueck" /></button>
          <span class="kw">KW {kw}: {kurzDatum(wochenTage[0].d)} – {kurzDatum(wochenTage[6].d)}</span>
          <button class="knopf rund" onclick={() => woche(1)} aria-label="Woche danach"><Symbol name="weiter" /></button>
        </div>
      {:else}
        <p class="hilfe">Der gewählte Ablauf wird in die normale Woche kopiert und gilt dann jede Woche. „unverändert“ lässt die Tage, wie sie sind.</p>
      {/if}
      <div class="raster">
        {#each [{ n: 'Montag bis Freitag', get: () => wahlWerktag, set: (v: string) => (wahlWerktag = v) }, { n: 'Samstag', get: () => wahlSa, set: (v: string) => (wahlSa = v) }, { n: 'Sonntag', get: () => wahlSo, set: (v: string) => (wahlSo = v) }] as z (z.n)}
          <label class="feld">
            <span class="name">{z.n}</span>
            <select value={z.get()} onchange={(e) => z.set((e.target as HTMLSelectElement).value)}>
              <option value="">{ziel === 'woche' ? 'Normaler Wochentag' : 'unverändert'}</option>
              {#each app.plan.vorlagen as v (v.id)}<option value={v.id}>{v.name}</option>{/each}
            </select>
          </label>
        {/each}
      </div>
      <div class="reihe">
        <button class="knopf haupt" onclick={wocheUebernehmen} disabled={!app.plan.vorlagen.length}><Symbol name="haken" />Übernehmen</button>
      </div>
    </section>

    <section>
      <h3>Einzelnes Datum</h3>
      <div class="reihe">
        <input type="date" bind:value={datum} aria-label="Datum" />
        <select bind:value={datumWahl} aria-label="Ablauf für dieses Datum">
          <option value="">Normaler Wochentag</option>
          {#each app.plan.vorlagen as v (v.id)}<option value={v.id}>{v.name}</option>{/each}
        </select>
        <button class="knopf haupt" onclick={datumUebernehmen}><Symbol name="haken" />Übernehmen</button>
      </div>
      {#if zuordnungen.length}
        <p class="hilfe">
          Geplant: {zuordnungen
            .map(([d, id]) => `${ausKey(d).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' })} ${vorlageName(id)}`)
            .join(' · ')}
        </p>
      {/if}
    </section>

    <section>
      <h3>Tag kopieren</h3>
      <p class="hilfe">Den normalen Ablauf eines Wochentags auf andere Tage übertragen.</p>
      <div class="reihe">
        {#each TAGE as t (t.id)}
          <button class="knopf klein" onclick={() => (app.dialog = { art: 'kopieren', tag: t.id })} aria-label="{tagName(t.id)} kopieren">
            <Symbol name="kopie" />{t.kurz}
          </button>
        {/each}
      </div>
    </section>

    <div class="reihe">
      <button class="knopf" onclick={() => (app.dialog = { art: 'einstellungen' })}><Symbol name="zurueck" />Zurück zu den Einstellungen</button>
    </div>
  </div>
</Fenster>

<style>
  .inhalt {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  h3 {
    margin: 0;
    font-family: var(--schrift-titel);
  }
  .hilfe {
    margin: 0;
    font-size: var(--t-klein);
    color: var(--tinte-leise);
  }
  .reihe {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .name {
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    font-weight: 700;
  }
  .liste {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .liste li {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .liste input {
    flex: 1;
  }
  .anzahl {
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    white-space: nowrap;
  }
  .neu input {
    flex: 1 1 12em;
  }
  input[type='text'],
  input[type='date'],
  select {
    min-width: 0;
    padding: 0.5em 0.8em;
    border: 2px solid var(--linie);
    border-radius: 14px;
    background: var(--himmel);
    color: var(--tinte);
    font: inherit;
  }
  .raster {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12em, 1fr));
    gap: 10px;
  }
  .feld {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .kw {
    font-family: var(--schrift-titel);
    font-weight: 600;
    min-width: 12em;
    text-align: center;
  }
</style>
