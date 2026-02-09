<img src="preview/view.jpg" width="830">   

### [Alpen Player](https://alpen.vercel.app/) is a lightweight radio player.     
  
- Instant one-click radio  
- Responsive    
- Tailwind v4   
- Vanilla JS  
- Live audio visualizer   
- Full keyboard control   
- Easy station switching   
- Built-in live clock   
- Fast and lightweight    

<img alt="" src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" height="20"/><img alt="" src="https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D" height="20"/><img alt="" src="https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" height="20"/><img alt="" src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" height="20"/><img alt="" src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" height="20"/><img alt="" src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" height="20"/>

#### 🎧 Alpen Player    

Built with pure JavaScript, Web Audio API, and Canvas, focuses on fluid UI transitions, responsive controls, and intelligent performance scaling.       

#### 🎵 Audio Player   
```
Play / Pause, Next, Previous controls   
Keyboard shortcuts   
Space — Play / Pause   
← / → — Track navigation   
```

- Automatic next track on end   
- Track metadata support (title, artist, cover, accent color)   
- Smooth cover art fade transitions   
- Centralized player state via data-player-state   

#### 🌊 Waveform Visualizer (Alpen Wave)   

- Real-time audio-reactive waveform   
- Soft “breathing” idle animation when audio is paused   
- Bass-responsive kick amplification   
- Rounded bars with symmetrical center shaping   
- Smooth color interpolation between tracks   
- Canvas-based rendering (no external libraries)   

#### 📱 Performance & Device Awareness   

- Automatic detection of ultra-low-end devices   
- Visualizer disabled on weak hardware to save battery & CPU   
- Reduced redraw frequency for idle mode   
- Optimized FFT size and smoothing for mobile browsers   

#### 🧠 Smart Behavior   

- Visualizer pauses when the tab is hidden   
- Resumes automatically when playback continues   
- AudioContext resumes safely after browser suspension   
- Adaptive visual behavior depending on playback state

#### 🧩 Modular Architecture   

- player.js — Audio logic, controls, UI state   
- wave.js — Independent visualizer engine   
- tracks.json — customize radio stations / covers / wave colours    
- Easily extensible and framework-agnostic   
- Clean separation of concerns   
