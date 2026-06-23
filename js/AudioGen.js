/* ── AUDIO GENERATIVO ── */
class AudioGen {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.muted = false;
    this.notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C4 to B4
    this.isPlaying = false;
  }
  toggle() {
    this.muted = !this.muted;
    if(!this.muted && !this.isPlaying) this.playBg();
    return this.muted;
  }
  playTone(freq, type='sine', dur=0.5, vol=0.1) {
    if(this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }
  playBg() {
    this.isPlaying = true;
    if(this.muted) { this.isPlaying = false; return; }
    const note = this.notes[Math.floor(Math.random()*this.notes.length)] / 2; // Octave lower
    this.playTone(note, 'triangle', 2, 0.05);
    setTimeout(() => this.playBg(), 2000 + Math.random()*2000);
  }
  playClick() { this.playTone(800, 'sine', 0.1, 0.1); }
  playWin() {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.5, 0.1), i * 150);
    });
  }

  /* ── SUONO RACCOLTA OGGETTO (zaino) ── */
  playPickup() {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. Scintilla ascendente (arpeggio pentatonico dorato)
    const sparkNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    sparkNotes.forEach((freq, i) => {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.055);
      osc.frequency.linearRampToValueAtTime(freq * 1.01, t + i * 0.055 + 0.12);
      gain.gain.setValueAtTime(0, t + i * 0.055);
      gain.gain.linearRampToValueAtTime(0.13, t + i * 0.055 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.055 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.055);
      osc.stop(t + i * 0.055 + 0.35);
    });

    // 2. Fruscio di zaino (burst di rumore bianco filtrato)
    const bufLen = this.ctx.sampleRate * 0.18;
    const buf    = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let j = 0; j < bufLen; j++) data[j] = (Math.random() * 2 - 1) * 0.6;
    const src    = this.ctx.createBufferSource();
    src.buffer   = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type  = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.07, t + 0.22);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.40);
    src.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    src.start(t + 0.22);
    src.stop(t + 0.42);

    // 3. Nota bassa morbida di conferma ("tonk" di legno)
    const thud  = this.ctx.createOscillator();
    const thudG = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(180, t + 0.25);
    thud.frequency.exponentialRampToValueAtTime(90, t + 0.45);
    thudG.gain.setValueAtTime(0.18, t + 0.25);
    thudG.gain.exponentialRampToValueAtTime(0.001, t + 0.50);
    thud.connect(thudG);
    thudG.connect(this.ctx.destination);
    thud.start(t + 0.25);
    thud.stop(t + 0.52);
  }

  /* ── SUONO OGGETTO RARO (monete/mappe/chiavi speciali) ── */
  playPickupRare() {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1568];
    notes.forEach((freq, i) => {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      gain.gain.setValueAtTime(0, t + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.11, t + i * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.65);
    });
    setTimeout(() => {
      if (!this.muted) this.playTone(1046.50, 'sine', 0.8, 0.06);
    }, 600);
  }

  /* ── SUONO APERTURA ZAINO ── */
  playBagOpen() {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bufLen = this.ctx.sampleRate * 0.22;
    const buf    = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let j = 0; j < bufLen; j++) {
      const env = Math.pow(1 - j / bufLen, 1.5);
      data[j] = (Math.random() * 2 - 1) * env;
    }
    const src    = this.ctx.createBufferSource();
    src.buffer   = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type  = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 1.2;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.09, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    src.connect(filter);
    filter.connect(ng);
    ng.connect(this.ctx.destination);
    src.start(t);
    src.stop(t + 0.25);
    this.playTone(320, 'square', 0.04, 0.08);
  }
}
