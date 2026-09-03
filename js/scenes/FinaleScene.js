/**
 * FinaleScene.js - Livello 8: L'Ultimo Ricordo (Capitolo Finale)
 * 
 * L'isola sta cancellando se stessa. La realtà si frammenta.
 * Enigma finale dei 7 ricordi, la stanza della fotografia e la Scelta Finale (3 Epiloghi).
 */

class FinaleScene {
  constructor() {
    this.id = 'finale';
    this.name = 'L\'Ultimo Ricordo (Finale)';
    this.npcs = [];
    this.objs = [];
    this.relicsPlaced = 0;
    this.photoDiscovered = false;
  }

  build(scene, player, game) {
    this.scene = scene;
    this.player = player;
    this.g = game;
    this.objs = [];
    this.npcs = [];
    this.relicsPlaced = 0;
    this.photoDiscovered = false;

    // ── TERRENO FRAMMENTATO SURREALE ──
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x05080c, roughness: 0.1, metalness: 0.9 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.name = 'Spazio del Finale';
    scene.add(floor);
    this.floorMesh = floor;

    // ── FRAMMENTI DELLE SCENE PRECEDENTI SOSPESI NEL VUOTO ──
    const fragmentMat = new THREE.MeshBasicMaterial({ color: 0x4aa3df, wireframe: true, transparent: true, opacity: 0.35 });

    // Mini portali dei ricordi passati
    const portalPositions = [
      { name: 'Frammento Porto', x: -8, z: 8 },
      { name: 'Frammento Foresta', x: 8, z: 8 },
      { name: 'Frammento Albergo', x: -10, z: -4 },
      { name: 'Frammento Miniera', x: 10, z: -4 },
      { name: 'Frammento Città', x: 0, z: 12 }
    ];

    portalPositions.forEach(p => {
      const pMesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.2), fragmentMat);
      pMesh.position.set(p.x, 2, p.z);
      scene.add(pMesh);
    });

    // ── ALTARE DEI 7 RICORDI (ENIGMA FINALE) ──
    const altarGeo = new THREE.CylinderGeometry(3.5, 4.0, 0.6, 7);
    const altarMat = new THREE.MeshStandardMaterial({ color: 0x1a2636, metalness: 0.8, roughness: 0.2 });
    const altar = new THREE.Mesh(altarGeo, altarMat);
    altar.position.set(0, 0.3, -3);
    scene.add(altar);

    // I 7 piedistalli per le reliquie (Amo, Orologio, Chiave, Cristallo, Maschera, Sfera, Medaglione)
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const rx = Math.cos(angle) * 2.5;
      const rz = Math.sin(angle) * 2.5 - 3;

      const pGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 12);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x4aa3df, emissive: 0x112244 });
      const ped = new THREE.Mesh(pGeo, pMat);
      ped.position.set(rx, 0.8, rz);
      scene.add(ped);
    }

    this.objs.push({
      mesh: altar,
      label: 'Altare dei 7 Ricordi',
      walkTarget: { x: 0, z: -0.2 },
      action: () => this.solveFinalPuzzle()
    });

    // ── STANZA DEL TESORO (CUSTODIA FOTOGRAFIA) ──
    const photoPed = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 }));
    photoPed.position.set(0, 0.6, -11);
    scene.add(photoPed);

    this.objs.push({
      mesh: photoPed,
      label: 'La Stanza del Vero Tesoro',
      walkTarget: { x: 0, z: -9.5 },
      action: () => this.inspectPhoto()
    });
  }

  solveFinalPuzzle() {
    const pName = this.g.charId === 'valentine' ? 'Valentine' : 'Elias';
    const otherName = this.g.charId === 'valentine' ? 'Elias' : 'Valentine';

    if (this.relicsPlaced < 7) {
      this.relicsPlaced = 7;
      this.g.openDialog([
        { text: 'Posizioni i 7 oggetti raccolti nel tuo lungo viaggio: l\'Amo, l\'Orologio, la Chiave, il Cristallo, la Maschera, la Sfera ed il Medaglione.', speaker: 'Enigma Finale' },
        { text: 'Le luci dei 7 piedistalli si connettono... Non formano una mappa. Formano il volto di ' + otherName + '!', speaker: 'Rivelazione' },
        { text: `«Anni fa avevamo scoperto la macchina e volevamo distruggerla... Ma ${otherName} ha cancellato i propri ricordi dalla mia mente per salvarmi dal collasso mentale!»`, speaker: pName }
      ], () => {
        this.g.notify('✨ Il sigillo finale è spezzato! Avanza verso la Stanza del Tesoro.');
      });
    } else {
      this.g.notify('✨ I 7 ricordi risuonano all\'unisono.');
    }
  }

  inspectPhoto() {
    if (this.relicsPlaced < 7) {
      this.g.notify('🔒 Devi prima risolvere l\'Enigma dei 7 Ricordi sull\'Altare.');
      return;
    }

    if (!this.photoDiscovered) {
      this.photoDiscovered = true;
      const pName = this.g.charId === 'valentine' ? 'Valentine' : 'Elias';
      const otherName = this.g.charId === 'valentine' ? 'Elias' : 'Valentine';

      this.g.openDialog([
        { text: 'Apri il piccolo cofanetto al centro della stanza... Non ci sono monete né corone d\'oro.', speaker: 'Il Tesoro' },
        { text: `All'interno c'è una vecchia fotografia ingiallita che ritrae ${pName} e ${otherName} sorridenti prima dell'arrivo sull'isola.`, speaker: 'Il Tesoro' },
        { text: 'Giri la fotografia. Sul retro c\'è scritta una frase a mano:', speaker: 'Scritta' },
        { text: `“Se un giorno dimenticherai tutto, ricordati almeno che mi hai amata.”`, speaker: 'Dedica' }
      ], () => {
        this.presentFinalChoices();
      });
    } else {
      this.presentFinalChoices();
    }
  }

  presentFinalChoices() {
    const pName = this.g.charId === 'valentine' ? 'Valentine' : 'Elias';
    const otherName = this.g.charId === 'valentine' ? 'Elias' : 'Valentine';

    this.g.openDialog([
      { text: 'La macchina ti pone davanti alla SCELTA FINALE dell\'Isola Perduta:', speaker: 'La Decisione' },
      { text: '1: DISTRUGGERE IL CUORE - Liberare i ricordi di tutti, distruggere l\'isola e dire addio per sempre a ' + otherName + '.', speaker: 'Scelta 1' },
      { text: '2: RIATTIVARE IL CUORE - Salvare l\'esistenza dell\'isola e di ' + otherName + ' nella macchina, ma dimenticarla di nuovo.', speaker: 'Scelta 2' },
      { text: '3: FINALE SEGRETO - Salvare il ricordo di ' + otherName + ' nel medaglione e salpare verso un nuovo inizio!', speaker: 'Scelta 3' }
    ], () => {
      // Epilogo e completamento del gioco
      this.g.notify('🎬 GRAZIE PER AVER GIOCATO A "ISOLA PERDUTA"! FINALE COMPLETATO! ⛵');
    });
  }

  update(dt) {
    // Effetto di distorsione/rotazione continua del vuoto finale
    if (this.floorMesh) {
      this.floorMesh.rotation.z += dt * 0.05;
    }
  }
}

// Espone la scena al window globale
if (typeof window !== 'undefined') {
  window.FinaleScene = FinaleScene;
}
