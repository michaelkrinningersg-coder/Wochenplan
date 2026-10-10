<script lang="ts">
  import { lokale, t } from '../lib/i18n.svelte'
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
    zeigeHinweis(t('Ablauf „{name}“ gespeichert', { name }))
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
    TAGE.map((tg, i) => {
      const d = new Date(wochenStart)
      d.setDate(d.getDate() + i)
      return { id: tg.id, key: datumKey(d), d }
    }),
  )
  const kurzDatum = (d: Date) => d.toLocaleDateString(lokale(), { day: 'numeric', month: 'numeric' })
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
      zeigeHinweis(t('KW {kw} ({von}–{bis}) ist eingeteilt', { kw, von: kurzDatum(wochenTage[0].d), bis: kurzDatum(wochenTage[6].d) }))
    } else {
      let n = 0
      for (const tg of TAGE) {
        const v = app.plan.vorlagen.find((x) => x.id === wahlFuer(tg.id))
        if (!v) continue
        const quelle = $state.snapshot(v.tag)
        for (const ab of ABSCHNITTE) app.plan.woche[tg.id][ab.id] = (quelle[ab.id] ?? []).map((x) => ({ ...x, id: neueId() }))
        n++
      }
      zeigeHinweis(n ? t('Die Standardwoche nutzt jetzt die gewählten Abläufe ({n} Tage)', { n }) : t('Kein Ablauf gewählt'))
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
    const text = ausKey(datum).toLocaleDateString(lokale(), { weekday: 'long', day: 'numeric', month: 'long' })
    zeigeHinweis(datumWahl ? t('{text}: „{name}“', { text, name: vorlageName(datumWahl) }) : t('{text}: normaler Wochentag', { text }))
  }

  // kommende Zuordnungen anzeigen
  const zuordnungen = $derived(
    Object.entries(app.plan.datumVorlage)
      .filter(([d]) => d >= datumKey())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 14),
  )
</script>

<Fenster titel={t('Tagesabläufe')} breit>
  <div class="inhalt">
    <section>
      <h3>{t('Gespeicherte Abläufe')}</h3>
      <p class="hilfe">{t('Ein Ablauf ist ein ganzer Tag (z. B. „Kita-Tag“, „Ferien“, „Wochenende“, „Krank“).')}</p>
      {#if app.plan.vorlagen.length}
        <ul class="liste">
          {#each app.plan.vorlagen as v (v.id)}
            <li>
              <input type="text" bind:value={v.name} aria-label={t('Name des Ablaufs')} maxlength="40" />
              <span class="anzahl">{t('{n} Aufgaben', { n: ABSCHNITTE.reduce((s, ab) => s + (v.tag[ab.id]?.length ?? 0), 0) })}</span>
              {#if loeschenId === v.id}
                <button class="knopf klein gefahr" onclick={() => loeschen(v.id)}>{t('Wirklich löschen')}</button>
              {:else}
                <button class="knopf klein" onclick={() => (loeschenId = v.id)} aria-label={t('„{name}“ löschen', { name: v.name })}><Symbol name="muell" /></button>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p class="hilfe">{t('Noch keine Abläufe gespeichert.')}</p>
      {/if}
      <div class="reihe neu">
        <input type="text" bind:value={neuName} placeholder={t('Name, z. B. Ferien')} maxlength="40" aria-label={t('Name des neuen Ablaufs')} />
        <span class="name zeile">{t('aus')}</span>
        <select bind:value={neuAus} aria-label={t('Ablauf übernehmen von')}>
          {#each TAGE as tg (tg.id)}<option value={tg.id}>{t(tg.lang)}</option>{/each}
        </select>
        <button class="knopf haupt" onclick={speichernAus} disabled={!neuName.trim()}><Symbol name="plus" />{t('Speichern')}</button>
      </div>
    </section>

    <section>
      <h3>{t('Woche einteilen')}</h3>
      <div class="reihe">
        <button class="knopf klein" aria-pressed={ziel === 'woche'} onclick={() => (ziel = 'woche')}>{t('Eine bestimmte Woche')}</button>
        <button class="knopf klein" aria-pressed={ziel === 'standard'} onclick={() => (ziel = 'standard')}>{t('Jede Woche (Standard)')}</button>
      </div>
      {#if ziel === 'woche'}
        <div class="reihe wochenwahl">
          <button class="knopf rund" onclick={() => woche(-1)} aria-label={t('Woche davor')}><Symbol name="zurueck" /></button>
          <span class="kw">{t('KW {kw}: {von} – {bis}', { kw, von: kurzDatum(wochenTage[0].d), bis: kurzDatum(wochenTage[6].d) })}</span>
          <button class="knopf rund" onclick={() => woche(1)} aria-label={t('Woche danach')}><Symbol name="weiter" /></button>
        </div>
      {:else}
        <p class="hilfe">{t('Der gewählte Ablauf wird in die normale Woche kopiert und gilt dann jede Woche. „unverändert“ lässt die Tage, wie sie sind.')}</p>
      {/if}
      <div class="raster">
        {#each [{ n: 'Montag bis Freitag', get: () => wahlWerktag, set: (v: string) => (wahlWerktag = v) }, { n: 'Samstag', get: () => wahlSa, set: (v: string) => (wahlSa = v) }, { n: 'Sonntag', get: () => wahlSo, set: (v: string) => (wahlSo = v) }] as z (z.n)}
          <label class="feld">
            <span class="name">{t(z.n)}</span>
            <select value={z.get()} onchange={(e) => z.set((e.target as HTMLSelectElement).value)}>
              <option value="">{ziel === 'woche' ? t('Normaler Wochentag') : t('unverändert')}</option>
              {#each app.plan.vorlagen as v (v.id)}<option value={v.id}>{v.name}</option>{/each}
            </select>
          </label>
        {/each}
      </div>
      <div class="reihe">
        <button class="knopf haupt" onclick={wocheUebernehmen} disabled={!app.plan.vorlagen.length}><Symbol name="haken" />{t('Übernehmen')}</button>
      </div>
    </section>

    <section>
      <h3>{t('Einzelnes Datum')}</h3>
      <div class="reihe">
        <input type="date" bind:value={datum} aria-label={t('Datum')} />
        <select bind:value={datumWahl} aria-label={t('Ablauf für dieses Datum')}>
          <option value="">{t('Normaler Wochentag')}</option>
          {#each app.plan.vorlagen as v (v.id)}<option value={v.id}>{v.name}</option>{/each}
        </select>
        <button class="knopf haupt" onclick={datumUebernehmen}><Symbol name="haken" />{t('Übernehmen')}</button>
      </div>
      {#if zuordnungen.length}
        <p class="hilfe">
          {t('Geplant:')} {zuordnungen
            .map(([d, id]) => `${ausKey(d).toLocaleDateString(lokale(), { weekday: 'short', day: 'numeric', month: 'numeric' })} ${vorlageName(id)}`)
            .join(' · ')}
        </p>
      {/if}
    </section>

    <section>
      <h3>{t('Tag kopieren')}</h3>
      <p class="hilfe">{t('Den normalen Ablauf eines Wochentags auf andere Tage übertragen.')}</p>
      <div class="reihe">
        {#each TAGE as tg (tg.id)}
          <button class="knopf klein" onclick={() => (app.dialog = { art: 'kopieren', tag: tg.id })} aria-label={t('{tag} kopieren', { tag: t(tagName(tg.id)) })}>
            <Symbol name="kopie" />{t(tg.kurz)}
          </button>
        {/each}
      </div>
    </section>

    <div class="reihe">
      <button class="knopf" onclick={() => (app.dialog = { art: 'einstellungen' })}><Symbol name="zurueck" />{t('Zurück zu den Einstellungen')}</button>
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
