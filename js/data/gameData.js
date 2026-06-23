// ============================================================
//  gameData.js — Oggetti e Dialoghi del gioco
// ============================================================

export const ITEMS = {
  KEY: {
    id: 'key',
    name: 'Chiave Arrugginita',
    emoji: '🗝️',
    description: 'Una vecchia chiave arrugginita. Chissà cosa apre...'
  },
  AXE: {
    id: 'axe',
    name: 'Ascia da Boscaiolo',
    emoji: '🪓',
    description: "Un'ascia ben affilata. Potrebbe tagliare qualcosa di grosso."
  }
};

// DIALOGS: array di nodi. Ogni nodo ha id, speaker, text, choices[].
// choice.action (opzionale): eseguita quando la scelta viene selezionata.
// choice.requireItem (opzionale): scelta visibile solo se l'item è in inventario.
export const DIALOGS = {

  /* ── PIRATA SULLA SPIAGGIA ── */
  pirate: [
    {
      id: 'start',
      speaker: 'Vecchio Pirata',
      text: 'Ehi, giovane! Sei nuovo su Isla Perdida? Non molti si avventurano fin qui...',
      choices: [
        { text: '🗺️ Sto cercando il Tesoro dei Pirati!', next: 'treasure_hint' },
        { text: '👋 Ciao, bel posto questo.', next: 'greet' }
      ]
    },
    {
      id: 'greet',
      speaker: 'Vecchio Pirata',
      text: 'Bel posto? Hmm... dipende da cosa cerchi. Io cerco quiete. E rum.',
      choices: [
        { text: '🗺️ In realtà cerco un tesoro...', next: 'treasure_hint' },
        { text: '😄 Capito. Arrivederci!', next: 'end' }
      ]
    },
    {
      id: 'treasure_hint',
      speaker: 'Vecchio Pirata',
      text: 'Il Tesoro dei Pirati! Leggendario. Si dice sia nella grotta della giungla. Ma ci vuole un\'ascia per aprire la porta di radici. Il barista in taverna ne ha una.',
      choices: [
        { text: '⚔️ Come ottengo l\'ascia dal barista?', next: 'barista_hint' },
        { text: '🙏 Grazie mille!', next: 'end' }
      ]
    },
    {
      id: 'barista_hint',
      speaker: 'Vecchio Pirata',
      text: 'Quel vecchio avaro non la cede per niente. Ma ha perso la chiave del suo magazzino... ho sentito che è sepolta nella sabbia, vicino alle palme. Va\' a vedere!',
      choices: [
        { text: '✨ Perfetto, grazie!', next: 'end' }
      ]
    },
    {
      id: 'end',
      speaker: 'Vecchio Pirata',
      text: 'Buona fortuna, giovane pirata! Attento ai gabbiani, mordono.',
      choices: []
    }
  ],

  /* ── BARISTA IN TAVERNA ── */
  barkeep: [
    {
      id: 'start',
      speaker: 'Barista',
      text: 'Cosa vuoi, straniero? Non siamo un posto per turisti.',
      choices: [
        { text: '🪓 Cerco un\'ascia.', next: 'axe_ask' },
        { text: '🍺 Solo un\'informazione.', next: 'info' }
      ]
    },
    {
      id: 'axe_ask',
      speaker: 'Barista',
      text: 'Ho un\'ascia, sì. Ma non la regalo. Hai qualcosa da scambiare?',
      choices: [
        {
          text: '🗝️ Ho una chiave... potrebbe interessarti?',
          next: 'trade_confirm',
          requireItem: 'key'
        },
        { text: '❌ Non ancora. Torno dopo.', next: 'no_deal' }
      ]
    },
    {
      id: 'trade_confirm',
      speaker: 'Barista',
      text: 'Una chiave? Proprio quella del magazzino che cercavo! Affare fatto, prenditi l\'ascia.',
      choices: [
        { text: '🤝 Ottimo! Scambio effettuato.', next: 'trade_done', action: 'TRADE_KEY_FOR_AXE' }
      ]
    },
    {
      id: 'trade_done',
      speaker: 'Barista',
      text: 'Eccola. Ora sparisci dalla mia taverna.',
      choices: []
    },
    {
      id: 'no_deal',
      speaker: 'Barista',
      text: 'Torna quando hai qualcosa da offrire.',
      choices: []
    },
    {
      id: 'info',
      speaker: 'Barista',
      text: 'Il tesoro? Nella grotta della giungla. Ma ci vuole un\'ascia. Casualmente ne ho una disponibile... se hai qualcosa da scambiare.',
      choices: [
        { text: '🗝️ Ho una chiave!', next: 'trade_confirm', requireItem: 'key' },
        { text: '👋 Grazie, torno presto.', next: 'no_deal' }
      ]
    }
  ]
};
