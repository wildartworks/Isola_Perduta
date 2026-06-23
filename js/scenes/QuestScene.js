// ============================================================
// ISLA PERDIDA — Livello Basic Tutorial: Quest
// ============================================================

class QuestScene {
  constructor(g) {
    this.g = g;
    this.objs = [];
    this.time = 0;
    this.npcs = [];
    this.tutorialStep = 0;
    this._chestOpened = false;
  }

  addClickable(mesh, label, walkTarget, action, opts = {}) {
    const objDef = { mesh, label, walkTarget, action, ...opts };
    this.objs.push(objDef);
    mesh.traverse(child => {
      if (child.isMesh) child.userData.parentObj = objDef;
    });
  }

  build() {
    const g = this.g;
    const scene = g.scene;

    // ── Ambiente luminoso e tranquillo per imparare ──
    scene.fog = new THREE.FogExp2(0x3a5d7c, 0.02);
    scene.background = new THREE.Color(0x3a5d7c);

    // Sole brillante
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x7799bb, 0.8));

    // ── TERRENO ERBOSO PIATTO ──
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x4a7c59 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.name = 'Terreno Quest';
    scene.add(floor);

    // Alberi decorativi intorno per delimitare l'area
    this._buildTrees(scene);

    // ── OGGETTI DI TUTORIAL ──
    this._buildTutorialItems(scene, g);

    // Notifica iniziale di benvenuto nel livello Quest
    setTimeout(() => {
      g.notify("Benvenuto nel livello Quest! Clicca sul terreno per muoverti.");
      g.startDialog('quest_start', [
        { id:'start', speaker:'Vecchio Saggio', portrait:'🧔',
          text:'Benvenuto/a, straniero/a! Clicca sul terreno per camminare. Raggiungimi per imparare le basi dell\'isola.',
          choices:[
            { text:'Va bene, arrivo!', next:'end' }
          ]
        }
      ]);
    }, 500);
  }

  _buildTrees(scene) {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x2e5c1e });

    // Crea un cerchio di alberi
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const x = Math.cos(angle) * 12;
      const z = Math.sin(angle) * 12;

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.5), trunkMat);
      trunk.position.set(x, 1.25, z);
      scene.add(trunk);

      const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), leavesMat);
      leaves.position.set(x, 2.5, z);
      scene.add(leaves);
    }
  }

  _buildTutorialItems(scene, g) {
    // 1. IL VECCHIO SAGGIO (NPC)
    const npcGrp = new THREE.Group();
    npcGrp.name = 'Vecchio Saggio';
    const skin = new THREE.MeshLambertMaterial({ color: 0xe0b080 });
    const robe = new THREE.MeshLambertMaterial({ color: 0x3f51b5 });
    
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.3), robe);
    body.position.y = 0.65;
    npcGrp.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), skin);
    head.position.y = 1.4;
    npcGrp.add(head);

    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.08), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    beard.position.set(0, 1.25, 0.12);
    npcGrp.add(beard);

    npcGrp.position.set(0, 0, -4);
    scene.add(npcGrp);
    this.npcs.push(npcGrp);

    npcGrp.userData = {
      home: npcGrp.position.clone(),
      walkTarget: npcGrp.position.clone(),
      isMoving: false,
      walkTimer: 0,
      range: 0
    };

    this.addClickable(npcGrp, '💬 Parla con il Vecchio Saggio', { x: 0, z: -2.8 }, () => {
      if (this.tutorialStep === 0) {
        g.startDialog('saggio_1', [
          { id:'start', speaker:'Vecchio Saggio', portrait:'🧔',
            text:'Molto bene! Hai capito come muoverti. Ora prova a raccogliere il Mango Fluorescente dorato alla mia destra.',
            choices:[], giveFlag: 'parlato_saggio'
          }
        ]);
        this.tutorialStep = 1;
      } else if (this.tutorialStep === 1) {
        g.notify('"Raccogli prima il mango alla mia destra per favore."');
      } else if (this.tutorialStep === 2) {
        g.startDialog('saggio_2', [
          { id:'start', speaker:'Vecchio Saggio', portrait:'🧔',
            text:'Eccellente. Hai raccolto il Mango! I frutti curano le tue ferite. Prova a cliccarlo nel menu Zaino/Provviste a destra per usarlo o scartarlo.',
            choices:[]
          }
        ]);
        this.tutorialStep = 3;
      } else if (this.tutorialStep === 3) {
        g.notify('"Apri lo zaino a destra e clicca sul Mango per consumarlo."');
      } else if (this.tutorialStep === 4) {
        g.startDialog('saggio_3', [
          { id:'start', speaker:'Vecchio Saggio', portrait:'🧔',
            text:'Stai imparando in fretta. Ora ti servirà una chiave per aprire quello scrigno del tesoro laggiù. Prendi questo Fischietto d\'Osso dal mio banco.',
            choices:[]
          }
        ]);
        // Facciamo apparire il fischietto sul tavolo o diamolo direttamente
        g.inv.add('fischietto_osso');
        g.notify("🗝️ Hai ricevuto il Fischietto d'Osso dal Saggio!");
        this.tutorialStep = 5;
      } else if (this.tutorialStep === 5) {
        g.startDialog('saggio_4', [
          { id:'start', speaker:'Vecchio Saggio', portrait:'🧔',
            text:'Usa il Fischietto d\'Osso trascinandolo dallo zaino sul cumulo di pietre a sinistra. Le farà vibrare rivelando una chiave!',
            choices:[]
          }
        ]);
      } else if (this.tutorialStep === 6) {
        g.startDialog('saggio_5', [
          { id:'start', speaker:'Vecchio Saggio', portrait:'🧔',
            text:'Ottimo! Ora raccogli la chiave arrugginita rivelata e usala trascinandola sullo scrigno per aprirlo.',
            choices:[]
          }
        ]);
      } else if (this.tutorialStep === 7) {
        g.startDialog('saggio_fine', [
          { id:'start', speaker:'Vecchio Saggio', portrait:'🧔',
            text:'Hai completato l\'addestramento di base! Clicca sul tasto EXIT in alto a destra per tornare al menu e iniziare la tua vera avventura.',
            choices:[]
          }
        ]);
      }
    });

    // 2. MANGO DA RACCOGLIERE (Mango Fluorescente)
    this.mangoMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x27ae60, emissive: 0x11ff22, emissiveIntensity: 0.8 })
    );
    this.mangoMesh.name = 'Mango di Prova';
    this.mangoMesh.position.set(3, 0.15, -4);
    scene.add(this.mangoMesh);

    this.addClickable(this.mangoMesh, '🟢 Raccogli Mango Fluorescente', { x: 2.5, z: -4 }, () => {
      if (this.tutorialStep >= 1) {
        g.inv.add('mango_fluorescente');
        g.notify("Hai raccolto un Mango Fluorescente di prova!");
        scene.remove(this.mangoMesh);
        this.objs = this.objs.filter(o => o.mesh !== this.mangoMesh);
        if (this.tutorialStep === 1) {
          this.tutorialStep = 2;
          g.notify("🥭 Parla di nuovo con il Vecchio Saggio.");
        }
      } else {
        g.notify("Parla prima con il Vecchio Saggio.");
      }
    });

    // 3. CUMULO DI PIETRE (per usare il fischietto d'osso)
    this.pietreMesh = new THREE.Group();
    this.pietreMesh.name = 'Cumulo di Pietre';
    const pietreMat = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });
    for (let p = 0; p < 5; p++) {
      const sp = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), pietreMat);
      sp.position.set((Math.random() - 0.5) * 0.4, 0.1, (Math.random() - 0.5) * 0.4);
      sp.rotation.set(Math.random(), Math.random(), 0);
      this.pietreMesh.add(sp);
    }
    this.pietreMesh.position.set(-3, 0, -4);
    scene.add(this.pietreMesh);

    this.addClickable(this.pietreMesh, '🪨 Cumulo di Pietre', { x: -2.4, z: -4 }, () => {
      g.notify("Un cumulo di pietre strane. Sembrano sensibili al suono e vibrano leggermente.");
    });

    // Aggiungiamo onDrop per supportare l'uso del fischietto d'osso
    this.pietreMesh.userData.parentObj = this.objs.find(o => o.mesh === this.pietreMesh);
    if (this.pietreMesh.userData.parentObj) {
      this.pietreMesh.userData.parentObj.onDrop = (itemId) => {
        if (itemId === 'fischietto_osso') {
          if (this.tutorialStep === 5) {
            g.inv.rem('fischietto_osso');
            g.notify("🎶 Suoni il fischietto! Le pietre vibrano fortissimo e si sgretolano, rivelando una chiave!");
            scene.remove(this.pietreMesh);
            this.objs = this.objs.filter(o => o.mesh !== this.pietreMesh);

            // Spawna chiave
            this._spawnKey(scene, g);
            this.tutorialStep = 6;
          } else {
            g.notify("Non sembra il momento adatto per usare questo.");
          }
        } else {
          g.notify("Non succede nulla usando questo sul cumulo di pietre.");
        }
      };
    }

    // 4. SCRIGNO DEL TESORO
    this.chestMesh = new THREE.Group();
    this.chestMesh.name = 'Scrigno di Prova';
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x555555 });

    // Scatola scrigno
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.5), woodMat);
    box.position.y = 0.2;
    this.chestMesh.add(box);

    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.05), ironMat);
    lock.position.set(0, 0.2, 0.26);
    this.chestMesh.add(lock);

    this.chestMesh.position.set(0, 0, 3);
    scene.add(this.chestMesh);

    this.addClickable(this.chestMesh, '🔒 Scrigno del Tesoro di Prova', { x: 0, z: 2.2 }, () => {
      if (this._chestOpened) {
        g.notify("Lo scrigno è vuoto ma brilla di soddisfazione.");
      } else {
        g.notify("È chiuso a chiave. Serve una chiave per aprirlo.");
      }
    });

    // Aggiunge onDrop per la chiave
    const chestObj = this.objs.find(o => o.mesh === this.chestMesh);
    if (chestObj) {
      chestObj.onDrop = (itemId) => {
        if (itemId === 'bussola_rotta') { // Useremo bussola_rotta come "chiave" temporanea di tutorial per non confondere
          if (this.tutorialStep === 6 || g.inv.has('bussola_rotta')) {
            g.inv.rem('bussola_rotta');
            g._chestOpened = true;
            this._chestOpened = true;
            g.notify("🔓 Lo scrigno si apre! Hai completato la quest di prova!");
            g.audio.playWin();
            chestObj.label = '🔓 Scrigno Aperto';
            
            // Fai ruotare il coperchio o cambia colore serratura
            lock.material.color.setHex(0x00ff00);
            
            this.tutorialStep = 7;
            g.notify("🎉 Parla con il Vecchio Saggio per concludere!");
          } else {
            g.notify("Usa la chiave trovata sotto le pietre.");
          }
        } else {
          g.notify("Questo oggetto non apre lo scrigno.");
        }
      };
    }
  }

  _spawnKey(scene, g) {
    this.keyMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.03, 8, 16),
      new THREE.MeshLambertMaterial({ color: 0xf1c40f })
    );
    this.keyMesh.name = 'Chiave di Prova';
    this.keyMesh.position.set(-3, 0.15, -4);
    scene.add(this.keyMesh);

    this.addClickable(this.keyMesh, '🔑 Raccogli Chiave di Prova', { x: -2.5, z: -4 }, () => {
      g.inv.add('bussola_rotta'); // riusa bussola_rotta come chiave per evitare collisioni inventario
      g.notify("Hai raccolto la Chiave di Prova!");
      scene.remove(this.keyMesh);
      this.objs = this.objs.filter(o => o.mesh !== this.keyMesh);
    });
  }

  update(dt) {
    this.time += dt;

    // Fai fluttuare leggermente il mango se presente
    if (this.mangoMesh && this.mangoMesh.parent) {
      this.mangoMesh.position.y = 0.18 + Math.sin(this.time * 4) * 0.05;
      this.mangoMesh.rotation.y += dt * 1.5;
    }

    // Effetto luccichio sulla chiave
    if (this.keyMesh && this.keyMesh.parent) {
      this.keyMesh.rotation.y += dt * 2.0;
    }

    // Aggiornamento salute (non muore nel tutorial)
    if (this.g.health < 20) {
      this.g.health = 20;
      const hb = document.getElementById('health-bar');
      if (hb) hb.style.width = '20%';
    }
  }
}

window.QuestScene = QuestScene;
