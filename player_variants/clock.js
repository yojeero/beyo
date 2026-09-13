
// ---------- CLOCK ----------
(function(){
  const timeEl = document.getElementById("clockTime");
  const dayEl  = document.getElementById("clockDay");

  function tick(){
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});
    dayEl.textContent  = now.toLocaleDateString("en-US",{weekday:"long"});
  }

  tick();
  setInterval(tick,1000);
})();
