<img src="preview/beyo.jpg" width="100%" max-width="800px">   

### [Beyo](https://Beyo.vercel.app/) is a lightweight radio player.     
  
- Instant one-click radio  
- Responsive    
- Tailwind v4   
- Vanilla JS  
- Live audio visualizer   
- Full keyboard control   
- Easy station switching   
- Built-in live clock   
- Fast and lightweight    

#### 🎧 Beyo Player    

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

#### 🌊 Waveform Visualizer (Beyo Wave)   

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

##### Tech Stack   
```
Bun | Vite | Vercel | Tailwind | Vanilla JS   
```
