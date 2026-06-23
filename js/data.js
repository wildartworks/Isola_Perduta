// ============================================================
// ISLA PERDIDA — Dati di Gioco
// ============================================================

const GAME_DATA = {

  // ── PERSONAGGI GIOCABILI ──
  characters: {
    elias: { id:'elias', name:'Elias Crow', pronoun:'lui', emoji:'🏴‍☠️', desc:'Un audace pirata avventuriero alla ricerca di risposte e leggendari tesori perduti.' },
    valentine: { id:'valentine', name:'Valentine Black', pronoun:'lei', emoji:'🏴‍☠️', avatar: 'assets/Foto_Valentine.jpg', desc:'Una coraggiosa pirata esploratrice guidata da una misteriosa mappa stellare.' }
  },

  // ── OGGETTI ──
  items: {
    // ── LIVELLO 1 ──
    bussola_rotta:    { id:'bussola_rotta',    name:'Bussola Rotta',         nameCorrupt:'...cosa rotonda', emoji:'🧭', desc:'Indica sempre il basso. Forse l\'isola ha ragione lei.', hint:'È troppo rovinata per navigare. Magari a qualcuno al porto interessa come pezzo di ricambio?' },
    granchio_mec:     { id:'granchio_mec',     name:'Granchio Meccanico',    nameCorrupt:'Bestia di ferro', emoji:'🦞', desc:'Ticchetta. Non mangia aragoste. O forse sì.', hint:'Funziona ancora! Potrebbe distrarre o attivare qualcosa di piccolo.' },
    lanterna_blu:     { id:'lanterna_blu',     name:'Lanterna Blu',          nameCorrupt:'Luce strana',     emoji:'🔵', desc:'Illumina ciò che non vuole essere visto.', hint:'Rivelare ciò che è nascosto nell\'oscurità è la sua specialità.' },
    mappa_bagnata:    { id:'mappa_bagnata',    name:'Mappa Bagnata',         nameCorrupt:'Carta fradicia',  emoji:'🗺️', desc:'Illeggibile. Raffigura un posto che non esiste più.', hint:'Aprila per consultare la mappa di navigazione dell\'isola.' },
    campana:          { id:'campana',          name:'Campana Arrugginita',   nameCorrupt:'...quella cosa',  emoji:'🔔', desc:'Un rintocco chiama chi non vuole essere chiamato.', hint:'Suonarla potrebbe richiamare qualcuno o distrarre una guardia al Porto.' },
    bottiglia_msg:    { id:'bottiglia_msg',    name:'Bottiglia con Messaggio',nameCorrupt:'Vetro con carta',emoji:'🍾', desc:'Il messaggio dice: \"FI-\" e poi è strappato.', hint:'La prima sillaba \"FI-\" fa parte di una parola d\'ordine fondamentale per sbloccare la barca al Porto.' },
    amo_gigante:      { id:'amo_gigante',      name:'Amo Gigante Arrugginito',nameCorrupt:'Ferro appuntito',emoji:'🪝', desc:'Il portafortuna di qualcuno. Si vede dall\'usura.', hint:'Sembra proprio l\'amo perduto di Capitan Umber al Porto (Livello 1). Mostraglielo!' },
    mappa_strappata:  { id:'mappa_strappata', name:'Frammento di Mappa',    nameCorrupt:'Carta strappata',  emoji:'🗺️', desc:'Un angolo di mappa che Pip ti ha dato. Raffigura una X e la scritta \"non è qui\". Classico.', hint:'Mostra dove scavare: posizionati sul lato destro dell\'Orologio Maestro nella Foresta (Livello 2) per trovare qualcosa.' },
    banana_compassata:{ id:'banana_compassata',name:'Banana Compassata',     nameCorrupt:'Frutto ufficiale',emoji:'🍌', desc:'Certificata dalla Gilda Cartografica. Motivo ignoto.', hint:'Una banana cartografica. Forse a una scimmia o a un collezionista stravagante potrebbe piacere?' },
    pollo_segnale:    { id:'pollo_segnale',    name:'Pollo da Segnalazione Nautica', nameCorrupt:'Uccello confuso', emoji:'🐔', desc:'Omologato per segnali di SOS. Non capisce perché.', hint:'Usalo per fare un forte rumore di segnalazione quando serve aiuto o distrazione.' },

    // ── LIVELLO 2 ──
    pendolo_spezzato:     { id:'pendolo_spezzato',     name:'Pendolo Spezzato',         nameCorrupt:'Asta dorata',    emoji:'⚖️', desc:'Oscillava ancora al momento della rottura. Ora è fermo. Come il tempo nella foresta.', hint:'Un vecchio pezzo di orologio. Yorick nella Foresta potrebbe volerlo scambiare per qualcosa.' },
    mango_fluorescente:   { id:'mango_fluorescente',   name:'Mango Fluorescente',       nameCorrupt:'Frutto strano',  emoji:'🟢', desc:'Emette una luce verde pallida. Odora vagamente di ingranaggi e olio di macchine.', hint:'Consumalo dal menu per ripristinare 40% di Salute.' },
    orologio_senza_lancette: { id:'orologio_senza_lancette', name:'Orologio senza Lancette', nameCorrupt:'Cerchio dorato', emoji:'🕰️', desc:'Il quadrante è perfetto. Mancano solo le lancette. E le ore. E qualsiasi senso del tempo.', hint:'Incompleto. Se trovi delle lancette o lo mostri a un esperto di orologi...' },
    fischietto_osso:      { id:'fischietto_osso',      name:'Fischietto d\'Osso',       nameCorrupt:'Tubo d\'osso',   emoji:'🦴', desc:'Un suono sottilissimo emana da esso. Gli orologi vicini sembrano accelerare leggermente.', hint:'Il suo suono influenza lo scorrere del tempo nella Foresta.' },
    diario_incompleto:    { id:'diario_incompleto',    name:'Diario Incompleto',        nameCorrupt:'Libro rovinato', emoji:'📓', desc:'L\'ultima pagina leggibile dice: \"L\'orologio maestro deve segnare le ORE 3. Solo allora il guardiano dimenticherà di averti visto.\"', hint:'Aprilo per vedere il suggerimento sulle Ore 3. Ti serve per aprire il cancello del Guardiano.' },
    pesce_essiccato:      { id:'pesce_essiccato',      name:'Pesce Essiccato',          nameCorrupt:'Cosa salata',    emoji:'🐟', desc:'Salato e duro, ma placa la fame. Ripristina 40% Salute.', hint:'Consumalo dal menu per ripristinare 40% di Salute.' },
    acqua_dolce:          { id:'acqua_dolce',          name:'Acqua Dolce',              nameCorrupt:'Liquido puro',   emoji:'🥛', desc:'Acqua sorgiva rinfrescante. Ripristina 50% Salute.', hint:'Consumala dal menu per ripristinare 50% di Salute.' },
    mappa_antica:         { id:'mappa_antica',         name:'Mappa Antica',             nameCorrupt:'Pergamena vecchia', emoji:'📜', desc:'Una piccola mappa della foresta. Mostra una X disegnata sul lato destro dell\'Orologio Maestro.', hint:'Ti svela dove scavare per trovare il Pugnale Antico vicino all\'Orologio Maestro nella Foresta.' },
    pugnale_antico:       { id:'pugnale_antico',       name:'Pugnale Antico',           nameCorrupt:'Lama intarsiata', emoji:'🗡️', desc:'Un pugnale finemente decorato. Qualcuno potrebbe acquistarlo in cambio di monete.', hint:'È un oggetto di grande pregio storico. Forse puoi tornare al Porto (Livello 1) e scambiarlo con Yorick per del cibo o venderlo a qualcun altro!' },
    monete_oro:           { id:'monete_oro',           name:'Monete d\'Oro',            nameCorrupt:'Cose lucenti',   emoji:'🪙', desc:'Monete d\'oro antico. Usale per acquistare provviste da Yorick.', hint:'La valuta preferita dai collezionisti della Foresta. Usala per comprare cibo o scambiarla.' },
    
    // ── LIVELLO 3 ──
    chiave_404:           { id:'chiave_404',           name:'Chiave Stanza 404',        nameCorrupt:'Pezzo di ferro', emoji:'🔑', desc:'Una vecchia chiave in ottone con un\'etichetta sbiadita: \"Stanza 404\".', hint:'Apre la porta della Stanza 404. Si dice che sia stata smarrita sotto un cuscino nel passato.' },
    specchio_incrinato:   { id:'specchio_incrinato',   name:'Specchio Incrinato',       nameCorrupt:'Vetro rotto',     emoji:'🪞', desc:'Un frammento di specchio. Riflette la stanza ma non chi lo guarda.', hint:'Mostra il passato. Usalo nella Stanza 404 per influenzare gli eventi passati dell\'Albergo.' },
    tazza_te:             { id:'tazza_te',             name:'Tazza da Tè Calda',        nameCorrupt:'Tazza tiepida',   emoji:'☕', desc:'Una tazza di tè nero che non si raffredda mai. Profuma di bergamotto ed ectoplasma.', hint:'È caldissima e umida. Ideale per spegnere fiamme nascenti nel passato (Stanza 404).' },
    foto_bruciata:        { id:'foto_bruciata',        name:'Fotografia Bruciata',      nameCorrupt:'Carta nera',     emoji:'🖼️', desc:'Una foto irrimediabilmente carbonizzata. Riconosci solo una sagoma sfocata.', hint:'È troppo tardi per questa foto... a meno che tu non vada nel passato a fermare l\'incendio prima che avvenga!' },
    foto_integra:         { id:'foto_integra',         name:'Fotografia Integra',       nameCorrupt:'Carta dipinta',   emoji:'🖼️', desc:'Una foto del futuro alternativo. Mostra la Donna sorridente con il suo riflesso visibile.', hint:'Consegna questa foto alla Donna nel presente per spezzare l\'illusione dell\'ascensore murato.' },
    violino_rotto:        { id:'violino_rotto',        name:'Violino Rotto',            nameCorrupt:'Legno spezzato',  emoji:'🎻', desc:'Un violino spaccato in due, con le corde tranciate di netto. Non emette alcun suono.', hint:'È rotto nel presente. Ma se andassi nel passato (Stanza 1936) a scambiarlo con uno intatto nella sua custodia?' },
    violino_nuovo:        { id:'violino_nuovo',        name:'Violino Accordato',        nameCorrupt:'Legno lucido',    emoji:'🎻', desc:'Un violino perfetto del passato. Le sue corde vibrano solo a guardarlo.', hint:'Dalo al Pianista Cieco nel presente per fargli suonare una melodia nostalgica.' },

    // ── LIVELLO 4 — LA MINIERA DEL SOLE NERO ──
    casco_rotto:          { id:'casco_rotto',          name:'Casco Rotto',              nameCorrupt:'...cosa dura',    emoji:'⛑️', desc:'Un casco da minatore con il lato destro sfondato. Chi lo indossava ha avuto meno fortuna di te.', hint:'Il casco è rotto ma resistente. Potrebbe proteggere da qualcosa che cade nella miniera.' },
    cristallo_nero:       { id:'cristallo_nero',       name:'Cristallo Nero',           nameCorrupt:'Pietra buia',     emoji:'🖤', desc:'Un frammento di cristallo che sembra assorbire la luce attorno. Nelle mani, le dita si fanno fredde.', hint:'Il cristallo assorbe la luce. Potrebbe essere usato per oscurare qualcosa o influenzare una fonte di energia.' },
    dinamite_umida:       { id:'dinamite_umida',       name:'Dinamite Umida',           nameCorrupt:'...cosa rossa',   emoji:'🧨', desc:'Candelotti di dinamite completamente fradici. Inutilizzabili così com\'è.', hint:'Troppo umida per esplodere. Se riesci ad asciugarla vicino a una fonte di calore potente...' },
    pappagallo_cieco:     { id:'pappagallo_cieco',     name:'Pappagallo Cieco',         nameCorrupt:'Uccello bendato', emoji:'🦜', desc:'Un pappagallo con gli occhi coperti da una benda logora. Ripete sempre la stessa parola, ma in ordine inverso.', hint:'Ripete qualcosa che non riesci a capire... forse se lo porti in un posto più silenzioso sentiresti meglio.' },
    carrello_minerario:   { id:'carrello_minerario',   name:'Carrello Minerario',       nameCorrupt:'Carro rotto',     emoji:'🚃', desc:'Un vecchio carrello su binari deformati. Ancora si muove, a malapena.', hint:'Potrebbe essere usato per trasportare qualcosa di pesante o come distrazione meccanica.' },
    chiave_miniera:       { id:'chiave_miniera',       name:'Chiave della Miniera',     nameCorrupt:'...ferro antico', emoji:'🗝️', desc:'Una chiave di ferro nero, quasi calda. Incisa con il nome "Obren".', hint:'Apre il passaggio segreto nascosto nella parete di fondo della miniera.' },

    // ── LIVELLO 5 — LA CITTÀ SOMMERSA ──
    maschera_ottone:      { id:'maschera_ottone',      name:'Maschera d\'Ottone',       nameCorrupt:'Faccia di metallo',emoji:'🎭', desc:'Una maschera cerimoniale dal peso insolito. Gli occhi sono vuoti ma sembrano seguirti.', hint:'Appartiene al rituale di apertura del tempio sommerso. Potrebbe servire alla statua parlante.' },
    conchiglia_sonora:    { id:'conchiglia_sonora',    name:'Conchiglia Sonora',        nameCorrupt:'Spirale marina',  emoji:'🐚', desc:'Dal suo interno proviene un suono ovattato che ricorda campane lontane e voci dimenticate.', hint:'Il suo suono risuona con i simboli luminosi sulle pareti del tempio sommerso.' },
    arpione_cerimoniale:  { id:'arpione_cerimoniale',  name:'Arpione Cerimoniale',      nameCorrupt:'Lancia di pietra',emoji:'🔱', desc:'Un arpione decorativo inciso con simboli che non conosci. Troppo prezioso per combattere.', hint:'I simboli incisi corrispondono a quelli sulle pareti del tempio. Potrebbe essere una chiave.' },
    libro_impermeabile:   { id:'libro_impermeabile',   name:'Libro Impermeabile',       nameCorrupt:'Pietra con segni',emoji:'📖', desc:'Pagine di pietra sottile. L\'ultima scritta dice: "L\'isola non è naturale. È una gigantesca macchina costruita per conservare ricordi."', hint:'La grande rivelazione è in questo libro. Leggilo prima di affrontare la statua parlante.' },
    medaglione_spezzato:  { id:'medaglione_spezzato',  name:'Medaglione Spezzato',      nameCorrupt:'Cerchio rotto',   emoji:'🪬', desc:'Metà di un medaglione antico. L\'altra metà è incisa su ogni statua della città. Chi lo ha perso non è mai tornato.', hint:'Se ritrovi l\'altra metà sulle statue, il medaglione completo potrebbe aprire qualcosa di importante.' },
  },

  // ── DIALOGHI LIVELLO 1 — IL PORTO DELLE MAREE MORTE ──
  dialogs_l1: {
    pescatore: [
      { id:'start', speaker:'Capitan Umber', portrait:'👴',
        text:'Eh... tu. Sei nuovo. Il porto non... non vuole i nuovi. Ma siedi pure. Ho dimenticato come si dice \"vattene\".',
        choices:[
          { text:'Cerco una barca per l\'interno dell\'isola.', next:'barca' },
          { text:'Come stai, vecchio?', next:'stato' },
          { text:'[MOSTRA AMO] Questo è tuo?', next:'amo_consegna', requireItem:'amo_gigante' },
          { text:'Devo andare.', next:'end' }
        ]
      },
      { id:'stato', speaker:'Capitan Umber', portrait:'👴',
        text:'Come sto? Non lo so. Ho dimenticato com\'ero prima. È più facile così.',
        choices:[{ text:'Hai una barca che posso usare?', next:'barca' }, { text:'Devo andare.', next:'end' }]
      },
      { id:'barca', speaker:'Capitan Umber', portrait:'👴',
        text:'La barca parte solo con il... il... coso. Non la parola, il... concetto. Che si dà alle persone. Che inizia con... FI...',
        choices:[
          { text:'Fiducia?', next:'fiducia_ok', requireFlag:'parola_trovata' },
          { text:'Finale? Finestra? Fisarmonica?', next:'no_parola' },
          { text:'Devo andare.', next:'end' }
        ]
      },
      { id:'no_parola', speaker:'Capitan Umber', portrait:'👴',
        text:'No, no... qualcosa che si dà. O si perde. Parla con gli altri. Forse ricordano il resto.',
        choices:[{ text:'Capito, ci vediamo.', next:'end' }]
      },
      { id:'fiducia_ok', speaker:'Capitan Umber', portrait:'👴',
        text:'FIDUCIA! Sì! Ecco la parola! Ma... la barca non si fida di te. E nemmeno io, a dire il vero. A meno che... il mio amo. Dove è finito?',
        choices:[
          { text:'[MOSTRA AMO] Questo è tuo?', next:'amo_consegna', requireItem:'amo_gigante' },
          { text:'Vado a cercarlo.', next:'end' }
        ]
      },
      { id:'amo_consegna', speaker:'Capitan Umber', portrait:'👴',
        text:'Il mio amo! L\'ho cercato per... non ricordo quanto. Grazie. Prendi la barca. Vai. Prima che anche tu dimentichi perché sei venuto.',
        choices:[], action:'LEVEL1_WIN', flag:'amo_consegnato', consumeItem:'amo_gigante'
      }
    ],

    guardia: [
      { id:'start', speaker:'Torv (Guardia)', portrait:'💂',
        text:'FERMO! Cioè... puoi passare. Cioè, dipende. Cosa vuoi? Se vuoi la barca, no. Se vuoi l\'aria, forse.',
        choices:[
          { text:'Conosci una parola che inizia con FI-?', next:'parola' },
          { text:'Cosa stai proteggendo esattamente?', next:'cosa' },
          { text:'Lascio perdere, arrivederci.', next:'end' }
        ]
      },
      { id:'cosa', speaker:'Torv (Guardia)', portrait:'💂',
        text:'Tutto! Le barche. Il pontile. Quel granchio là. Forse anche i ricordi della gente, non si sa mai.',
        choices:[{ text:'La parola. FI-...', next:'parola' }, { text:'Arrivederci.', next:'end' }]
      },
      { id:'parola', speaker:'Torv (Guardia)', portrait:'💂',
        text:'FI-? FI-DU-... Fidu... No, aspetta. Difidu-... La parola d\'ordine di mia nonna era \"fidùcia\". O \"diffidenza\". Una delle due.',
        choices:[{ text:'Grazie, è stato illuminante.', next:'end' }], giveFlag:'pezzo_torv'
      }
    ],

    bambino: [
      { id:'start', speaker:'Pip (Il Bambino)', portrait:'👦',
        text:'Psst! Mappe! Mappe dell\'isola! Solo tre monete! O uno spuntino. O una storia interessante.',
        choices:[
          { text:'Che tipo di mappe?', next:'mappe_desc' },
          { text:'Sai qualcosa su una parola che inizia con FI-?', next:'parola' },
          { text:'Non mi serve niente, ciao.', next:'end' }
        ]
      },
      { id:'mappe_desc', speaker:'Pip (Il Bambino)', portrait:'👦',
        text:'Le migliori! Accurate al 40%. Il resto è fantasia, ma la fantasia spesso ha ragione.',
        choices:[{ text:'La parola. FI-?', next:'parola' }, { text:'Ciao.', next:'end' }]
      },
      { id:'parola', speaker:'Pip (Il Bambino)', portrait:'👦',
        text:'FI-DU-! Lo so perché me lo ha detto mia sorella prima di dimenticarsi di avere una sorella. La parola finisce con \"-CIA\". Fidu-cia.',
        choices:[{ text:'FIDUCIA!', next:'eureka' }], giveFlag:'pezzo_pip'
      },
      { id:'eureka', speaker:'Pip (Il Bambino)', portrait:'👦',
        text:'Esatto! Anche se non so cosa significhi. Sembra una cosa che si rompe facilmente. Tieni, una mappa... parzialmente accurata.',
        choices:[], giveFlag:'parola_trovata', giveItem:'mappa_strappata'
      }
    ]
  },

  // ── DIALOGHI LIVELLO 2 — LA FORESTA DEGLI OROLOGI ──
  dialogs_l2: {

    yorick: [
      { id:'start', speaker:'Yorick (Raccoglitore)', portrait:'🕰️',
        text:'Eh? Chi... oh! Un visitatore. Stavo... stavo contando gli orologi. Ne manca uno. O forse ne ho uno in più. I numeri qui non funzionano bene.',
        choices:[
          { text:'Cosa sai del guardiano della foresta?', next:'guardiano' },
          { text:'Come si apre il cancello in fondo al sentiero?', next:'cancello' },
          { text:'Cosa ci fai qui in mezzo agli orologi?', next:'cosa_fai' },
          { text:'[MOSTRA PUGNALE] Ti interessa questo pugnale antico?', next:'vendi_pugnale', requireItem:'pugnale_antico' },
          { text:'Vorrei acquistare delle provviste.', next:'negozio_yorick' },
          { text:'Ciao.', next:'end' }
        ]
      },
      { id:'negozio_yorick', speaker:'Yorick (Raccoglitore)', portrait:'🕰️',
        text:'Certamente. Ho un po\' di cibo e acqua dolce che ho accumulato qui. Cosa ti serve? Costa 1 moneta d\'oro ad articolo.',
        choices:[
          { text:'Compra Pesce Essiccato (1 Moneta d\'Oro)', next:'compra_pesce', requireItem:'monete_oro' },
          { text:'Compra Acqua Dolce (1 Moneta d\'Oro)', next:'compra_acqua', requireItem:'monete_oro' },
          { text:'Ho un antico pugnale, ti interessa?', next:'vendi_pugnale', requireItem:'pugnale_antico' },
          { text:'Forse più tardi.', next:'start' }
        ]
      },
      { id:'compra_pesce', speaker:'Yorick (Raccoglitore)', portrait:'🕰️',
        text:'Ottima scelta. Il pesce essiccato resiste bene all\'umidità della foresta.',
        choices:[{ text:'Grazie.', next:'start' }], giveItem:'pesce_essiccato', consumeItem:'monete_oro'
      },
      { id:'compra_acqua', speaker:'Yorick (Raccoglitore)', portrait:'🕰️',
        text:'Ecco a te. Acqua freschissima e depurata. Non dimenticare di bere!',
        choices:[{ text:'Grazie.', next:'start' }], giveItem:'acqua_dolce', consumeItem:'monete_oro'
      },
      { id:'vendi_pugnale', speaker:'Yorick (Raccoglitore)', portrait:'🕰️',
        text:'Per tutti i pendoli! Questa lama ha degli intagli che ricordano gli ingranaggi dell\'Orologio Maestro! La desidero moltissimo. Ti va di scambiarla per dell\'ottimo cibo e dell\'acqua dolce?',
        choices:[
          { text:'Affare fatto!', next:'scambio_avvenuto' },
          { text:'No, preferisco tenerlo.', next:'start' }
        ]
      },
      { id:'scambio_avvenuto', speaker:'Yorick (Raccoglitore)', portrait:'🕰️',
        text:'Fantastico! Ecco a te le provviste fresche. Si vede che questa lama ha vissuto la storia dell\'isola.',
        choices:[], giveItem:'pesce_essiccato, acqua_dolce', consumeItem:'pugnale_antico'
      },
      { id:'cosa_fai', speaker:'Yorick (Raccoglitore)', portrait:'🕰️',
        text:'Colleziono orologi. Ne ho molti. Tutti segnano ore diverse. Ho smesso di capire che ora sia. Forse è sempre la stessa ora. Forse non è mai nessun\'ora.',
        choices:[
          { text:'Il guardiano della foresta...', next:'guardiano' },
          { text:'Il cancello oltre il sentiero...', next:'cancello' },
          { text:'Grazie. Ciao.', next:'end' }
        ]
      },
      { id:'guardiano', speaker:'Yorick (Raccoglitore)', portrait:'🕰️',
        text:'Il guardiano! Lui dice sempre il contrario di ciò che pensa. Se dice "non ti conosco", ti conosce benissimo. Se dice "non puoi passare"... beh, puoi passare! Un giorno gli ho chiesto se voleva del tè. Ha detto di no. Ho capito troppo tardi.',
        choices:[
          { text:'Come si apre il cancello?', next:'cancello' },
          { text:'Capito. Grazie!', next:'end' }
        ]
      },
      { id:'cancello', speaker:'Yorick (Raccoglitore)', portrait:'🕰️',
        text:'Il cancello si apre quando l\'Orologio Maestro segna l\'ora giusta. Qualcuno ha scritto l\'ora in un diario da qualche parte nel bosco. Io la sapevo... ma l\'ho dimenticata. Iniziava per tre. O finiva per tre. O era tutta tre.',
        choices:[
          { text:'Grazie, Yorick.', next:'end' }
        ]
      }
    ],

    guardiano_foresta: [
      { id:'start', speaker:'Guardiano della Foresta', portrait:'🌿',
        text:'FERMATI! ...Chi sei tu? Non ho MAI visto nessuno da queste parti. Questo sentiero è completamente aperto e libero per chiunque voglia passare.',
        choices:[
          { text:'Sto cercando il passaggio verso il nord dell\'isola.', next:'passaggio' },
          { text:'"Sei il guardiano che parla al contrario?"', next:'contrario_diretto', requireItem:'diario_incompleto' },
          { text:'[MOSTRA MANGO EQUIPAGGIATO] Ti piace questo frutto?', next:'reazione_mango', requireEquipped:'mango_fluorescente' },
          { text:'[USA FISCHIETTO EQUIPAGGIATO] *Fiii*', next:'reazione_fischietto', requireEquipped:'fischietto_osso' },
          { text:'Mi dispiace disturbarla. Me ne vado.', next:'end' }
        ]
      },
      { id:'reazione_mango', speaker:'Guardiano della Foresta', portrait:'🌿',
        text:'Che mango orrendo! Non brilla affatto e non profuma di ingranaggi. E sicuramente NON apre alcun cancello temporale!',
        choices:[{ text:'"Capisco. Allora lo terrò io."', next:'start' }]
      },
      { id:'reazione_fischietto', speaker:'Guardiano della Foresta', portrait:'🌿',
        text:'CHE RUMORE RILASSANTE! I miei timpani non stanno soffrendo e gli orologi non stanno affatto girando all\'indietro!',
        choices:[{ text:'"Funziona bene!"', next:'start' }]
      },
      { id:'passaggio', speaker:'Guardiano della Foresta', portrait:'🌿',
        text:'Un passaggio? Non esiste! Non c\'è assolutamente nulla di interessante da questo lato. Consiglio vivamente di non restare e di non tornare mai più.',
        choices:[
          { text:'Sono mai stato su quest\'isola prima d\'ora?', next:'mai_stato' },
          { text:'Non sono mai stato su quest\'isola.', next:'non_mai_stato' },
          { text:'Molto interessante. Arrivederci.', next:'end' }
        ]
      },
      { id:'contrario_diretto', speaker:'Guardiano della Foresta', portrait:'🌿',
        text:'Guardiano che parla al contrario? Assurdo! Non è vero niente di ciò che hai letto. Quel diario è completamente affidabile e accurato al cento percento.',
        choices:[
          { text:'Allora ti dico: non sono mai stato su quest\'isola.', next:'non_mai_stato' },
          { text:'Capito. Addio.', next:'end' }
        ]
      },
      { id:'mai_stato', speaker:'Guardiano della Foresta', portrait:'🌿',
        text:'Certo che ci sei stato! Ti ricordo benissimo! Sei qui ogni settimana! Non sei MAI passato di qua per la prima volta, no no assolutamente.',
        choices:[
          { text:'"Non sono mai stato su quest\'isola."', next:'non_mai_stato' }
        ]
      },
      { id:'non_mai_stato', speaker:'Guardiano della Foresta', portrait:'🌿',
        text:'Ah! Perfetto! Non ti ho MAI visto prima e non stai affatto passando! Non c\'è alcuna barriera qui! Vattene pure via e non tornare a dirmi che sei qui!',
        choices:[], action:'LEVEL2_WIN'
      }
    ]
  },

  // ── DIALOGHI LIVELLO 3 — L'ALBERGO DELLE OMBRE ──
  dialogs_l3: {
    concierge: [
      { id:'start', speaker:'Concierge Fantasma', portrait:'🤵',
        text:'Benvenuto all\'Albergo delle Ombre, viaggiatore. Le valigie le porti pure lei, il facchino è svanito nel 1936 e io non ricevo lo stipendio da allora. Ha una prenotazione?',
        choices:[
          { text:'Come posso andarmene da questo posto?', next:'andarsene' },
          { text:'Posso avere la Tazza da Tè Calda sul bancone?', next:'tazza_richiesta' },
          { text:'Cosa sono le stanze 1936 e 2048?', next:'stanze' },
          { text:'Cosa c\'è nella Stanza 404?', next:'stanza_404' },
          { text:'No, ero solo di passaggio. Arrivederci.', next:'end' }
        ]
      },
      { id:'andarsene', speaker:'Concierge Fantasma', portrait:'🤵',
        text:'L\'unica via d\'uscita sarebbe l\'ascensore principale, ma le porte si aprono su un solido muro di mattoni. È un\'illusione ottica creata dallo specchio magico per imprigionarci. Solo la Donna senza Riflesso conosce il trucco per spezzarla, ma ha perso la sua identità quando la sua foto è bruciata nel futuro.',
        choices:[{ text:'Parlerò con lei.', next:'end' }]
      },
      { id:'tazza_richiesta', speaker:'Concierge Fantasma', portrait:'🤵',
        text:'Giù le mani! Quel tè nero ha cent\'anni ed è ancora bollente. È l\'unica fonte di calore vitale in questo posto da brividi. Lo cederei solo in cambio di un briciolo di vitalità... come una bella melodia suonata sul serio sul violino del nostro pianista. Questo silenzio di tomba mi sta uccidendo (di nuovo).',
        choices:[
          { text:'[Melodia avviata] Il pianista sta suonando!', next:'tazza_ottenuta', requireFlag:'pianista_suona' },
          { text:'Capisco. Cercherò una soluzione.', next:'end' }
        ]
      },
      { id:'tazza_ottenuta', speaker:'Concierge Fantasma', portrait:'🤵',
        text:'Oh... questa musica. Che dolce, struggente malinconia! Mi ricorda quando dovevo pagare le tasse e avevo il mal di schiena... che bei tempi. Prenda pure la tazza, viaggiatore. Spero le piaccia il tè infuso di ectoplasma.',
        choices:[{ text:'Grazie mille!', next:'end' }], giveItem:'tazza_te', giveFlag:'tazza_ricevuta'
      },
      { id:'stanze', speaker:'Concierge Fantasma', portrait:'🤵',
        text:'Ah, quelle camere... I loro numeri indicano gli anni, non lo spazio. La 1936 mostra il passato, la 2048 il futuro. Ricorda: alterare il passato cambia il futuro. È fisica quantistica applicata all\'hotellerie.',
        choices:[{ text:'Molto interessante.', next:'end' }]
      },
      { id:'stanza_404', speaker:'Concierge Fantasma', portrait:'🤵',
        text:'La camera 404 è sbarrata. Ho perso la chiave nel 1936, penso di averla infilata sotto un cuscino in quella camera. Nel futuro (2048), la stanza è sventrata da un incendio. Tutto è iniziato lì da una candela dimenticata sul tavolo. Se solo qualcuno l\'avesse spenta in tempo nel passato...',
        choices:[{ text:'Tutto chiaro.', next:'end' }]
      }
    ],

    pianista: [
      { id:'start', speaker:'Pianista Cieco', portrait:'🎹',
        text:'Accarezzo questi tasti d\'avorio, ma sento solo polvere. Il tempo scorre a spirale e la mia musica è muta.',
        choices:[
          { text:'Cosa sai dell\'incendio?', next:'incendio' },
          { text:'Cosa c\'è che non va?', next:'violino_dettaglio' },
          { text:'[MOSTRA VIOLINO ROTTO] Ho trovato questo nella lobby.', next:'violino_rotto_mostrato', requireItem:'violino_rotto' },
          { text:'[CONSEGNA VIOLINO ACCORDATO] Ho recuperato questo dal passato.', next:'violino_consegnato', requireItem:'violino_nuovo' },
          { text:'Continua ad ascoltare il silenzio.', next:'end' }
        ]
      },
      { id:'incendio', speaker:'Pianista Cieco', portrait:'🎹',
        text:'L\'incendio... Tutto iniziò nella Stanza 404. Una candela accesa nel 1936 bruciò le tende, incenerendo l\'hotel nel 2048. Se qualcuno l\'avesse spenta prima con dell\'acqua... o del tè bollente, il futuro sarebbe salvo.',
        choices:[{ text:'Capisco.', next:'start' }]
      },
      { id:'violino_dettaglio', speaker:'Pianista Cieco', portrait:'🎹',
        text:'Il pianoforte fa quel che può, ma la vera anima del jazz è il mio violino. Purtroppo si è spaccato in due nella tempesta del presente. Se solo avessi un violino accordato...',
        choices:[{ text:'Cercherò qualcosa.', next:'start' }]
      },
      { id:'violino_rotto_mostrato', speaker:'Pianista Cieco', portrait:'🎹',
        text:'Sì, riconosco le crepe. Questo è il mio amato strumento, ormai inservibile nel presente. Ma aspetta... la Stanza 1936 è il passato! Se lo portassi nella Stanza 1936 e lo scambiassi con quello sano nella mia custodia prima dell\'incendio? Risolveresti il paradosso senza distruggere la linea temporale!',
        choices:[{ text:'È un\'idea geniale! Ci proverò.', next:'start' }]
      },
      { id:'violino_consegnato', speaker:'Pianista Cieco', portrait:'🎹',
        text:'Oh! Il legno è lucido, le corde vibrano di pura vita! Le mie vecchie dita ricordano ancora la diteggiatura. Ascolta...',
        choices:[{ text:'Ascolta la splendida melodia.', next:'melodia_attiva' }], consumeItem:'violino_nuovo', giveFlag:'pianista_suona', action:'PIANO_PLAY'
      },
      { id:'melodia_attiva', speaker:'Pianista Cieco', portrait:'🎹',
        text:'*Una meravigliosa melodia blues risuona nella lobby.* Il concierge sembra quasi commosso... parla con lui ora!',
        choices:[{ text:'Vado subito!', next:'end' }]
      }
    ],

    donna: [
      { id:'start', speaker:'Donna senza Riflesso', portrait:'💃',
        text:'Guardo lo specchio ma vedo solo il vuoto. Nel futuro (2048) la mia foto è bruciata, e così ho perso la mia identità speculare. Senza riflesso, sono solo un fantasma tra i fantasmi.',
        choices:[
          { text:'Posso aiutarti a ritrovare la tua immagine?', next:'aiuto' },
          { text:'[CONSEGNA FOTOGRAFIA INTEGRA] L\'ho salvata dall\'incendio nel futuro.', next:'foto_consegnata', requireItem:'foto_integra' },
          { text:'Tornerò più tardi.', next:'end' }
        ]
      },
      { id:'aiuto', speaker:'Donna senza Riflesso', portrait:'💃',
        text:'Finché la Stanza 404 brucia nel futuro, la mia foto nella Stanza 2048 rimarrà cenere. Devi spegnere quella candela nel passato, sventare l\'incendio, e poi recuperare la mia foto integra dal futuro che avrai salvato!',
        choices:[{ text:'Capito. Spengerò quell\'incendio.', next:'end' }]
      },
      { id:'foto_consegnata', speaker:'Donna senza Riflesso', portrait:'💃',
        text:'Oh! La foto è integra! Ritrae esattamente il mio viso! Guarda... lo specchio! Sto riacquistando i miei lineamenti! Il mio riflesso è tornato!',
        choices:[{ text:'Che meraviglia!', next:'vittoria_livello' }], consumeItem:'foto_integra', giveFlag:'riflesso_ripristinato'
      },
      { id:'vittoria_livello', speaker:'Donna senza Riflesso', portrait:'💃',
        text:'Grazie infinite. Come promesso, l\'illusione è spezzata: l\'ascensore non era murato, era solo il mio specchio che proiettava un muro per tenerci intrappolati nel nostro oblio. Ora puoi andartene dall\'hotel!',
        choices:[], action:'LEVEL3_WIN'
      }
    ]
  }
};

// Tracciamento frasi per l'enigma finale (Livello 5)
const FRASE_LOG = [];
function logFrase(frase) { FRASE_LOG.push(frase); }
