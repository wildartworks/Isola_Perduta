// ============================================================
// ISLA PERDIDA — Livello 1: Il Porto delle Maree Morte
// ============================================================

class PortoScene {
  constructor(g) {
    this.g = g;
    this.objs = [];
    this.time = 0;
    this.lanterns = [];
    this.water = null;
    this.waterOffset = 0;
    this.tideDir = 1;
    this.npcs = [];
    this.crabs = [];
  }

  addClickable(mesh, label, walkTarget, action, opts = {}) {
    const objDef = { mesh, label, walkTarget, action, ...opts };
    this.objs.push(objDef);
    mesh.traverse(child => {
      if(child.isMesh) child.userData.parentObj = objDef;
    });
  }

  build() {
    const g = this.g;
    const scene = g.scene;

    // ── NEBBIA ──
    scene.fog = new THREE.FogExp2(0x1a3040, 0.055);
    scene.background = new THREE.Color(0x0a1520);

    // ── CIELO NOTTURNO ──
    const skyGeo = new THREE.SphereGeometry(50, 16, 8);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x060d15, side: THREE.BackSide });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // ── ACQUA ANIMATA ──
    const waterGeo = new THREE.PlaneGeometry(40, 40, 20, 20);
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0d3040, transparent: true, opacity: 0.85 });
    this.water = new THREE.Mesh(waterGeo, waterMat);
    this.water.name = 'Acqua';
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.y = -0.3;
    scene.add(this.water);

    // ── PONTILE PRINCIPALE (inclinato) ──
    const pontileMat = new THREE.MeshLambertMaterial({ color: 0x3d2010 });

    // Assi del pontile
    for (let i = 0; i < 8; i++) {
      const asse = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 3), pontileMat);
      asse.position.set(-3 + i * 0.85, 0.05 + Math.sin(i * 0.5) * 0.04, 0);
      asse.rotation.z = (Math.random() - 0.5) * 0.03;
      scene.add(asse);
    }

    // Mesh invisibile per rendere camminabile l'intero pontile (dal molo alla barca)
    const ponteHelper = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.05, 7.0),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    ponteHelper.position.set(-0.5, 0.05, 1.0);
    ponteHelper.name = 'Ponte_Walkable_Helper';
    scene.add(ponteHelper);

    // Banchina sinistra
    const banchinaMat = new THREE.MeshLambertMaterial({ color: 0x2a1508 });
    const banchina = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 10), banchinaMat);
    banchina.name = 'Banchina Sinistra';
    banchina.position.set(-5, 0, -1);
    banchina.rotation.z = -0.02;
    scene.add(banchina);

    // ── PALAFITTE ──
    const palMat = new THREE.MeshLambertMaterial({ color: 0x2a1000 });
    [[-4, -3], [-2, -3], [0, -3], [2, -3], [-5, 0], [-5, -2]].forEach(([x, z]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3, 6), palMat);
      p.position.set(x, -1.3, z);
      p.rotation.z = (Math.random() - 0.5) * 0.08;
      scene.add(p);
    });

    // ── EDIFICIO INCLINATO ──
    const edMat = new THREE.MeshLambertMaterial({ color: 0x1a1008 });
    const edificio = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 2.5), edMat);
    edificio.name = 'Edificio Porto';
    edificio.position.set(-5.5, 1.5, -2);
    edificio.rotation.z = -0.06;
    scene.add(edificio);
    const tetto = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 4), new THREE.MeshLambertMaterial({ color: 0x0d0804 }));
    tetto.name = 'Tetto Edificio Porto';
    tetto.position.set(-5.5, 3.2, -2);
    tetto.rotation.z = -0.06;
    tetto.rotation.y = Math.PI / 4;
    scene.add(tetto);

    // ── LANTERNE (flickering) ──
    const lanternPositions = [[-3, 1.8, 1], [0, 1.8, 1], [3, 1.8, 1]];
    lanternPositions.forEach(([x, y, z]) => {
      const lGeo = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), new THREE.MeshLambertMaterial({ color: 0xffaa22, emissive: 0xff8800, emissiveIntensity: 1 }));
      lGeo.position.set(x, y, z);
      scene.add(lGeo);
      const light = new THREE.PointLight(0xff6600, 1.2, 6);
      light.position.set(x, y - 0.2, z);
      scene.add(light);
      this.lanterns.push(light);
    });

    // Lanterna blu separata (oggetto interattivo)
    const lanternaBluMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.25), new THREE.MeshLambertMaterial({ color: 0x0044ff, emissive: 0x002299, emissiveIntensity: 1 }));
    lanternaBluMesh.name = 'Lanterna Blu';
    lanternaBluMesh.position.set(-5, 1.2, -1);
    scene.add(lanternaBluMesh);
    const lanternaBluLight = new THREE.PointLight(0x2244ff, 1.5, 5);
    lanternaBluLight.position.set(-5, 1.0, -1);
    scene.add(lanternaBluLight);
    this.addClickable(lanternaBluMesh, 'Lanterna Blu', { x: -4.5, z: -0.5 }, () => {
      if (!g.inv.has('lanterna_blu')) {
        g.inv.add('lanterna_blu');
        g.notify('Hai preso la Lanterna Blu. Illumina le scritte sulle pareti... ma le pareti sono vuote.');
        scene.remove(lanternaBluMesh);
        scene.remove(lanternaBluLight);
        this.objs = this.objs.filter(o => o.mesh !== lanternaBluMesh);
      } else {
        g.notify('La Lanterna Blu è già nel tuo zaino.');
      }
    });

    // ── TERRENO DELL'ISOLA A SINISTRA DELLA BANCHINA ──
    const isolaMat = new THREE.MeshLambertMaterial({ color: 0x8b7355 }); // sabbia scura/terra
    const isolaTerreno = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 12), isolaMat);
    isolaTerreno.position.set(-10, -0.1, -1);
    isolaTerreno.name = "Terreno Isola (Spiaggia)";
    scene.add(isolaTerreno);

    // Decorazione vegetazione isola (palma stilizzata)
    const troncoPalma = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 3), new THREE.MeshLambertMaterial({ color: 0x5c4033 }));
    troncoPalma.position.set(-10, 1.5, -2);
    troncoPalma.rotation.z = 0.15;
    scene.add(troncoPalma);
    const fogliePalma = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshLambertMaterial({ color: 0x2e8b57 }));
    fogliePalma.position.set(-9.75, 3.1, -2);
    scene.add(fogliePalma);

    // ── BARCA DI CAPITAN UMBER ──
    const barcaMat = new THREE.MeshLambertMaterial({ color: 0x4a2c10 });
    const barca = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.7, 5), barcaMat);
    barca.position.set(3, 0.1, -2);
    barca.rotation.y = 0.15;
    barca.name = "Barca di Capitan Umber";
    scene.add(barca);

    // Mesh invisibile per rendere camminabile la barca e la zona zattera
    const barcaHelper = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.05, 5.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    barcaHelper.position.set(4.0, 0.45, -2.0);
    barcaHelper.rotation.y = 0.1;
    barcaHelper.name = 'Barca_Walkable_Helper';
    scene.add(barcaHelper);
    const velaMat = new THREE.MeshLambertMaterial({ color: 0xccbbaa, side: THREE.DoubleSide });
    const vela = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3), velaMat);
    vela.name = 'Vela Barca Umber';
    vela.position.set(3, 1.8, -2);
    vela.rotation.y = 0.15;
    scene.add(vela);
    this.addClickable(barca, 'Barca del Pescatore', { x: 3, z: -0.5 }, () => {
      g.notify('"Questa barca è la mia casa," dice Umber. "Se vuoi andartene dall\'isola, c\'è una piccola ZATTERA attraccata qui a fianco."');
    });

    // ── ZATTERA (Piccole dimensioni) ──
    const zatteraMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const zattera = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 2.2), zatteraMat);
    zattera.position.set(5.2, -0.1, -1.8);
    zattera.rotation.y = -0.1;
    zattera.name = "Zattera di Salvataggio";
    scene.add(zattera);

    // Dettaglio tronchi zattera
    for(let i = -2; i <= 2; i++) {
      const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0), zatteraMat);
      tronco.rotation.x = Math.PI / 2;
      tronco.position.set(5.2 + i * 0.3, -0.05, -1.8);
      scene.add(tronco);
    }

    this.addClickable(zattera, 'Zattera', { x: 5.2, z: -1.8 }, () => {
      if (!g.flags.amo_consegnato) {
        g.notify('"Usa pure la mia zattera," dice Umber. "Ma prima aiutami con l\'amo, la memoria mi inganna."');
      } else {
        g.win_level1();
      }
    });

    // ── RETE DA PESCA (con oggetti assurdi) ──
    const reteMat = new THREE.MeshLambertMaterial({ color: 0x2a4a20, wireframe: true });
    const rete = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), reteMat);
    rete.name = 'Rete da Pesca';
    rete.position.set(1.0, 0.5, 1.5);
    rete.rotation.y = -0.3;
    scene.add(rete);
    this.addClickable(rete, 'Rete da Pesca', { x: 1, z: 0.8 }, () => {
      g.notify('La rete è piena di: un cappello da funzionario, tre bottiglie di acqua frizzante e quello che sembra un trattato di filosofia medievale. Nessun pesce.');
    });

    // ── AMO GIGANTE ──
    const amoMesh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 16, Math.PI * 1.5), new THREE.MeshLambertMaterial({ color: 0x7a5a40 }));
    amoMesh.name = 'Amo Arrugginito';
    amoMesh.position.set(-9.0, 0.3, 1.0);
    amoMesh.rotation.z = Math.PI / 4;
    scene.add(amoMesh);
    this.addClickable(amoMesh, 'Amo Arrugginito', { x: -8.5, z: 1.0 }, () => {
      if (!g.inv.has('amo_gigante')) {
        g.inv.add('amo_gigante');
        g.notify('Hai raccolto l\'Amo Gigante Arrugginito. Sembra importante per qualcuno.');
        scene.remove(amoMesh);
        this.objs = this.objs.filter(o => o.mesh !== amoMesh);
      } else {
        g.notify('L\'amo è già nel tuo zaino.');
      }
    });

    // ── BOTTIGLIA CON MESSAGGIO ──
    const bottMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0x336644 }));
    bottMesh.name = 'Bottiglia con Messaggio';
    bottMesh.position.set(-10.0, 0.3, -1.0);
    scene.add(bottMesh);
    this.addClickable(bottMesh, 'Bottiglia con Messaggio', { x: -9.0, z: -1.0 }, () => {
      if (!g.inv.has('bottiglia_msg')) {
        g.inv.add('bottiglia_msg');
        g.notify('Il messaggio recita: "FI-" e poi il resto è strappato. O mangiato. Probabile che sia l\'isola.');
        g.setFlag('pezzo_bottiglia');
        scene.remove(bottMesh);
        this.objs = this.objs.filter(o => o.mesh !== bottMesh);
      } else {
        g.notify('La bottiglia è già nel tuo zaino.');
      }
    });

    // ── CAMPANA ──
    const campanaMesh = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 8, 1, true), new THREE.MeshLambertMaterial({ color: 0x7a6040 }));
    campanaMesh.name = 'Campana Arrugginita';
    campanaMesh.position.set(-6, 2.5, 0);
    scene.add(campanaMesh);
    this.addClickable(campanaMesh, 'Campana Arrugginita', { x: -5, z: 0.5 }, () => {
      if (g.inv.has('granchio_mec')) {
        g.inv.rem('granchio_mec');
        g.notify('Lanci il granchio meccanico contro la campana! DONG! Cade una bussola.');
        
        const bussolaMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16), new THREE.MeshLambertMaterial({ color: 0xaa8844 }));
        bussolaMesh.position.set(-5, 0.1, 0.5);
        scene.add(bussolaMesh);
        
        this.addClickable(bussolaMesh, 'Bussola Rotta', { x: -4.5, z: 0.8 }, () => {
           if(!g.inv.has('bussola_rotta')) {
             g.inv.add('bussola_rotta');
             g.notify("Hai raccolto la Bussola Rotta. Segna sempre il basso.");
             scene.remove(bussolaMesh);
             this.objs = this.objs.filter(o => o.mesh !== bussolaMesh);
           } else {
             g.notify('La bussola è già nel tuo zaino.');
           }
        });
      } else {
        g.notify('La campana è troppo in alto. Serve qualcosa da lanciarle contro.');
      }
    }, {
      onDrop: (itemId) => {
        if(itemId === 'granchio_mec') {
          g.inv.rem('granchio_mec');
          g.notify('Lanci il granchio meccanico contro la campana! DONG! Cade una bussola.');
          
          const bussolaMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16), new THREE.MeshLambertMaterial({ color: 0xaa8844 }));
          bussolaMesh.position.set(-5, 0.1, 0.5);
          scene.add(bussolaMesh);
          
          this.addClickable(bussolaMesh, 'Bussola Rotta', { x: -4.5, z: 0.8 }, () => {
             if(!g.inv.has('bussola_rotta')) {
               g.inv.add('bussola_rotta');
               g.notify("Hai raccolto la Bussola Rotta. Segna sempre il basso.");
               scene.remove(bussolaMesh);
               this.objs = this.objs.filter(o => o.mesh !== bussolaMesh);
             } else {
               g.notify('La bussola è già nel tuo zaino.');
             }
          });
          
        } else {
          g.notify("Lanciare " + (GAME_DATA.items[itemId]?.name || "questo") + " non ha alcun effetto.");
        }
      }
    });

    // ── GRANCHIO MECCANICO ──
    const granchioMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.6), new THREE.MeshLambertMaterial({ color: 0x8a3010 }));
    granchioMesh.name = 'Granchio Meccanico';
    granchioMesh.position.set(-4.5, 0.25, 2.0);
    scene.add(granchioMesh);
    this.addClickable(granchioMesh, 'Granchio Meccanico', { x: -4.5, z: 1.5 }, () => {
      if (!g.inv.has('granchio_mec')) {
        g.inv.add('granchio_mec');
        g.notify('Il Granchio Meccanico ticchetta tra le tue mani. Una piccola chiave sul dorso gira da sola.');
        scene.remove(granchioMesh);
        this.objs = this.objs.filter(o => o.mesh !== granchioMesh);
      } else {
        g.notify('Il granchio è già nel tuo zaino. Sta ancora ticchettando.');
      }
    });

    // ── GABBIANI STATICI (gag) ──
    for (let i = 0; i < 4; i++) {
      const gab = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 4), new THREE.MeshLambertMaterial({ color: 0xddddcc }));
      gab.position.set(-3 + i * 2, 2.5 + Math.random() * 0.5, -1);
      gab.rotation.z = Math.PI;
      scene.add(gab);
    }

    // ── NPC: PESCATORE ──
    const pescat = this._createNPC(0x3a2010, -2, 0.8, 1);
    pescat.name = 'Capitan Umber';
    this.addClickable(pescat, 'Capitan Umber', { x: -1.5, z: 1.5 }, () => {
      g.startDialog('pescatore', GAME_DATA.dialogs_l1.pescatore);
    }, {
      onDrop: (itemId) => {
        if (itemId === 'amo_gigante') {
          g.inv.rem('amo_gigante'); // Rimuoviamo l'amo dall'inventario
          g.startDialog('pescatore', GAME_DATA.dialogs_l1.pescatore, 'amo_consegna');
        } else {
          g.notify("Umber guarda l'oggetto e scuote la testa confuso.");
        }
      }
    });

    // ── NPC: GUARDIA ──
    const guardia = this._createNPC(0x1a2a10, 2.5, 0.8, 1.0);
    guardia.name = 'Torv — Guardia del Porto';
    this.addClickable(guardia, 'Torv — Guardia del Porto', { x: 2.0, z: 1.0 }, () => {
      g.startDialog('guardia', GAME_DATA.dialogs_l1.guardia);
    });

    // ── NPC: BAMBINO ──
    const bambino = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.5, 4, 8), new THREE.MeshLambertMaterial({ color: 0x4a3020 }));
    bambino.name = 'Pip — Il Bambino delle Mappe';
    bambino.position.set(-9.0, 0.45, -3.5);
    scene.add(bambino);
    this.addClickable(bambino, 'Pip — Il Bambino delle Mappe', { x: -8.2, z: -3.5 }, () => {
      g.startDialog('bambino', GAME_DATA.dialogs_l1.bambino);
    });

    // ── CASSA DI PROVVISTE (Cibo e Acqua nel livello 1) ──
    const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const boxMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
    const crate = new THREE.Mesh(boxGeo, boxMat);
    crate.name = "Cassa di Provviste";
    crate.position.set(-6.2, 0.25, 0.5);
    scene.add(crate);
    
    this.addClickable(crate, "Cassa di Provviste", { x: -5.6, z: 0.5 }, () => {
      if (!g.inv.has('pesce_essiccato') && !g.inv.has('acqua_dolce')) {
        g.inv.add('pesce_essiccato');
        g.inv.add('acqua_dolce');
        g.notify("🐟 Trovato Pesce Essiccato e Acqua Dolce nella cassa!");
        scene.remove(crate);
        this.objs = this.objs.filter(o => o.mesh !== crate);
      } else {
        g.notify("La cassa di provviste è ormai vuota.");
      }
    });

    // ── INIZIALIZZAZIONE MOVIMENTO NPC ──
    const initNPC = (npc, range) => {
      npc.userData.home = npc.position.clone();
      npc.userData.walkTarget = npc.position.clone();
      npc.userData.isMoving = false;
      npc.userData.walkTimer = Math.random() * 2;
      npc.userData.range = range;
      this.npcs.push(npc);
    };
    initNPC(pescat, 2.5);
    initNPC(guardia, 0.5);
    initNPC(bambino, 1.5);

    // ── LUCI AMBIENTE ──
    scene.add(new THREE.AmbientLight(0x0a1e2a, 0.6));
    const moonLight = new THREE.DirectionalLight(0x4466aa, 0.5);
    moonLight.position.set(-5, 10, 5);
    scene.add(moonLight);

    // ── DECORAZIONE: RESIDUI DI LEGNO A RIVA (DRIFTWOOD) ──
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4a321a });
    const woods = [
      { size: [0.08, 0.08, 1.2], pos: [-7.3, 0.1, -2.5], rot: [0.1, 0.4, 0.1] },
      { size: [0.06, 0.06, 0.8], pos: [-7.1, 0.08, 0.5], rot: [-0.05, -0.6, 0.15] },
      { size: [0.09, 0.09, 1.5], pos: [-7.4, 0.11, 2.8], rot: [0.2, 0.1, -0.1] }
    ];
    woods.forEach(w => {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(w.size[0], w.size[0], w.size[2], 8), woodMat);
      log.name = "Residuo di Legno";
      log.position.set(w.pos[0], w.pos[1], w.pos[2]);
      log.rotation.set(w.rot[0], w.rot[1], w.rot[2]);
      scene.add(log);
    });

    // ── DECORAZIONE: GRANCHI VAGABONDI SULLA SPIAGGIA ──
    for (let i = 0; i < 3; i++) {
      const crab = new THREE.Group();
      crab.name = 'Granchio Vagabondo';
      // Corpo rosso
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.15), new THREE.MeshLambertMaterial({ color: 0xd35400 }));
      body.position.y = 0.04;
      crab.add(body);
      // Occhietti
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), eyeMat);
      eyeL.position.set(-0.04, 0.1, 0.06);
      const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.01, 3, 3), pupilMat);
      pupilL.position.set(-0.04, 0.1, 0.07);
      crab.add(eyeL);
      crab.add(pupilL);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), eyeMat);
      eyeR.position.set(0.04, 0.1, 0.06);
      const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.01, 3, 3), pupilMat);
      pupilR.position.set(0.04, 0.1, 0.07);
      crab.add(eyeR);
      crab.add(pupilR);
      // Chele
      const clawMat = new THREE.MeshLambertMaterial({ color: 0xe67e22 });
      const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.08), clawMat);
      clawL.position.set(-0.1, 0.04, 0.07);
      crab.add(clawL);
      const clawR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.08), clawMat);
      clawR.position.set(0.1, 0.04, 0.07);
      crab.add(clawR);

      // Posiziona sulla spiaggia (-12.0 < x < -7.5, -4.5 < z < 4.5)
      crab.position.set(-11.5 + Math.random() * 3.5, 0.2, -4.0 + Math.random() * 8.0);
      crab.userData = {
        home: crab.position.clone(),
        target: crab.position.clone(),
        speed: 0.4 + Math.random() * 0.3,
        timer: Math.random() * 3
      };
      scene.add(crab);
      this.crabs.push(crab);
    }
  }

  _createNPC(color, x, y, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.9, 4, 8), new THREE.MeshLambertMaterial({ color }));
    body.position.y = 0;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshLambertMaterial({ color: 0xc09060 }));
    head.position.y = 0.85;
    group.add(head);
    group.position.set(x, y, z);
    this.g.scene.add(group);
    return group;
  }

  update(dt) {
    this.time += dt;

    // ── MOVIMENTO GRANCHI VAGABONDI SULLA SPIAGGIA ──
    this.crabs.forEach(crab => {
      crab.userData.timer += dt;
      if (crab.userData.timer > 2 + Math.random() * 3) {
        crab.userData.timer = 0;
        // Pick new target within beach boundary (-12.0 < x < -7.5, -4.5 < z < 4.5)
        crab.userData.target.set(
          -12.0 + Math.random() * 4.5,
          0.1,
          -4.5 + Math.random() * 9.0
        );
      }
      const dx = crab.userData.target.x - crab.position.x;
      const dz = crab.userData.target.z - crab.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 0.05) {
        crab.position.x += (dx / dist) * crab.userData.speed * dt;
        crab.position.z += (dz / dist) * crab.userData.speed * dt;
        crab.rotation.y = Math.atan2(dx, dz);
        // Wobble/tilt side to side as it walks
        crab.rotation.z = Math.sin(this.time * 12) * 0.12;
      } else {
        crab.rotation.z = 0;
      }
    });

    // Flickering lanterne
    this.lanterns.forEach((l, i) => {
      l.intensity = 1.0 + Math.sin(this.time * 3 + i * 1.3) * 0.4 + Math.random() * 0.1;
    });

    // Maree impossibili: il piano dell'acqua sale e scende rapidamente
    this.waterOffset += dt * 0.4 * this.tideDir;
    if (this.waterOffset > 1.5) this.tideDir = -1;
    if (this.waterOffset < -0.5) this.tideDir = 1;
    if (this.water) this.water.position.y = -0.3 + this.waterOffset * 0.3;

    // Ondulazione superficie acqua
    if (this.water && this.water.geometry) {
      const pos = this.water.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, Math.sin(x * 0.5 + this.time * 0.8) * 0.12 + Math.cos(z * 0.4 + this.time * 0.6) * 0.08);
      }
      pos.needsUpdate = true;
    }

    // ── MOVIMENTO NPC ──
    const pPos = this.g.player ? this.g.player.grp.position : null;
    const isDialog = this.g.state === 'DIALOG';
    const NPC_RADIUS = 0.55; // raggio collisione NPC

    this.npcs.forEach(npc => {
      let stop = isDialog;
      if (pPos) {
        const dToPlayer = Math.sqrt(Math.pow(npc.position.x - pPos.x, 2) + Math.pow(npc.position.z - pPos.z, 2));
        if (dToPlayer < 2.5) {
          stop = true;
          // Ruota verso il giocatore
          const dx = pPos.x - npc.position.x;
          const dz = pPos.z - npc.position.z;
          npc.rotation.y = Math.atan2(dx, dz);
        }
      }

      if (stop) {
        npc.userData.isMoving = false;
        npc.position.y = npc.userData.home.y;
        return;
      }

      npc.userData.walkTimer += dt;
      if (npc.userData.walkTimer > 3 + Math.random() * 3) {
        npc.userData.walkTimer = 0;
        if (npc.userData.isMoving) {
          npc.userData.isMoving = false;
        } else {
          npc.userData.isMoving = true;
          const rx = npc.userData.home.x + (Math.random() - 0.5) * npc.userData.range * 2;
          const rz = npc.userData.home.z + (Math.random() - 0.5) * npc.userData.range * 2;
          npc.userData.walkTarget.set(rx, npc.userData.home.y, rz);
        }
      }

      if (npc.userData.isMoving) {
        const dx = npc.userData.walkTarget.x - npc.position.x;
        const dz = npc.userData.walkTarget.z - npc.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist > 0.1) {
          const speed = 0.8;
          npc.position.x += (dx/dist) * speed * dt;
          npc.position.z += (dz/dist) * speed * dt;
          npc.rotation.y = Math.atan2(dx, dz);
          npc.position.y = npc.userData.home.y + Math.abs(Math.sin(this.time * 8)) * 0.1;
        } else {
          npc.userData.isMoving = false;
          npc.position.y = npc.userData.home.y;
        }
      } else {
        npc.position.y = npc.userData.home.y;
      }
    });

    // ── SEPARAZIONE NPC ↔ NPC (collisione fra personaggi) ──
    for (let i = 0; i < this.npcs.length; i++) {
      for (let j = i + 1; j < this.npcs.length; j++) {
        const a = this.npcs[i];
        const b = this.npcs[j];
        const dx = a.position.x - b.position.x;
        const dz = a.position.z - b.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = NPC_RADIUS * 2;
        if (dist < minDist && dist > 0.0001) {
          const push = (minDist - dist) * 0.5;
          a.position.x += (dx / dist) * push;
          a.position.z += (dz / dist) * push;
          b.position.x -= (dx / dist) * push;
          b.position.z -= (dz / dist) * push;
        }
      }
    }

    // Indicatore spawn Barca
    if (this.g.flags.amo_consegnato) {
      if (!this.boatSpawnLight) {
        this.boatSpawnLight = new THREE.PointLight(0x00ff00, 2, 5);
        this.boatSpawnLight.position.set(3, 1, -2);
        this.g.scene.add(this.boatSpawnLight);
        
        const geo = new THREE.SphereGeometry(0.3, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
        this.boatSpawnMesh = new THREE.Mesh(geo, mat);
        this.boatSpawnMesh.position.set(3, 1, -2);
        this.g.scene.add(this.boatSpawnMesh);
      }
      this.boatSpawnLight.intensity = 1.5 + Math.sin(this.time * 5) * 1.5;
      this.boatSpawnMesh.material.opacity = 0.5 + Math.sin(this.time * 5) * 0.3;
      this.boatSpawnMesh.position.y = 1 + Math.sin(this.time * 3) * 0.2;
    }
  }
}
