// ================================
// VIENA — PURE JS RADIO PLAYER
// ================================

// ---------- AUDIO CORE ----------
const audio = new Audio();
audio.crossOrigin = "anonymous";
audio.preload = "auto";

let audioCtx, analyser, source;
let rafId = null;
let dataArray, prevData;

let tracks = [];
let currentTrackIndex = 0;
let isPlaying = false;

// ---------- DOM ----------
const clockTime = document.getElementById("clockTime");
const clockDay = document.getElementById("clockDay");
const trackName = document.getElementById("trackName");
const artistName = document.getElementById("artistName");
const bottomPanel = document.getElementById("bottomPanel");
const coverWrap = document.getElementById("coverWrap");

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const stopIcon = document.getElementById("stopIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// ---------- AUDIO INIT ----------
function initAudio() {
  if (audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  source = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();

  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  prevData = new Float32Array(analyser.frequencyBinCount);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

// ---------- VISUALIZER ----------
function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawBars() {
  if (!isPlaying) return;

  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bufferLength = analyser.frequencyBinCount;
  const center = Math.floor(bufferLength / 2);
  const barWidth = canvas.width / bufferLength;

  for (let i = 0; i < center; i += 2) {
    prevData[i] = prevData[i] * 0.8 + dataArray[i] * 0.2;
    const factor = Math.pow(1 - i / center, 1.6);

    const barHeight =
      ((prevData[i] / 255) * canvas.height * 0.7 +
        canvas.height * 0.1) *
      factor;

    ctx.fillStyle = `hsla(235,100%,${74 + factor * 6}%,0.85)`;

    const xLeft = canvas.width / 2 - barWidth * (i + 1);
    const xRight = canvas.width / 2 + i * barWidth;

    ctx.fillRect(xLeft, canvas.height - barHeight, barWidth * 1.6, barHeight);
    ctx.fillRect(xRight, canvas.height - barHeight, barWidth * 1.6, barHeight);
  }

  rafId = requestAnimationFrame(drawBars);
}

// ---------- UI ----------
function updateUI() {
  const track = tracks[currentTrackIndex];
  if (!track) return;

  trackName.textContent = track.name;
  artistName.textContent = track.artist;

  bottomPanel.style.transform = isPlaying
    ? "translateY(0)"
    : "translateY(100%)";

  playIcon.style.display = isPlaying ? "none" : "block";
  stopIcon.style.display = isPlaying ? "block" : "none";

  playBtn.classList.toggle("is-playing", isPlaying);
  coverWrap.classList.toggle("playing", isPlaying);
}

// ---------- CONTROLS ----------
async function togglePlay() {
  if (isPlaying) {
    audio.pause();
    return;
  }

  initAudio();

  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  await audio.play();
}

function switchTrack(index) {
  if (!tracks[index]) return;

  const direction = index > currentTrackIndex ? "flip-next" : "flip-prev";
  coverWrap.classList.add("change", direction);

  setTimeout(() => {
    coverWrap.classList.remove("flip-next", "flip-prev");
  }, 500);

  currentTrackIndex = index;
  audio.src = tracks[index].src;
  audio.load();

  if (isPlaying) audio.play();
  updateUI();
}

const nextTrack = () =>
  switchTrack((currentTrackIndex + 1) % tracks.length);

const prevTrack = () =>
  switchTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);

// ---------- CLOCK ----------
function updateClock() {
  const now = new Date();

  clockTime.textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  clockDay.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
  });
}

// ---------- AUDIO EVENTS ----------
audio.addEventListener("play", () => {
  isPlaying = true;
  drawBars();
  updateUI();
});

audio.addEventListener("pause", () => {
  isPlaying = false;
  cancelAnimationFrame(rafId);
  updateUI();
});

// ---------- EVENTS ----------
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);

window.addEventListener("resize", resizeCanvas);

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  }
  if (e.code === "ArrowRight") nextTrack();
  if (e.code === "ArrowLeft") prevTrack();
});

// ---------- INIT ----------
(async function init() {
  const res = await fetch("js/tracks.json");
  tracks = await res.json();

  audio.src = tracks[0].src;

  resizeCanvas();
  updateClock();
  setInterval(updateClock, 1000);
  updateUI();
})();
