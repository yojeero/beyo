// =============== Beyo WAVE v6.0 — ANALYSER =====================
window.WaveformVisualizer = (() => {
  /* -------------------- CONFIG -------------------- */
  const BAR_COUNT = 64;
  const HEIGHT_SCALE = 0.9;
  const SMOOTHING = 0.75;

  /* -------------------- STATE -------------------- */
  let canvas, ctx, audio;
  let audioCtx, analyser, source;
  let dataArray;

  let running = false;
  let initialized = false;

  /* -------------------- FPS FALLBACK -------------------- */
  let fpsMode = 60; // 60 → 30 → off
  let lastFrame = 0;
  let frameTimes = [];

  /* -------------------- COLOR -------------------- */
  let color = [60, 120, 255];

  /* -------------------- INIT -------------------- */
  function init({ canvasEl, audio: audioEl }) {
    if (initialized) return;

    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    audio = audioEl;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = SMOOTHING;

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    initialized = true;
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  /* -------------------- DRAW -------------------- */
  function draw(ts) {
    if (!running || audio.paused) return;

    /* ---- FPS monitor ---- */
    if (lastFrame) {
      const dt = ts - lastFrame;
      frameTimes.push(dt);
      if (frameTimes.length > 20) frameTimes.shift();

      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;

      if (fpsMode === 60 && avg > 26) fpsMode = 30;
      else if (fpsMode === 30 && avg > 40) {
        stop();
        return;
      }
    }
    lastFrame = ts;

    analyser.getByteFrequencyData(dataArray);

    const w = canvas.width;
    const h = canvas.height;
    const barW = w / BAR_COUNT;
    const centerY = h / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;

    for (let i = 0; i < BAR_COUNT; i++) {
      const v = dataArray[i] / 255;
      const amp = v * h * HEIGHT_SCALE * 0.5;

      const x = i * barW + barW * 0.15;
      const y = centerY - amp;
      const height = amp * 2;
      const width = barW * 0.7;
      const radius = Math.min(width / 2, height / 2);

      drawRoundedRect(x, y, width, height, radius);
    }

    schedule();
  }

  function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function schedule() {
    if (!running) return;
    if (fpsMode === 60) requestAnimationFrame(draw);
    else if (fpsMode === 30) setTimeout(() => requestAnimationFrame(draw), 1000 / 30);
  }

  /* -------------------- CONTROL -------------------- */
  function start() {
    if (!initialized || running) return;
    running = true;
    lastFrame = 0;
    frameTimes.length = 0;

    if (audioCtx.state === "suspended") audioCtx.resume();
    schedule();
  }

  function stop() {
    running = false;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }

  function setColor(rgb) {
    color = rgb;
  }

  return {
    init,
    start,
    stop,
    resizeCanvas,
    setColor
  };
})();
