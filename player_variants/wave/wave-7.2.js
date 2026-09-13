// == Beyo WAVE v7.2 — Bass + Pulse + Auto-FPS =====================
window.WaveformVisualizer = (() => {
  const BAR_COUNT = 64;           
  const HEIGHT_SCALE = 0.45;     
  const PULSE_SPEED = 0.003;      
  const PULSE_STRENGTH = 0.15;    

  let canvas, ctx;
  let offsets, speeds;
  let colorFrom = [184, 230, 254];
  let colorTo = [184, 230, 254];
  let mix = 1;

  let audioCtx = null;
  let analyser = null;
  let source = null;
  let dataArray = null;

  let running = false;

  // --- Kick detection ---
  let kickThreshold = 0.4;
  let lastKick = 0;
  let kickDecay = 0.05;
  let kickLevel = 0;

  // --- FPS fallback ---
  let fpsTarget = 60;
  let lastFrame = 0;
  let frameTimes = [];

  /* -------------------- INIT -------------------- */
  function init({ canvasEl, audio }) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");

    offsets = Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2);
    speeds = Array.from({ length: BAR_COUNT }, () => 0.02 + Math.random() * 0.05);

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85;

      dataArray = new Uint8Array(analyser.frequencyBinCount);

      source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  /* -------------------- COLOR -------------------- */
  function setColor(rgb) {
    colorFrom = [...colorTo];
    colorTo = rgb;
    mix = 0;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function currentColor() {
    mix = Math.min(mix + 0.02, 1);
    return [
      Math.round(lerp(colorFrom[0], colorTo[0], mix)),
      Math.round(lerp(colorFrom[1], colorTo[1], mix)),
      Math.round(lerp(colorFrom[2], colorTo[2], mix))
    ];
  }

  /* -------------------- DRAW -------------------- */
  function draw(ts) {
    if (!running) return;

    // --- FPS fallback ---
    if (lastFrame) {
      const dt = ts - lastFrame;
      frameTimes.push(dt);
      if (frameTimes.length > 20) frameTimes.shift();
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;

      if (fpsTarget === 60 && avg > 26) fpsTarget = 30;
      else if (fpsTarget === 30 && avg > 40) {
        stop();
        return;
      }
    }
    lastFrame = ts;

    analyser.getByteFrequencyData(dataArray);

    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;
    const barW = w / BAR_COUNT;

    ctx.clearRect(0, 0, w, h);

    const [r, g, b] = currentColor();

    // --- Bass detection ---
    const bass = dataArray.slice(0, Math.floor(dataArray.length * 0.15));
    const bassAvg = bass.reduce((sum, v) => sum + v, 0) / bass.length / 255;

    if (bassAvg > kickThreshold && ts - lastKick > 100) {
      kickLevel = 1;
      lastKick = ts;
    } else {
      kickLevel = Math.max(0, kickLevel - kickDecay);
    }

    // --- Middle frequencies for melody ---
    const mid = dataArray.slice(Math.floor(dataArray.length * 0.15), Math.floor(dataArray.length * 0.5));
    const midAvg = mid.reduce((sum, v) => sum + v, 0) / mid.length / 255;

    const pulse = 1 + PULSE_STRENGTH * Math.sin(Date.now() * PULSE_SPEED);

    for (let i = 0; i < BAR_COUNT; i++) {
      offsets[i] += speeds[i];

      const t = Math.abs(i / (BAR_COUNT - 1) - 0.5) * 2;   // distance from center
      const shape = Math.pow(1 - t, 2.6);                  // central bars higher

      const freqIndex = Math.floor(t * (dataArray.length - 1));
      const audioAmp = dataArray[freqIndex] / 255;

      const centerBoost = 1 + (1 - t) * kickLevel * 1.5;   // kick central bars
      const sideBoost = 0.6 + midAvg * (1 - t);            // side bars melodic

      const wave = (Math.sin(offsets[i]) + 1) / 2;
      const amplitude = shape * wave * audioAmp * h * HEIGHT_SCALE * pulse * centerBoost * sideBoost;

      const x = i * barW + barW * 0.15;
      const y = centerY - amplitude;
      const height = amplitude * 2;
      const width = barW * 0.7;
      const radius = Math.min(width / 2, height / 2);

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      drawRoundedBar(x, y, width, height, radius);
    }

    if (fpsTarget === 60) requestAnimationFrame(draw);
    else setTimeout(() => requestAnimationFrame(draw), 1000 / fpsTarget);
  }

  function drawRoundedBar(x, y, w, h, r) {
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

  /* -------------------- CONTROL -------------------- */
  function start() {
    if (!running) {
      running = true;
      lastFrame = 0;
      frameTimes.length = 0;
      if (audioCtx?.state === "suspended") audioCtx.resume();
      requestAnimationFrame(draw);
    }
  }

  function stop() {
    running = false;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }

  return { init, resizeCanvas, start, stop, setColor };
})();
