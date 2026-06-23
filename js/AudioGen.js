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
}
