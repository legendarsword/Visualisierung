Das ist ein Projekt-Repo für die HS Hannover Master-Vorlesung Visualisierung+HCI

Um die Webseite zu starten, bitte NPM installieren und in dem Ordner "main" die Abhängigkeiten installieren mit:
```bash
npm install
```
Danach kann die Webseite mit folgendem Befehl gestartet werden:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Die Webseite ist nun mit der Adresse [http://localhost:3000](http://localhost:3000) abrufbar.

Benutzte Visualisierungstechniken: D3 mit 
    - Kartendiagramm, welches den Finanziellen Verlust der Länder darstellt, abhängig des Jahres
    - interaktivem Balkendiagramm über die Anzahl der Angriffe pro Land, Auswählbar nach Land, Angriffsart und Sektor
    - interaktives Tortendiagramm, bei dem man die gewünschte Kategorie auswählen kann und nach 3 Wahlen die Liste der verbleibenden Angriffe ausgibt für weitere Informationen

Folgende Daten wurden verwendet: [https://www.kaggle.com/datasets/atharvasoundankar/global-cybersecurity-threats-2015-2024](Global Cybersecurity Threats (2015-2024))

Die Webseite ist in 4 Teile geteilt:
    - Frontseite
    - Karte
    - Balkendiagramm
    - Donut


Donut:
Grundidee: https://gist.github.com/pqthang711/e750d2f5918df1b8c5e6e244003703c6
Danach aber komplett mit D3 und React nach geschrieben.