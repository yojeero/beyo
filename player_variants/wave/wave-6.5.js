// == Beyo WAVE v6.5 — Bass + Pulse + Auto-FPS =====================
window.WaveformVisualizer = (() => {
  const BAR_COUNT = 64;          
  const HEIGHT_SCALE = 0.5;      
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

  /* -------------------- INIT -------------------- */
  function init({ canvasEl, audio }) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");

    offsets = Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2);
    speeds = Array.from({ length: BAR_COUNT }, () => 0.02 + Math.random() * 0.05);

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

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
  function draw() {
    if (!running) return;

    analyser.getByteFrequencyData(dataArray);

    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;
    const barW = w / BAR_COUNT;

    ctx.clearRect(0, 0, w, h);

    const [r, g, b] = currentColor();

    // Пульсация сердца
    const pulse = 1 + PULSE_STRENGTH * Math.sin(Date.now() * PULSE_SPEED);

    for (let i = 0; i < BAR_COUNT; i++) {
      offsets[i] += speeds[i];

      const t = Math.abs(i / (BAR_COUNT - 1) - 0.5) * 2; // расстояние от центра
      const shape = Math.pow(1 - t, 2.5); // центр выше, края ниже

      // берем данные спектра: центр — низкие, края — высокие
      const freqIndex = Math.floor(t * (dataArray.length - 1));
      const audioAmp = dataArray[freqIndex] / 255;

      // микропульсация
      const wave = (Math.sin(offsets[i]) + 1) / 2;

      const amplitude = shape * wave * audioAmp * h * HEIGHT_SCALE * pulse;

      const x = i * barW + barW * 0.15;
      const y = centerY - amplitude;
      const height = amplitude * 2;
      const width = barW * 0.7;
      const radius = Math.min(width / 2, height / 2);

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      drawRoundedBar(x, y, width, height, radius);
    }

    requestAnimationFrame(draw);
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
