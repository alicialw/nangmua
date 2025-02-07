const synth = new Tone.Synth({
  oscillator: {
      type: "triangle"
  },
  envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1
  }
}).toDestination();

let isPlaying = false;

async function playChirp(pattern) {
  if (isPlaying) return;
  
  isPlaying = true;
  await Tone.start();
  const now = Tone.now();

  switch (pattern) {
      case 'single':
          synth.triggerAttackRelease("C6", "16n", now);
          break;
      
      case 'double':
          synth.triggerAttackRelease("C6", "16n", now);
          synth.triggerAttackRelease("D6", "16n", now + 0.2);
          break;
      
      case 'triple':
          synth.triggerAttackRelease("C6", "16n", now);
          synth.triggerAttackRelease("D6", "16n", now + 0.2);
          synth.triggerAttackRelease("E6", "16n", now + 0.4);
          break;
      
      case 'continuous':
          const notes = ["C6", "D6", "E6", "G6"];
          notes.forEach((note, i) => {
              synth.triggerAttackRelease(note, "8n", now + i * 0.2);
          });
          setTimeout(() => {
              notes.reverse().forEach((note, i) => {
                  synth.triggerAttackRelease(note, "8n", now + 0.8 + i * 0.2);
              });
          }, 800);
          break;
  }

  setTimeout(() => {
      isPlaying = false;
      document.querySelectorAll('.chirp-btn').forEach(btn => {
          btn.disabled = false;
      });
  }, 2000);
}

function initializeChirpSystem() {
  document.querySelectorAll('.chirp-btn').forEach(button => {
      button.addEventListener('click', () => {
          document.querySelectorAll('.chirp-btn').forEach(btn => {
              btn.disabled = true;
          });
          playChirp(button.dataset.pattern);
      });
  });
}

document.addEventListener('DOMContentLoaded', initializeChirpSystem);