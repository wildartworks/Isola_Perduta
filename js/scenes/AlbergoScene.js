// ============================================================
// ISLA PERDIDA — Livello 3: L'Albergo delle Ombre
// ============================================================

class AlbergoScene {
  constructor(g) {
    this.g = g;
    this.objs = [];
    this.time = 0;
    this.npcs = [];
    this.lightningTimer = 0;
    this.pianoKeys = [];
    this.pianoNotesTimer = 0;
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

    // Nebbia rosso cupo/nera
    scene.fog = new THREE.FogExp2(0x1a0505, 0.05);
    scene.background = new THREE.Color(0x0a0202);

    // Luci ambiente soffuse
    scene.add(new THREE.AmbientLight(0x221111, 0.6));
    
    // Luce dei lampi (Directional Bianca Fredda, normalmente debole)
    this.lightningLight = new THREE.DirectionalLight(0xffffff, 0.1);
    this.lightningLight.position.set(5, 15, -5);
    scene.add(this.lightningLight);

    // Luce oro caldo per lampadari tremolanti
    this.chandelierLight = new THREE.PointLight(0xd4a040, 1.2, 18);
    this.chandelierLight.position.set(0, 4.5, 3);
    scene.add(this.chandelierLight);

    // ── LOBBY PAVIMENTO (Moquette rosso scuro) ──
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x5a0a0a }); // Moquette rossa
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.name = 'Moquette Rossa';
    scene.add(floor);

    // Pareti di legno scuro e oro
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x1c0f0a });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 6, 0.5), wallMat);
    backWall.position.set(0, 3, -8);
    scene.add(backWall);

    // Modanature in oro antico sulle pareti
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xc8a040 });
    for(let i = -12; i <= 12; i += 6) {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 0.1), goldMat);
      trim.position.set(i, 2.5, -7.7);
      scene.add(trim);
    }

    // ── COLONNE IN ORO ANTICO ──
    const colMat = new THREE.MeshLambertMaterial({ color: 0x8a6c2d });
    [[-8, -4], [-8, 2], [8, -4], [8, 2]].forEach(([x, z]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 6, 8), colMat);
      col.position.set(x, 3, z);
      scene.add(col);
    });

    // ── PIANOFORTE CHE SUONA DA SOLO ──
    this._buildPiano(scene);

    // ── ASCENSORE CHE SI APRE SU UN MURO (Estetica decadente) ──
    const elevatorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 0.4), colMat);
    elevatorFrame.position.set(-5, 1.6, -7.8);
    scene.add(elevatorFrame);
    
    // Muro di mattoni dietro le porte aperte dell'ascensore
    const brickMat = new THREE.MeshLambertMaterial({ color: 0x4a2c1e });
    const brickWall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.8, 0.1), brickMat);
    brickWall.position.set(-5, 1.4, -7.7);
    scene.add(brickWall);

    this.addClickable(elevatorFrame, 'Ascensore Bloccato', { x: -5, z: -6.5 }, () => {
      g.notify('Le porte dell\'ascensore si aprono con un gemito metallico... rivelando solo un solido muro di mattoni.');
    });

    // ── PORTIERA/BANCO RECEPTION ──
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 1.2), wallMat);
    desk.position.set(5, 0.5, -5);
    scene.add(desk);
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 1.4), goldMat);
    deskTop.position.set(5, 1.05, -5);
    scene.add(deskTop);

    // Specchio incrinato sopra la reception
    const specchioFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.1), colMat);
    specchioFrame.position.set(5, 2.2, -7.8);
    scene.add(specchioFrame);
    const specchioVetro = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), new THREE.MeshLambertMaterial({ color: 0x88aabb, emissive: 0x112233, transparent: true, opacity: 0.85 }));
    specchioVetro.position.set(5, 2.2, -7.7);
    specchioVetro.name = 'Specchio Incrinato';
    scene.add(specchioVetro);

    this.addClickable(specchioVetro, 'Specchio Incrinato', { x: 5, z: -6.2 }, () => {
      if (!g.flags.riflesso_ripristinato) {
        g.notify('Guardando nello specchio vedi la stanza, ma la tua figura non appare. C\'è una crepa che attraversa il vetro.');
      } else {
        g.notify('Ora lo specchio mostra chiaramente il tuo riflesso e quello della Donna salvata.');
      }
    });

    // ── LE DUE STANZE DEL TEMPO (PORTE INTERATTIVE) ──
    // Porta 1936 (Il Passato)
    const door1936 = this._createDoor(scene, -2, '1936');
    this.addClickable(door1936, 'Stanza 1936 (Il Passato)', { x: -2, z: -6.5 }, () => {
      this._enterStanza1936(g);
    });

    // Porta 2048 (Il Futuro)
    const door2048 = this._createDoor(scene, 2, '2048');
    this.addClickable(door2048, 'Stanza 2048 (Il Futuro)', { x: 2, z: -6.5 }, () => {
      this._enterStanza2048(g);
    });

    // Porta 404 (La stanza dell'enigma)
    const door404 = this._createDoor(scene, -8, '404');
    this.addClickable(door404, 'Stanza 404 (Chiusa)', { x: -8, z: -6.5 }, () => {
      if (g.inv.has('chiave_404')) {
        g.inv.rem('chiave_404');
        g.setFlag('stanza_404_aperta');
        g.notify('🔓 Usi la Chiave della Stanza 404 per sbloccare la porta!');
        // Rinomina l'azione
        this.objs.find(o => o.mesh === door404).label = 'Stanza 404';
      } else if (g.flags.stanza_404_aperta) {
        this._enterStanza404(g);
      } else {
        g.notify('La porta della Stanza 404 è saldamente chiusa a chiave.');
      }
    });

    // ── NPC E STRUTTURE DEL LIVELLO ──
    this._buildNPCs(scene, g);
    this._buildItems(scene, g);
  }

  _createDoor(scene, x, labelText) {
    const grp = new THREE.Group();
    grp.name = 'Porta ' + labelText;

    // Cornice porta
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.2), new THREE.MeshLambertMaterial({ color: 0x3d2010 }));
    frame.position.y = 1.4;
    grp.add(frame);

    // Pannello porta (nero lucido)
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.6, 0.1), new THREE.MeshLambertMaterial({ color: 0x0a0a0a }));
    panel.position.set(0, 1.4, 0.05);
    grp.add(panel);

    // Targa dorata con numero
    const targa = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.05), new THREE.MeshLambertMaterial({ color: 0xc8a040 }));
    targa.position.set(0, 2.0, 0.12);
    grp.add(targa);

    grp.position.set(x, 0, -7.8);
    scene.add(grp);
    return grp;
  }

  _buildPiano(scene) {
    const pianoGrp = new THREE.Group();
    pianoGrp.name = 'Pianoforte Spettrale';

    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x111111 }); // nero lucido
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xc8a040 });

    // Cassa pianoforte
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.4), bodyMat);
    body.position.y = 1.0;
    pianoGrp.add(body);

    // Gambe
    for(let i = -0.9; i <= 0.9; i += 1.8) {
      for(let j = -0.5; j <= 0.5; j += 1.0) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.6), bodyMat);
        leg.position.set(i, 0.3, j);
        pianoGrp.add(leg);
      }
    }

    // Tastiera
    const keysFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.25), bodyMat);
    keysFrame.position.set(0, 1.0, 0.75);
    pianoGrp.add(keysFrame);

    // Tasti finti (alternanza bianco/nero spettrale)
    for(let k = 0; k < 12; k++) {
      const key = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      key.position.set(-0.75 + k * 0.14, 1.08, 0.78);
      pianoGrp.add(key);
      this.pianoKeys.push(key);
    }

    pianoGrp.position.set(-6, 0, 4);
    pianoGrp.rotation.y = Math.PI / 4;
    scene.add(pianoGrp);

    this.addClickable(pianoGrp, 'Pianoforte Autonomo', { x: -5, z: 3 }, () => {
      this.g.notify('Il pianoforte suona da solo una triste melodia jazz degli anni \'30. I tasti si abbassano nel vuoto.');
      this.g.audio.playTone(329.63, 'sine', 0.8, 0.08); // Suona una nota
    });
  }

  _buildNPCs(scene, g) {
    // ── Concierge Fantasma ──
    const concierge = this._createNPC(scene, 0x111122, 5, 0.8, -3.8); // Grigio/Blu spettrale
    concierge.name = 'Concierge Fantasma';
    
    // Aggiungiamo un velo semitrasparente bluastro per farlo sembrare un fantasma
    concierge.traverse(child => {
      if(child.isMesh) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.65;
        child.material.emissive = new THREE.Color(0x2244bb);
        child.material.emissiveIntensity = 0.5;
      }
    });

    this.addClickable(concierge, 'Concierge Fantasma', { x: 4.2, z: -3.8 }, () => {
      g.startDialog('concierge', GAME_DATA.dialogs_l3.concierge);
    });

    // ── Donna Senza Riflesso ──
    const donna = this._createNPC(scene, 0x4a0a20, -11, 0.8, -4); // Vestito porpora
    donna.name = 'Donna senza Riflesso';
    donna.rotation.y = Math.PI / 2;

    this.addClickable(donna, 'Donna senza Riflesso', { x: -10, z: -4 }, () => {
      g.startDialog('donna', GAME_DATA.dialogs_l3.donna);
    });

    // ── Pianista Cieco ──
    const pianista = this._createNPC(scene, 0x222222, -6.8, 0.8, 4.8);
    pianista.name = 'Pianista Cieco';
    this.addClickable(pianista, 'Pianista Cieco', { x: -6, z: 4 }, () => {
      g.startDialog('pianista', GAME_DATA.dialogs_l3.pianista);
    });

    this.npcs.push(concierge, donna, pianista);
  }

  _buildItems(scene, g) {
    // Specchio incrinato raccoglibile (specchio_incrinato)
    // Tazza da tè ancora calda (tazza_te)
    // Fotografia bruciata (foto_bruciata)
    // Violino rotto (violino_rotto)
    // Chiave stanza 404 (chiave_404)

    // Tazza da tè calda posizionata vicino al banco concierge
    const tazza = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    tazza.position.set(4.5, 1.15, -4.8);
    scene.add(tazza);
    this.tazzaMesh = tazza;
    this.addClickable(tazza, 'Tazza da tè ancora calda', { x: 4.2, z: -4.8 }, () => {
      if (!g.inv.has('tazza_te')) {
        if (!g.flags.pianista_suona) {
          g.notify('Il Concierge Fantasma ti ringhia contro: "Ehi, giù le mani! Quel tè centenario è mio. Portami della buona musica e potremo parlarne!"');
        } else {
          g.inv.add('tazza_te');
          g.notify('☕ Tazza da tè raccolta. Incredibilmente, emana ancora calore, come se fosse stata appena versata.');
          scene.remove(tazza);
          this.objs = this.objs.filter(o => o.mesh !== tazza);
          this.tazzaMesh = null;
        }
      }
    });

    // Violino rotto posizionato nell'angolo spoglio della lobby
    const violino = new THREE.Group();
    violino.name = 'Violino Rotto';
    const vBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.05), new THREE.MeshLambertMaterial({ color: 0x8b5a2b }));
    violino.add(vBody);
    const vNeck = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.03), new THREE.MeshLambertMaterial({ color: 0x3d2010 }));
    vNeck.position.y = 0.25;
    violino.add(vNeck);
    violino.position.set(-11, 0.2, 7);
    violino.rotation.set(0.5, 0.3, 0.8);
    scene.add(violino);

    this.addClickable(violino, 'Violino Rotto', { x: -10, z: 6.5 }, () => {
      if (!g.inv.has('violino_rotto')) {
        g.inv.add('violino_rotto');
        g.notify('🎻 Violino Rotto raccolto. Le corde sono spezzate e il legno è scheggiato. Sembra irrecuperabile.');
        scene.remove(violino);
        this.objs = this.objs.filter(o => o.mesh !== violino);
      }
    });

    // Cassa di provviste nel livello 3
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0x3d2010 }));
    crate.position.set(11, 0.25, 6);
    scene.add(crate);
    this.addClickable(crate, 'Cassa di Provviste', { x: 10, z: 5.5 }, () => {
      if (!g.inv.has('pesce_essiccato') && !g.inv.has('acqua_dolce')) {
        g.inv.add('pesce_essiccato');
        g.inv.add('acqua_dolce');
        g.notify('🐟 Trovate provviste extra (Pesce ed Acqua) nella cassa.');
        scene.remove(crate);
        this.objs = this.objs.filter(o => o.mesh !== crate);
      }
    });
  }

  // ── LOGICA DELLE STANZE DEL TEMPO ──
  _enterStanza1936(g) {
    g.startDialog('stanza_1936', [
      { id:'start', speaker:'Stanza 1936 (Il Passato)', portrait:'🚪',
        text:'Entri nella Stanza 1936. L\'aria profuma di lavanda freschissima e cera d\'api per mobili. Tutto è in perfetto ordine, ignaro del destino infuocato che lo attende.',
        choices:[
          { text:'Cerca nella stanza', next:'cerca' },
          { text:'Esci nel corridoio', next:'end' }
        ]
      },
      { id:'cerca', speaker:'Stanza 1936 (Il Passato)', portrait:'🚪',
        text:'Sotto il comò c\'è una valigia aperta e un documento d\'epoca. Sotto il cuscino del letto in perfetto ordine noti qualcosa di metallico. Su una poltrona c\'è una lussuosa custodia da strumenti musicali.',
        choices:[
          { text:'Prendi la Chiave della Stanza 404 sotto il cuscino', next:'prendi_chiave', requireFlag:'!preso_chiave_404' },
          { text:'Esamina la custodia del violino sulla poltrona', next:'custodia_violino' },
          { text:'Indietro', next:'start' }
        ]
      },
      { id:'prendi_chiave', speaker:'Stanza 1936 (Il Passato)', portrait:'🚪',
        text:'Hai raccolto la Chiave della Stanza 404. Ha una targhetta d\'ottone con inciso il numero 404.',
        choices:[{ text:'Bene.', next:'cerca', giveItem:'chiave_404', giveFlag:'preso_chiave_404' }]
      },
      { id:'custodia_violino', speaker:'Stanza 1936 (Il Passato)', portrait:'🚪',
        text:'Apri la custodia. All\'interno riposa un Violino Accordato immacolato e lucido. Una targhetta d\'oro dice: "Proprietà del Pianista dell\'Hotel". Non puoi semplicemente rubarlo: il continuum temporale si spezzerebbe senza un rimpiazzo equivalente del presente.',
        choices:[
          { text:'[SCAMBIA] Sostituisci il Violino Rotto del presente con questo sano', next:'violino_scambiato', requireItem:'violino_rotto' },
          { text:'Chiudi la custodia e torna a cercare', next:'cerca', requireFlag:'!violino_scambiato' },
          { text:'Vedi il violino rotto che hai scambiato adagiato nella custodia.', next:'cerca', requireFlag:'violino_scambiato' }
        ]
      },
      { id:'violino_scambiato', speaker:'Stanza 1936 (Il Passato)', portrait:'🚪',
        text:'Deponi delicatamente il violino distrutto del presente nella custodia e afferri il violino perfetto del passato. Le leggi del tempo stridono come corde sfregate male, ma il paradosso regge!',
        choices:[{ text:'Incredibile trucco temporale!', next:'cerca', consumeItem:'violino_rotto', giveItem:'violino_nuovo', giveFlag:'violino_scambiato' }]
      }
    ]);
  }

  _enterStanza2048(g) {
    if (!g.flags.futuro_alterato) {
      g.startDialog('stanza_2048', [
        { id:'start', speaker:'Stanza 2048 (Il Futuro)', portrait:'🚪',
          text:'Entri nella Stanza 2048. È ridotta a un cumulo di macerie carbonizzate, devastata dal terribile incendio iniziato decenni prima nella stanza 404. Filtra una lugubre luce spettrale dalle finestre rotte.',
          choices:[
            { text:'Ispeziona i resti carbonizzati', next:'ispeziona' },
            { text:'Esci nel corridoio', next:'end' }
          ]
        },
        { id:'ispeziona', speaker:'Stanza 2048 (Il Futuro)', portrait:'🚪',
          text:'Tra le ceneri soffici di quella che una volta era la scrivania, trovi una Fotografia Bruciata e lo scheletro annerito di una custodia.',
          choices:[
            { text:'Prendi la Fotografia Bruciata', next:'prendi_bruciata', requireFlag:'!preso_foto_bruciata' },
            { text:'Indietro', next:'start' }
          ]
        },
        { id:'prendi_bruciata', speaker:'Stanza 2048 (Il Futuro)', portrait:'🚪',
          text:'Hai raccolto la Fotografia Bruciata. È fragile come foglia secca, carbonizzata ed inutilizzabile.',
          choices:[{ text:'Va bene.', next:'ispeziona', giveItem:'foto_bruciata', giveFlag:'preso_foto_bruciata' }]
        }
      ]);
    } else {
      g.startDialog('stanza_2048', [
        { id:'start', speaker:'Stanza 2048 (Il Futuro - Salvato)', portrait:'🚪',
          text:'Entri nella Stanza 2048. Incredibile! La stanza è pulita, intatta e lussuosa. Le pareti sono decorate con carta da parati damascata rossa e le tende sono perfette. L\'incendio del passato non è mai avvenuto!',
          choices:[
            { text:'Cerca nella stanza intatta', next:'cerca_intatta' },
            { text:'Esci nel corridoio', next:'end' }
          ]
        },
        { id:'cerca_intatta', speaker:'Stanza 2048 (Il Futuro - Salvato)', portrait:'🚪',
          text:'Su uno scrittoio di mogano vicino alla finestra riluce una cornice d\'argento intonsa. Contiene una magnifica Fotografia Integra della Donna senza Riflesso.',
          choices:[
            { text:'Prendi la Fotografia Integra', next:'prendi_integra', requireFlag:'!preso_foto_integra' },
            { text:'Indietro', next:'start' }
          ]
        },
        { id:'prendi_integra', speaker:'Stanza 2048 (Il Futuro - Salvato)', portrait:'🚪',
          text:'Prendi la Fotografia Integra. Ritrae la Donna in tutto il suo splendore originale, con un sorriso radioso specchiato sullo sfondo.',
          choices:[{ text:'Perfetto!', next:'cerca_intatta', giveItem:'foto_integra', giveFlag:'preso_foto_integra' }]
        }
      ]);
    }
  }

  _enterStanza404(g) {
    g.startDialog('stanza_404', [
      { id:'start', speaker:'Stanza 404 (Il Paradosso)', portrait:'🚪',
        text:'La stanza 404 è avvolta da fiamme incorporee. Una candela accesa sul tavolo traballante sta per cadere sulle tende di velluto. È il momento esatto in cui nacque il disastro dell\'hotel!',
        choices:[
          { text:'Usa la Tazza da Tè Calda per spegnere la candela', next:'spegni_candela', requireItem:'tazza_te' },
          { text:'Esci prima che le fiamme ti brucino la memoria', next:'end' }
        ]
      },
      { id:'spegni_candela', speaker:'Stanza 404 (Il Paradosso)', portrait:'🚪',
        text:'Versi il tè bollente e bagnato sulla candela. La fiamma si spegne con un sibilo di vapore! Le fiamme nella stanza svaniscono all\'istante come fumo al vento. Il tempo sussulta violentemente... hai riscritto il futuro!',
        choices:[], action:'ALTERA_FUTURO', consumeItem:'tazza_te'
      }
    ]);
  }

  _createNPC(scene, color, x, y, z) {
    const grp = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.85, 4, 8), new THREE.MeshLambertMaterial({ color }));
    body.position.y = 0;
    grp.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), new THREE.MeshLambertMaterial({ color: 0xdbc0a0 }));
    head.position.y = 0.82;
    grp.add(head);
    grp.position.set(x, y, z);
    scene.add(grp);
    return grp;
  }

  update(dt) {
    this.time += dt;

    // ── EFFETTO TEMPORALE: LAMPI E TUONI ──
    this.lightningTimer += dt;
    if(this.lightningTimer > 6 + Math.random() * 5) {
      this.lightningTimer = 0;
      // Inizia sequenza lampi
      let flashCount = 0;
      const flash = () => {
        if(flashCount < 3) {
          this.lightningLight.intensity = (flashCount % 2 === 0) ? 3.5 : 0.1;
          flashCount++;
          setTimeout(flash, 80 + Math.random() * 60);
        } else {
          this.lightningLight.intensity = 0.1;
        }
      };
      flash();
      this.g.audio.playTone(100, 'sawtooth', 1.5, 0.05); // Tuono sordo
    }

    // Tremolio candeliere
    if(this.chandelierLight) {
      this.chandelierLight.intensity = 1.0 + Math.sin(this.time * 8) * 0.3 + Math.random() * 0.15;
    }

    // Spostamento dei tasti del piano (effetto fantasma)
    this.pianoNotesTimer += dt;
    if(this.pianoNotesTimer > 1.2) {
      this.pianoNotesTimer = 0;
      const activeKeyIdx = Math.floor(Math.random() * this.pianoKeys.length);
      const activeKey = this.pianoKeys[activeKeyIdx];
      activeKey.position.y -= 0.04;
      setTimeout(() => { activeKey.position.y += 0.04; }, 250);
    }

    // Rimuovi la tazza da tè visivamente se il giocatore l'ha ottenuta tramite dialogo
    if (this.tazzaMesh && this.g.inv.has('tazza_te')) {
      this.scene.remove(this.tazzaMesh);
      this.objs = this.objs.filter(o => o.mesh !== this.tazzaMesh);
      this.tazzaMesh = null;
    }
  }
}
