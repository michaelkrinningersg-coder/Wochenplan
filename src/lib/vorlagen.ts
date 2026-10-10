// Bibliothek fertiger Kacheln: Name, Bild, Timer und passende Tageszeit.
// Beim Anlegen einer neuen Aufgabe kann man eine Vorlage antippen – danach lässt sich alles ändern.
import type { AbschnittId } from './typen'

export interface Vorlage {
  titel: string
  bild: string
  minuten: number
  abschnitt: AbschnittId
  zusatz?: string
}

export const VORLAGEN: Vorlage[] = [
  // Morgen
  { titel: 'Aufstehen', bild: 'wecker', minuten: 5, abschnitt: 'aufstehen' },
  { titel: 'Toilette', bild: 'toilette', minuten: 3, abschnitt: 'aufstehen' },
  { titel: 'Hände waschen', bild: 'waschen', minuten: 2, abschnitt: 'morgen' },
  { titel: 'Zähne putzen', bild: 'zaehne', minuten: 3, abschnitt: 'morgen' },
  { titel: 'Anziehen', bild: 'anziehen', minuten: 10, abschnitt: 'morgen' },
  { titel: 'Frühstück', bild: 'fruehstueck', minuten: 20, abschnitt: 'morgen' },
  { titel: 'Schuhe anziehen', bild: 'schuhe', minuten: 5, abschnitt: 'morgen' },
  { titel: 'Jacke anziehen', bild: 'jacke', minuten: 3, abschnitt: 'morgen' },
  { titel: 'Rucksack packen', bild: 'rucksack', minuten: 5, abschnitt: 'morgen' },
  { titel: 'Eincremen', bild: 'eincremen', minuten: 2, abschnitt: 'morgen' },
  { titel: 'Medizin nehmen', bild: 'medizin', minuten: 1, abschnitt: 'morgen' },
  // Vormittag
  { titel: 'Kita', bild: 'kita', minuten: 0, abschnitt: 'vormittag' },
  { titel: 'Kinderturnen', bild: 'turnen', minuten: 45, abschnitt: 'nachmittag' },
  { titel: 'Fr. Gardner', bild: 'psychotherapie', minuten: 0, abschnitt: 'nachmittag' },
  { titel: 'Obstpause', bild: 'apfel', minuten: 10, abschnitt: 'vormittag' },
  { titel: 'Trinken', bild: 'milch', minuten: 1, abschnitt: 'vormittag' },
  { titel: 'Arzt', bild: 'arzt', minuten: 0, abschnitt: 'vormittag' },
  { titel: 'Schwimmen', bild: 'schwimmen', minuten: 0, abschnitt: 'vormittag' },
  // Mittag
  { titel: 'Tisch decken', bild: 'essen', minuten: 5, abschnitt: 'mittag' },
  { titel: 'Mittagessen', bild: 'essen', minuten: 30, abschnitt: 'mittag' },
  { titel: 'Mittagsruhe', bild: 'mittagsruhe', minuten: 30, abschnitt: 'mittag' },
  { titel: 'Ergotherapie', bild: 'ergotherapie', minuten: 0, abschnitt: 'mittag' },
  { titel: 'Abholen', bild: 'abholen', minuten: 0, abschnitt: 'mittag' },
  // Nachmittag
  { titel: 'Spielplatz', bild: 'spielplatz', minuten: 60, abschnitt: 'nachmittag' },
  { titel: 'Draußen spielen', bild: 'baum', minuten: 45, abschnitt: 'nachmittag' },
  { titel: 'Fahrrad fahren', bild: 'fahrrad', minuten: 30, abschnitt: 'nachmittag' },
  { titel: 'Malen', bild: 'malen', minuten: 20, abschnitt: 'nachmittag' },
  { titel: 'Basteln', bild: 'basteln', minuten: 20, abschnitt: 'nachmittag' },
  { titel: 'Puzzeln', bild: 'puzzle', minuten: 20, abschnitt: 'nachmittag' },
  { titel: 'Spielen', bild: 'spielen', minuten: 30, abschnitt: 'nachmittag' },
  { titel: 'Vorschulaufgaben', bild: 'vorschule', minuten: 15, abschnitt: 'nachmittag' },
  { titel: 'Spieleverabredung', bild: 'verabredung', minuten: 0, abschnitt: 'nachmittag' },
  { titel: 'Musik und Tanzen', bild: 'musik', minuten: 15, abschnitt: 'nachmittag' },
  { titel: 'Oma und Opa', bild: 'oma', minuten: 0, abschnitt: 'nachmittag' },
  { titel: 'Pflanzen gießen', bild: 'pflanze', minuten: 5, abschnitt: 'nachmittag' },
  { titel: 'Kuchen essen', bild: 'kuchen', minuten: 20, abschnitt: 'nachmittag' },
  { titel: 'Geburtstag', bild: 'geburtstag', minuten: 0, abschnitt: 'nachmittag' },
  // Einkaufen
  { titel: 'Einkaufen', bild: 'einkaufen', minuten: 0, abschnitt: 'vormittag' },
  { titel: 'Bäcker', bild: 'croissant', minuten: 0, abschnitt: 'vormittag' },
  { titel: 'Wochenmarkt', bild: 'karotte', minuten: 0, abschnitt: 'vormittag' },
  { titel: 'Einkäufe auspacken', bild: 'apfel', minuten: 5, abschnitt: 'nachmittag' },
  // Abend
  { titel: 'Abendessen', bild: 'abendbrot', minuten: 30, abschnitt: 'frueh' },
  { titel: 'Aufräumen', bild: 'aufraeumen', minuten: 10, abschnitt: 'frueh' },
  { titel: 'Baden', bild: 'baden', minuten: 15, abschnitt: 'abend' },
  { titel: 'Duschen', bild: 'duschen', minuten: 10, abschnitt: 'abend' },
  { titel: 'Ausziehen', bild: 'ausziehen', minuten: 5, abschnitt: 'abend' },
  { titel: 'Schlafanzug anziehen', bild: 'schlafanzug', minuten: 5, abschnitt: 'abend' },
  { titel: 'Zähne putzen', bild: 'zaehne', minuten: 3, abschnitt: 'abend' },
  // Bettgehzeit und Schlafen
  { titel: 'Fernsehen', bild: 'fernsehen', minuten: 20, abschnitt: 'abend' },
  { titel: 'Vorlesen', bild: 'lesen', minuten: 15, abschnitt: 'bett' },
  { titel: 'Kuscheln', bild: 'kuscheln', minuten: 10, abschnitt: 'bett' },
  { titel: 'Toilette vor dem Schlafen', bild: 'toilette', minuten: 3, abschnitt: 'bett', zusatz: 'mond' },
  { titel: 'Schlafen', bild: 'schlafen', minuten: 0, abschnitt: 'schlafen' },
]
