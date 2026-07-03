# Isola Perduta 🏴‍☠️ (The Lost Island)

Un'avventura grafica tridimensionale interattiva ed esplorativa ambientata su un'isola misteriosa che ruba i ricordi dei suoi abitanti. Realizzata in **HTML5**, **JavaScript (ES6)** e **Three.js**.

Disponibile per la riproduzione immediata su tutti i browser desktop e mobile tramite **GitHub Pages**!

---

## 🗺️ Trama e Ambientazione
Ti risvegli sulle coste dell'**Isola Senza Nome**. L'aria stessa di questo luogo consuma gradualmente la tua **Memoria**, rendendo gli oggetti comuni irriconoscibili e alterando la percezione stessa della realtà. Per fuggire dovrai esplorare 5 aree ricche di mistero, risolvere enigmi basati sul tempo, manipolare la realtà presente e passata, e trovare il modo di riottenere i tuoi ricordi.

### 🎭 Personaggi Giocabili
- **Elias Crow** 🏴‍☠️: Un audace pirata avventuriero alla ricerca di risposte e leggendari tesori perduti.
- **Valentine Black** 🏴‍☠️: Una coraggiosa pirata esploratrice guidata da una misteriosa mappa stellare.

---

## 🎮 Livelli di Gioco
1. **Il Porto delle Maree Morte**: Trova i pezzi d'informazione per ricostruire la parola d'ordine di sblocco e restituisci l'amo perduto a Capitan Umber per salpare.
2. **La Foresta degli Orologi**: Un labirinto in cui il tempo scorre in modo bizzarro. Interagisci con Yorick e manipola l'orologio maestro.
3. **L'Albergo delle Ombre**: Spostati tra passato e presente per alterare gli eventi nella Stanza 404 e spezzare l'illusione ottica del pianista cieco.
4. **La Miniera del Sole Nero**: Addentrati nel cuore dell'isola ed esplora i tunnel scavando per i cristalli e manipolando leve industriali.
5. **La Città Sommersa**: Scopri la verità nascosta dietro l'isola risolvendo il rituale antico davanti alla Statua Parlante.

---

## 🛠️ Caratteristiche Tecniche e Meccaniche
- **Grafica 3D Fluida**: Render 3D in tempo reale con illuminazione dinamica, ombre morbide e modelli 3D GLTF (con bone attachment diretto per le armi alle mani dei personaggi).
- **Sistema di Inventario Interattivo**:
  - Trascina e rilascia (Drag & Drop) gli oggetti dallo zaino alle mani per equipaggiarli o scambiarli.
  - Consuma provviste direttamente dal menu per ripristinare la **Salute**.
  - **Azione Rapida**: Clicca su mappe e diari per aprirli istantaneamente a schermo intero.
- **Ottimizzazione Mobile Completa (iOS & Android)**:
  - Sistema **Tap-to-Equip** touch alternativo per evitare trascinamenti scomodi su schermi piccoli.
  - Inibizione dello scroll bounce nativo dei browser mobile durante il drag degli oggetti.
  - D-pad touch virtuale e tasto di Attacco (💥) posizionati dinamicamente.
  - Tasto **EXIT (🚪)** fisso sempre visibile per tornare istantaneamente al menu principale.
- **Generatore Audio Integrato**: Sintesi ed effetti audio in tempo reale realizzati via codice con la Web Audio API (nessuna dipendenza da file audio esterni pesanti).

---

## 🚀 Come Giocare in Locale
Non c'è bisogno di installare complessi server o pacchetti di terze parti:
1. Clona il repository:
   ```bash
   git clone https://github.com/wildartworks/Isola_Perduta.git
   ```
2. Apri il file `index.html` all'interno di un qualsiasi browser web moderno.
3. Per caricare correttamente i modelli 3D GLTF (.glb) è consigliato avviare un server locale leggero (es. con l'estensione *Live Server* di VS Code o lanciando `python -m http.server 8000` nella cartella di gioco).

---

## 👤 Crediti
Sviluppato da **Wildartworks**.
