# 🗺️ Lernabenteuer Webentwicklung

Eine interaktive, deutschsprachige Kurs-Seite für junge Einsteigerinnen (gestartet mit 14): Schritt für Schritt von der ersten HTML-Zeile bis zur eigenen kleinen Web-App — ohne Frameworks, dafür mit echtem Verständnis.

## Projektzweck

Die Seite ist der rote Faden für ein **selbstgesteuertes Lernabenteuer**: Sie erklärt in Phasen, was als Nächstes dran ist, bündelt geprüfte Lern-Ressourcen (u. a. basierend auf einem Odyseus-Recherche-Report zu Kursen für Einsteiger) und macht Fortschritt sichtbar — mit Leveln, Badges und abhakbaren Missionen.

**Zielgruppe:** Teenager mit ersten Scratch/Code-Combat-Erfahrungen.
**Sprache:** Komplett Deutsch.
**Didaktik:** Phasenweise Progression — erst Struktur (HTML) und Optik (CSS), dann Logik (Vanilla JavaScript), erst danach Frameworks. Motivation durch sichtbaren Fortschritt statt Theorie-Wüste.

## Struktur

```
lernabenteuer-webdev/
├── index.html          # Einstieg: Kurs-Übersicht & Orientierung
├── assets/             # Stylesheets, Skripte, Bilder
│   ├── css/
│   └── js/
├── content/            # Kurstexte & Ressourcen-Daten (Quelle der Wahrheit für Inhalte)
│   └── kurse/          # Je Phase: Lehrplan-Texte und Ressourcen-Links
└── docs/               # Projekt-Doku (Lehrplan-Entscheidungen, Gestaltungs-Richtlinien)
```

## Setup & Entwicklung

Reines statisches HTML/CSS/JS — bewusst **kein Build-Step, kein Framework**:

```bash
git clone https://github.com/jkrauss/lernabenteuer-webdev.git
cd lernabenteuer-webdev
# Direkt im Browser öffnen:
open index.html        # macOS
xdg-open index.html    # Linux
# oder lokalen Server:
python3 -m http.server 8000
```

Die Seite läuft auch komplett offline — keine externen Abhängigkeiten.

## Deployment

Die Seite wird automatisch über **GitHub Pages** aus `main` ausgespielt:
👉 https://jkrauss.github.io/lernabenteuer-webdev/

Jeder Merge nach `main` baut und veröffentlicht die Seite automatisch (GitHub Actions Workflow `.github/workflows/deploy-pages.yml`).

## Zusammenarbeit & Qualitäts-Loop

- **Arbeiten:** Feature-Branch → Pull Request. `main` ist geschützt (PRs erforderlich).
- **Review:** Jeder Push/PR wird automatisch vom **Kilobot** (kilo-code-bot) geprüft. Anmerkungen werden adressiert; bei Verdict „merge" wird gemergt.
- **Deployment:** Nach Merge auf `main` deployt der Pages-Workflow automatisch.

## Lizenz

MIT — siehe [LICENSE](LICENSE).
