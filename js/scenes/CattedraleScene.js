/**
 * CattedraleScene.js - Livello 6: La Cattedrale delle Memorie
 * 
 * Un archivio monumentale sotterraneo scavato nella roccia.
 * Migliaia di sfere di vetro luminose contengono i ricordi dell'umanità.
 * Incontro con Malach, il Custode cieco, ed enigma del "Ricordo Sbagliato".
 */

class CattedraleScene {
  constructor() {
    this.id = 'cattedrale';
    this.name = 'La Cattedrale delle Memorie';
    this.npcs = [];
    this.objs = [];
    this.memorySpheres = [];
    this.correctSphereFound = false;
    this.dialogStep = 0;
  }

  build(scene, player, game) {
    this.scene = scene;
    this.player = player;
    this.g = game;
    this.objs = [];
    this.npcs = [];
    this.memorySpheres = [];

    // ── TERRENO E ARCHITETTURA ──
    // Pavimento in pietra con simboli incisi
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x121820, roughness: 0.8 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(35, 35), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.name = 'Pavimento Cattedrale';
    scene.add(floor);
    this.floorMesh = floor;

    // Pareti monumentali con nicchie
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x0a0f14, roughness: 0.9 });
    
    // Muro posteriore con arco
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(35, 18, 1), wallMat);
    backWall.position.set(0, 9, -17);
    scene.add(backWall);

    // Muri laterali
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 18, 35), wallMat);
    leftWall.position.set(-17, 9, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 18, 35), wallMat);
    rightWall.position.set(17, 9, 0);
    scene.add(rightWall);

    // Colonne titaniche
    const colGeo = new THREE.CylinderGeometry(1.2, 1.5, 18, 12);
    const colMat = new THREE.MeshLambertMaterial({ color: 0x18202a, roughness: 0.7 });

    const colPositions = [
      [-10, -10], [10, -10],
      [-10, 0],   [10, 0],
      [-10, 10],  [10, 10]
    ];

    colPositions.forEach(pos => {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(pos[0], 9, pos[1]);
      col.castShadow = true;
      col.receiveShadow = true;
      scene.add(col);
    });

    // ── SFERE DELLA MEMORIA SULLE PARETI E NELL'ARIA ──
    const sphereGeo = new THREE.SphereGeometry(0.25, 16, 16);

    // Generiamo centinaia di sfere traslucide blu/oro lungo le pareti
    for (let i = 0; i < 40; i++) {
      const isGold = (i === 13); // La sfera speciale di Valentine
      const sphereMat = new THREE.MeshPhongMaterial({
        color: isGold ? 0xffd700 : 0x4aa3df,
        emissive: isGold ? 0xaa8800 : 0x114477,
        transparent: true,
        opacity: 0.85,
        shininess: 90
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      
      // Disposte su banchi/nicchie lungo i lati
      const side = (i % 2 === 0) ? -14.5 : 14.5;
      const zPos = -15 + (Math.floor(i / 2) * 0.8);
      const yPos = 1.2 + Math.sin(i * 0.5) * 1.5;

      sphere.position.set(side + (Math.random() * 0.4 - 0.2), yPos, zPos);
      scene.add(sphere);

      // Aggiungiamo luce fioca a ciascuna sfera
      if (i % 4 === 0) {
        const pLight = new THREE.PointLight(isGold ? 0xffbb00 : 0x3399ff, 0.4, 4);
        pLight.position.copy(sphere.position);
        scene.add(pLight);
      }

      this.memorySpheres.push({ mesh: sphere, isTarget: isGold, id: i });
    }

    // ── IL CUSTODE MALACH (NPC) ──
    const malachGroup = new THREE.Group();
    malachGroup.position.set(0, 0, -8);
    malachGroup.name = 'Malach il Custode';
    malachGroup.userData = { home: { x: 0, z: -8 } };

    // Corpo incappucciato di Malach
    const robeMat = new THREE.MeshLambertMaterial({ color: 0x1c1c24 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.65, 1.7, 10), robeMat);
    body.position.y = 0.85;
    malachGroup.add(body);

    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.6, 8), robeMat);
    hood.position.set(0, 1.8, 0);
    hood.rotation.x = 0.2;
    malachGroup.add(hood);

    // Bastone di Malach
    const staffMat = new THREE.MeshLambertMaterial({ color: 0x5a3d28 });
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8), staffMat);
    staff.position.set(0.45, 1.1, 0.1);
    staff.rotation.z = -0.1;
    malachGroup.add(staff);

    // Gemma del bastone
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), new THREE.MeshBasicMaterial({ color: 0x4ae3ff }));
    gem.position.set(0.45, 2.2, 0.1);
    malachGroup.add(gem);

    scene.add(malachGroup);
    this.npcs.push(malachGroup);

    // Registriamo Malach come oggetto interattivo
    this.objs.push({
      mesh: malachGroup,
      label: 'Malach il Custode',
      walkTarget: { x: 0, z: -6.5 },
      action: () => this.talkToMalach()
    });

    // ── SFERA D'ORO CHIAVE (Il Ricordo Sbagliato) ──
    const targetSphereMesh = this.memorySpheres.find(s => s.isTarget).mesh;
    this.objs.push({
      mesh: targetSphereMesh,
      label: 'Sfera della Memoria d\'Oro',
      walkTarget: { x: targetSphereMesh.position.x > 0 ? 13 : -13, z: targetSphereMesh.position.z },
      action: () => this.inspectTargetSphere()
    });

    // ── ALTARE CENTRALE E ASCENSORE PER IL LIVELLO 7 ──
    const altarMat = new THREE.MeshStandardMaterial({ color: 0x222a35, metalness: 0.6, roughness: 0.3 });
    const altar = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.0, 0.4, 16), altarMat);
    altar.position.set(0, 0.2, -13);
    scene.add(altar);

    // Portale / Ascensore per il livello successivo (attivabile dopo la rivelazione)
    const gateGeo = new THREE.TorusGeometry(1.8, 0.15, 16, 32);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x4aa3df, emissive: 0x113355, metalness: 0.9 });
    this.elevatorGate = new THREE.Mesh(gateGeo, gateMat);
    this.elevatorGate.position.set(0, 2.2, -13);
    this.elevatorGate.rotation.x = Math.PI / 2;
    scene.add(this.elevatorGate);

    this.objs.push({
      mesh: altar,
      label: 'Ascensore per il Cuore dell\'Isola',
      walkTarget: { x: 0, z: -11.5 },
      action: () => this.useElevator()
    });
  }

  talkToMalach() {
    const pName = this.g.charId === 'valentine' ? 'Valentine' : 'Elias';

    if (this.dialogStep === 0) {
      this.g.openDialog([
        { text: `Benvenuto nella Cattedrale delle Memorie, ${pName}.`, speaker: 'Malach il Custode' },
        { text: 'Ci siamo già incontrati? La tua voce mi è stranamente familiare...', speaker: pName },
        { text: 'No. Tu sì. Io no.', speaker: 'Malach il Custode' },
        { text: 'Cosa significa? E cosa sono tutte queste sfere luminose sulle pareti?', speaker: pName },
        { text: 'Ogni sfera è il sospiro di un\'anima. I ricordi dimenticati di chi ha calpestato quest\'isola. Ma ce n\'è una che appartiene proprio a te.', speaker: 'Malach il Custode' },
        { text: 'Trovata quella sfera, comprenderai la verità. Cerca la sfera che fonde i ricordi della barca, della tempesta e della donna con il medaglione.', speaker: 'Malach il Custode' }
      ], () => {
        this.dialogStep = 1;
        this.g.notify('💡 Cerca la Sfera della Memoria d\'Oro sulle pareti laterali.');
      });
    } else if (!this.correctSphereFound) {
      this.g.openDialog([
        { text: 'Ascolta le risonanze delle sfere. Cerca quella dorata che custodisce l\'arrivo sulla spiaggia.', speaker: 'Malach il Custode' }
      ]);
    } else {
      this.g.openDialog([
        { text: 'Ora sai. Voi due eravate già stati qui. L\'ascensore al centro dell\'altare è ora sbloccato. Scendi nel Cuore dell\'Isola.', speaker: 'Malach il Custode' }
      ]);
    }
  }

  inspectTargetSphere() {
    if (this.dialogStep === 0) {
      this.g.notify('🔍 Parla prima con Malach il Custode per capire cosa cercare.');
      return;
    }

    if (!this.correctSphereFound) {
      this.correctSphereFound = true;
      const pName = this.g.charId === 'valentine' ? 'Valentine' : 'Elias';
      const otherName = this.g.charId === 'valentine' ? 'Elias' : 'Valentine';

      this.g.openDialog([
        { text: 'Tocchi la sfera d\'oro... Una luce intensa ti avvolge la mente!', speaker: 'Ricordo della Memoria' },
        { text: `Vedi una visione nitida: non sei arrivato da solo su quest'isola. Molti anni fa, ${pName} e ${otherName} sbarcarono insieme su questa sponda!`, speaker: 'Rivelazione' },
        { text: `Non è stato un naufragio casuale. ${otherName} ti stava guidando scientemente verso la macchina dell'isola...`, speaker: 'Rivelazione' },
        { text: 'Mio Dio... eravamo già stati qui! Ma entrambi abbiamo perso la memoria!', speaker: pName }
      ], () => {
        this.g.notify('✨ Rivelazione sbloccata! L\'altare al centro ora brilla di luce azzurra.');
        if (this.elevatorGate) {
          this.elevatorGate.material.emissive.setHex(0x00ffff);
        }
      });
    } else {
      this.g.notify('🔮 La sfera ha già rivelato il tuo ricordo primordiale.');
    }
  }

  useElevator() {
    if (!this.correctSphereFound) {
      this.g.notify('🔒 L\'ascensore antico è bloccato. Devi prima scoprire la verità toccando la Sfera della Memoria.');
      return;
    }

    this.g.openDialog([
      { text: 'L\'ascensore di pietra inizia a scendere nelle profondità viscerali dell\'isola...', speaker: 'Transizione' }
    ], () => {
      // Transizione al Livello 7
      if (this.g.loadScene) {
        this.g.loadScene('cuore');
      }
    });
  }

  update(dt) {
    // Animazione di fluttuazione leggera delle sfere della memoria
    if (this.memorySpheres) {
      const time = Date.now() * 0.002;
      this.memorySpheres.forEach((s, idx) => {
        s.mesh.position.y += Math.sin(time + idx) * 0.0015;
      });
    }

    // Rotazione continua del portale ascensore
    if (this.elevatorGate) {
      this.elevatorGate.rotation.z += dt * 0.5;
    }
  }
}

// Espone la scena al window globale
if (typeof window !== 'undefined') {
  window.CattedraleScene = CattedraleScene;
}
