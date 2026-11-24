    // ─── Config ──────────────────────────────────────────────────────────────
    const BG_MUSIC = 'audio/music/lofiabba.mp3'


    const ADS = [
      'sources/ads/felis gif.gif', 
      'sources/ads/gif bday.gif',
      'sources/ads/gif terrence.gif',
    ]
    
    const CLOTHES = [
      { src: 'clothes/Blue trousers.png'},
      { src: 'clothes/shirt and vest.png'},
      { src: 'clothes/pointed boots.png'},
      { src: 'clothes/tshirt 1.png'},
      { src: 'clothes/tshirt 2.png'},
      { src: 'clothes/disco pants.png'},
      { src: 'clothes/hotdog costume.png'},
      { src: 'clothes/lesbian shorts.png'},
      { src: 'clothes/sunset shirt.png'},
      { src: 'clothes/chunky boots.png'},
      { src: 'clothes/glass shirt.png'},
      { src: 'clothes/jeans 1.png'},
      { src: 'clothes/jeans 2.png'},
      { src: 'clothes/little tights.png'},
      { src: 'clothes/shirt and vest 2.png'},
      { src: 'clothes/simple tank top.png'},
      { src: 'clothes/texnoupoli tshirt.png'},
    ];

       const SOUNDS = [
      'audio/sounds/yass1.mp3',
      'audio/sounds/socool.mp3',
      'audio/sounds/slay.mp3',
      'audio/sounds/preyin.mp3',
      'audio/sounds/khoukhyeating.mp3',
      'audio/sounds/glothnothing.mp3',
      'audio/sounds/ghamazing.mp3',
      'audio/sounds/ghamao.mp3',
      'audio/sounds/flat.mp3',
      'audio/sounds/fidia.mp3',
      'audio/sounds/erseljealous.mp3',
      'audio/sounds/dayslay.mp3',
      'audio/sounds/casslook.mp3',
      'audio/sounds/awesome.mp3',
      'audio/sounds/anthonylove.mp3',
    ];

    const CHARACTER_WIDTH  = 398; // px – stage width  (image is scaled to this)
    const CHARACTER_HEIGHT = 810; // px – stage height

    // ─── Elements ────────────────────────────────────────────────────────────
    const stage       = document.getElementById('stage');
    const terrence    = document.getElementById('terrence');
    const panel       = document.getElementById('clothes-panel');
    const ghost       = document.getElementById('drag-ghost');
    const resetBtn    = document.getElementById('reset-btn');

    // ─── Size the stage ──────────────────────────────────────────────────────
    // terrence.style.width  = CHARACTER_WIDTH  + 'px';
    // terrence.style.height = CHARACTER_HEIGHT + 'px';
    stage.style.width     = CHARACTER_WIDTH  + 'px';
    stage.style.height    = CHARACTER_HEIGHT + 'px';

    // ─── Build wardrobe ──────────────────────────────────────────────────────
    CLOTHES.forEach(cloth => {
      const item = document.createElement('div');
      item.className = 'clothes-item';
      item.dataset.src = cloth.src;

      const img = document.createElement('img');
      img.src = cloth.src;
      img.alt = cloth.name;

      const label = document.createElement('span');
      label.className = 'label';
      // label.textContent = cloth.name;

      item.appendChild(img);
      item.appendChild(label);
      panel.appendChild(item);

      // ── Mouse drag (desktop) ──────────────────────────────────────────────
      item.addEventListener('mousedown', onMouseDown);

      // ── Touch drag (mobile) ───────────────────────────────────────────────
      item.addEventListener('touchstart', onTouchStart, { passive: false });
    });

    // ─── Drag state ──────────────────────────────────────────────────────────
    let dragSrc    = null;   // src of the item being dragged
    let dragging   = false;

    // ── Mouse events ─────────────────────────────────────────────────────────
    function onMouseDown(e) {
      e.preventDefault();
      startDrag(e.currentTarget.dataset.src, e.clientX, e.clientY);

      function onMove(e) { moveDrag(e.clientX, e.clientY); }
      function onUp(e)   { endDrag(e.clientX, e.clientY); cleanup(); }
      function cleanup() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    }

    // ── Touch events ─────────────────────────────────────────────────────────
    function onTouchStart(e) {
      e.preventDefault();
      const t = e.touches[0];
      startDrag(e.currentTarget.dataset.src, t.clientX, t.clientY);

      function onMove(e) { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }
      function onEnd(e)  {
        const t = e.changedTouches[0];
        endDrag(t.clientX, t.clientY);
        cleanup();
      }
      function cleanup() {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend',  onEnd);
      }
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend',  onEnd);
    }

    // ── Core drag helpers ─────────────────────────────────────────────────────
    function startDrag(src, cx, cy) {
      dragSrc  = src;
      dragging = true;
      ghost.src = src;
      ghost.style.width  = '100px';
      ghost.style.height = '100px';
      ghost.style.display = 'block';
      moveDrag(cx, cy);

      // dim the source tile
      document.querySelectorAll('.clothes-item').forEach(el => {
        if (el.dataset.src === src) el.classList.add('dragging');
      });
    }

    function moveDrag(cx, cy) {
      ghost.style.left = cx + 'px';
      ghost.style.top  = cy + 'px';

      // highlight stage when hovering over it
      const stageRect = stage.getBoundingClientRect();
      const over = cx >= stageRect.left && cx <= stageRect.right &&
                   cy >= stageRect.top  && cy <= stageRect.bottom;
      stage.classList.toggle('drag-over', over);
    }

    function endDrag(cx, cy) {
      if (!dragging) return;
      dragging = false;

      ghost.style.display = 'none';
      stage.classList.remove('drag-over');
      document.querySelectorAll('.clothes-item.dragging')
              .forEach(el => el.classList.remove('dragging'));

      // check if dropped on the stage
      const stageRect = stage.getBoundingClientRect();
      const hit = cx >= stageRect.left && cx <= stageRect.right &&
                  cy >= stageRect.top  && cy <= stageRect.bottom;

      if (hit && dragSrc) {
        wearCloth(dragSrc);
      }
      dragSrc = null;
    }

    // ── Put cloth on character ────────────────────────────────────────────────
    function wearCloth(src) {
      // only one of each clothing type at a time
      const existing = stage.querySelector(`img.worn-item[data-src="${src}"]`);
      if (existing) return; // already wearing it

      const img = document.createElement('img');
      img.className   = 'worn-item';
      img.src         = src;
      img.dataset.src = src;
      img.alt         = '';
      stage.appendChild(img);
      playRandomSound();
    }

    // ── Play a random sound ───────────────────────────────────────────────────
    let currentAudio = null;
    let soundPool = [];
    function playRandomSound() {
      if (soundPool.length === 0) soundPool = [...SOUNDS];
      const index = Math.floor(Math.random() * soundPool.length);
      const src = soundPool.splice(index, 1)[0];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      currentAudio = new Audio(src);
      currentAudio.volume = 1;
      currentAudio.play();
    }

    // ── Background music ──────────────────────────────────────────────────────
    const bgMusic = new Audio(BG_MUSIC);
    bgMusic.loop   = true;
    bgMusic.volume = 0.05;
    document.addEventListener('click', () => {bgMusic.play();}, { once: true });

    // BGM STOP
    function bgmToggle() {
      if (bgMusic.paused) {
        bgMusic.play();
        bgmBtn.textContent = '\uD83D\uDD0A';
      } else {
        bgMusic.pause();
        bgmBtn.textContent = '\uD83D\uDD07';
      }
    }
    // ── Ad GIF rotator ──────────────────────────────────────────────────────────
    (function rotateAds() {
      const adEl = document.getElementById('ad_gif');
      if (!adEl) return;
      let index = 0;
      adEl.src = ADS[index];
      setInterval(() => {
        index = (index + 1) % ADS.length;
        adEl.src = ADS[index];
      }, 6000);
    })();

    // ── Disappear Splash screen ──────────────────────────────────────────────────────────
    function hideSplash() {
      document.getElementById('splash-screen').style.display = "none";
      document.body.style.overflowY = "auto";
    }

    // ── Reset ─────────────────────────────────────────────────────────────────
    resetBtn.addEventListener('click', () => {
      stage.querySelectorAll('.worn-item').forEach(el => el.remove());
    });