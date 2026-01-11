// ================================
// @yojeero VUE 3 RADIO PLAYER v4
// Vue 3 / keyboard / tracks / visualizer
// ================================

const {
  createApp,
  ref,
  computed,
  onMounted,
  watch,
  onBeforeUnmount,
  nextTick,
} = Vue;

createApp({
  setup() {
    // ================= AUDIO =================
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";

    let audioCtx = null;
    let analyser = null;
    let source = null;
    let rafId = null;

    let dataArray = null;
    let prevData = null;

    // ================= STATE =================
    const tracks = ref([]);
    const currentTrackIndex = ref(0);
    const currentTrack = computed(
      () => tracks.value[currentTrackIndex.value] || {}
    );

    const isPlaying = ref(false);
    const volume = ref(1);

    const canvasRef = ref(null);

    const clockTime = ref("");
    const clockDay = ref("");

    const VOLUME_KEY = "radioVolume";
    const STATION_KEY = "lastStation";

    // ================= AUDIO CONTEXT =================
    function initAudioContext() {
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

    // ================= VISUALIZER =================
    function resizeCanvas() {
      const canvas = canvasRef.value;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const ratio = window.devicePixelRatio || 1;

      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      ctx.scale(ratio, ratio);
    }

    function drawBars() {
      if (!canvasRef.value || !analyser) return;

      const canvas = canvasRef.value;
      const ctx = canvas.getContext("2d");
      const { width, height } = canvas;

      const bufferLength = analyser.frequencyBinCount;
      const barWidth = width / bufferLength;

      ctx.clearRect(0, 0, width, height);

      const center = Math.floor(bufferLength / 2);

      for (let i = 0; i < center; i += 2) {
        let barValue;
        if (isPlaying.value) {
          analyser.getByteFrequencyData(dataArray);
          prevData[i] = prevData[i] * 0.8 + dataArray[i] * 0.2;
          barValue = prevData[i];
        } else {
          barValue = 20; // static low value when not playing
        }

        const factor = 1 - i / center;
        const barHeight =
          ((barValue / 255) * height * 0.7 + height * 0.1) * factor;

        ctx.fillStyle = `hsla(185,38%,${70 + factor * 5}%,0.85)`;

        const xLeft = width / 2 - barWidth * (i + 1);
        const xRight = width / 2 + i * barWidth;

        ctx.fillRect(xLeft, height - barHeight, barWidth * 1.6, barHeight);
        ctx.fillRect(xRight, height - barHeight, barWidth * 1.6, barHeight);
      }

      if (isPlaying.value) {
        rafId = requestAnimationFrame(drawBars);
      }
    }

    // ================= CORE =================
    audio.addEventListener("play", () => {
      isPlaying.value = true;
      drawBars();
    });

    audio.addEventListener("pause", () => {
      isPlaying.value = false;
      cancelAnimationFrame(rafId);
      drawBars();
    });

    audio.addEventListener("ended", () => {
      nextTrack();
    });

    audio.addEventListener("error", () => {
      isPlaying.value = false;
      cancelAnimationFrame(rafId);
      drawBars();
    });

    audio.addEventListener("stalled", () => {
      // If stalled for too long, stop playback
      setTimeout(() => {
        if (audio.readyState < 3) {
          isPlaying.value = false;
          cancelAnimationFrame(rafId);
          drawBars();
        }
      }, 5000); // 5 seconds timeout
    });

    audio.addEventListener("abort", () => {
      isPlaying.value = false;
      cancelAnimationFrame(rafId);
      drawBars();
    });

    // ================= STATIONS =================
    function switchStation(index) {
      if (!tracks.value[index]) return;

      const wasPlaying = isPlaying.value;

      currentTrackIndex.value = index;

      audio.src = tracks.value[index].src;
      audio.load();
      if (wasPlaying) audio.play().catch(() => { isPlaying.value = false; });
    }

    async function togglePlay() {
      if (isPlaying.value) {
        audio.pause();
      } else {
        initAudioContext();
        try {
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }
          await audio.play();
        } catch (e) {
          isPlaying.value = false;
        }
      }
    }

    function nextTrack() {
      if (!tracks.value.length) return;
      switchStation((currentTrackIndex.value + 1) % tracks.value.length);
    }

    function prevTrack() {
      if (!tracks.value.length) return;
      switchStation(
        (currentTrackIndex.value - 1 + tracks.value.length) %
          tracks.value.length
      );
    }

    // ================= KEYBOARD =================
    function handleKeydown(e) {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") nextTrack();
      if (e.code === "ArrowLeft") prevTrack();
    }

    // ================= CLOCK =================
    function updateClock() {
      const now = new Date();
      clockTime.value = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      clockDay.value = now.toLocaleDateString("en-US", { weekday: "long" });
    }

    let clockInterval = null;

    // ================= INIT =================
    async function loadTracks() {
      const res = await fetch("js/tracks.json");
      tracks.value = await res.json();

      const savedStation = localStorage.getItem(STATION_KEY);
      if (savedStation && tracks.value[savedStation]) {
        currentTrackIndex.value = +savedStation;
        audio.src = tracks.value[savedStation].src;
      }

      // Preload current track
      if (tracks.value.length) {
        const idx = currentTrackIndex.value;
        audio.src = tracks.value[idx].src;
        audio.load();
        initAudioContext();
      }

      const savedVol = localStorage.getItem(VOLUME_KEY);
      if (savedVol !== null) {
        volume.value = Math.min(Math.max(+savedVol, 0), 1);
        audio.volume = volume.value;
      }
    }

    watch(volume, (v) => localStorage.setItem(VOLUME_KEY, v));
    watch(currentTrackIndex, (v) => localStorage.setItem(STATION_KEY, v));

    onMounted(async () => {
      await loadTracks();
      updateClock();
      clockInterval = setInterval(updateClock, 1000);
      await nextTick();
      resizeCanvas();
      drawBars();
      window.addEventListener("resize", resizeCanvas);
      window.addEventListener("keydown", handleKeydown);
    });

    onBeforeUnmount(() => {
      clearInterval(clockInterval);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeydown);
      cancelAnimationFrame(rafId);
    });

    return {
      tracks,
      currentTrackIndex,
      currentTrack,
      isPlaying,
      canvasRef,
      clockTime,
      clockDay,
      togglePlay,
      nextTrack,
      prevTrack,
      switchStation,
    };
  },
}).mount("#app");