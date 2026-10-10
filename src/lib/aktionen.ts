import { app, oeffnen } from './speicher.svelte'
import type { AbschnittId, Aufgabe, TagId } from './typen'

/** Eine Aufgabe wurde angetippt bzw. mit OK gewählt */
export function aufgabeGewaehlt(e: MouseEvent, tag: TagId, abschnitt: AbschnittId, aufgabe: Aufgabe) {
  if (app.verschieben) {
    app.verschieben = null
    return
  }
  if (app.bearbeiten) {
    // e.detail === 0 → kam von Tastatur/Fernbedienung, nicht vom Finger
    if (e.detail === 0) app.dialog = { art: 'aktion', tag, id: aufgabe.id }
    else app.dialog = { art: 'bearbeiten', tag, abschnitt, aufgabe: { ...aufgabe }, neu: false }
    return
  }
  oeffnen({ art: 'aufgabe', tag, abschnitt, id: aufgabe.id }, null)
}
