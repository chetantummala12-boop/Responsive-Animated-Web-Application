const iconPhotoMap = {
  "icon1.png": "picture1.jpeg",
  "icon2.png": "picture2.jpeg",
  "icon3.png": "picture3.jpeg",
  "icon4.png": "picture4.jpeg",
  "icon5.png": "picture5.jpeg",
  "icon6.png": "picture6.jpeg"
};

const iconLayer = document.getElementById("icon-layer");
const overlay = document.querySelector(".overlay");
const bgSong = document.getElementById("bgSong");

const particles = [];
const icons = Object.keys(iconPhotoMap);

const isMobile = innerWidth < 600;
const DUPLICATES = isMobile ? 1 : 2;
const featuredIcons = new Set();

let calmMode = false;
let liftMode = false;
let songStarted = false;

function fadeInSong() {
  if (!bgSong || songStarted) return;

  songStarted = true;

  bgSong.volume = 0;
  bgSong.play();

  let vol = 0;
  const fade = setInterval(() => {
    if (vol < 1) {
      vol += 0.02;
      bgSong.volume = Math.min(vol, 1);
    } else {
      clearInterval(fade);
    }
  }, 100);
}

// ---------------- ICON CREATION ----------------
icons.forEach(src => {
  for (let i = 0; i < DUPLICATES; i++) {

    const img = document.createElement("img");
    img.src = src;
    img.className = "icon";

    const isBig = !featuredIcons.has(src);
    const size = isBig ? 60 + Math.random()*10 : 45 + Math.random()*10;

    img.style.width = size + "px";
    img.dataset.baseSize = size;
    iconLayer.appendChild(img);

    const p = {
      el: img,
      x: Math.random() * (innerWidth - size),
      y: Math.random() * (innerHeight - size),
      vx: (Math.random()<0.5?-1:1)*(isBig?0.18:0.14),
      vy: (Math.random()<0.5?-1:1)*(isBig?0.18:0.14),
      size,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random()<0.5?-1:1)*(0.15 + Math.random()*0.2),
      canRotate: false,
      displayingPhoto: false,
      liftSpeed: 0
    };

    if (isBig) {
      featuredIcons.add(src);
      img.dataset.photoSrc = iconPhotoMap[src];
      let showing = false;

      img.addEventListener("click", () => {
        if (showing) return;
        showing = true;

        img.style.transition = "opacity 0.5s ease";
        img.style.opacity = "0";

        setTimeout(() => {
          p.displayingPhoto = true;
          img.src = img.dataset.photoSrc;
          img.classList.add("passport");
          img.style.width = "";
          img.style.opacity = "1";
        }, 400);

        setTimeout(() => {
          img.style.opacity = "0";

          setTimeout(() => {
            p.displayingPhoto = false;
            img.src = src;
            img.classList.remove("passport");
            img.style.width = img.dataset.baseSize + "px";
            img.style.opacity = "1";
            showing = false;
          }, 400);
        }, 4200);
      });
    }

    particles.push(p);
  }
});

// ---------------- ANIMATION LOOP ----------------
function animate() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    if (!calmMode && !liftMode) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x <= 0 || p.x + p.size >= innerWidth) p.vx *= -1;
      if (p.y <= 0 || p.y + p.size >= innerHeight) p.vy *= -1;

      if (p.canRotate) p.rotation += p.rotSpeed;
    }

    if (calmMode && !liftMode) {
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.x += p.vx;
      p.y += p.vy;
    }

    if (liftMode) {
      p.y -= p.liftSpeed;
      p.x += p.vx * 0.2;

      if (p.y + p.size < 0) {
        p.el.remove();
        particles.splice(i, 1);

        if (particles.length === 0) {
          fadeInSong();

          // 🔥 ONLY ADDITION
          const galleryWrapper = document.getElementById("galleryWrapper");
          if (galleryWrapper) {
            setTimeout(() => {
              galleryWrapper.classList.add("show");
            }, 800);
          }
        }

        continue;
      }
    }

    p.el.style.transform =
      p.displayingPhoto
        ? `translate(${p.x}px, ${p.y}px)`
        : `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
  }

  requestAnimationFrame(animate);
}
animate();

// ---------------- RESIZE ----------------
window.addEventListener("resize", () => {
  particles.forEach(p => {
    p.x = Math.min(p.x, innerWidth - p.size);
    p.y = Math.min(p.y, innerHeight - p.size);
  });
});

// ---------------- UI ELEMENTS ----------------
const btn = document.getElementById("hiBtn");
const question = document.getElementById("question");
const choices = document.querySelector(".choices");
const yesBtn = document.querySelector(".yes");

btn.addEventListener("click", () => {
  btn.classList.remove("wobble");
  void btn.offsetWidth;
  btn.classList.add("wobble");

  btn.classList.add("exit");
  setTimeout(() => question.classList.add("enter"), 350);
  setTimeout(() => choices.classList.add("show"), 1700);

  repelAllIcons();
});

// ---------------- CONFETTI ----------------
function launchConfetti() {
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;

  for (let i = 0; i < 35; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = centerX + "px";
    piece.style.top = centerY + "px";

    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;

    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed - 4;

    document.body.appendChild(piece);

    let gravity = 0.15;
    let rotation = Math.random() * 360;

    function animateConfetti() {
      vx *= 0.98;
      vy += gravity;

      const x = parseFloat(piece.style.left) + vx;
      const y = parseFloat(piece.style.top) + vy;

      rotation += 6;

      piece.style.left = x + "px";
      piece.style.top = y + "px";
      piece.style.transform = `rotate(${rotation}deg)`;

      if (y < innerHeight + 50) {
        requestAnimationFrame(animateConfetti);
      } else {
        piece.remove();
      }
    }

    animateConfetti();
  }
}

// ---------------- YES FLOW ----------------
yesBtn.addEventListener("click", () => {

  function spawnExcitedText(text, offsetX, offsetY, baseRotation, driftX, delay) {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "yay-text";
      el.innerText = text;

      el.style.position = "absolute";
      el.style.top = "50%";
      el.style.left = "50%";
      el.style.opacity = "0";

      el.style.transform = `
        translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))
        rotate(${baseRotation}deg)
        scale(0.8)
      `;

      document.body.appendChild(el);

      void el.offsetWidth;

      el.style.transition = "transform 3s ease, opacity 3s ease";
      el.style.opacity = "1";

      el.style.transform = `
        translate(calc(-50% + ${offsetX + driftX}px), calc(-50% - 150px))
        rotate(${baseRotation + (Math.random()*6 - 3)}deg)
        scale(1.15)
      `;

      setTimeout(() => el.style.opacity = "0", 2000);
      setTimeout(() => el.remove(), 3000);

    }, delay);
  }

  spawnExcitedText("YAYYYYYYYYYYY", 0, 0, 3, 20, 0);
  spawnExcitedText("LESGOOOOOOO", -220, 80, -20, -60, 200);
  spawnExcitedText("YAYAYAYAYAYAY", 240, 100, 25, 70, 350);

  launchConfetti();

  question.style.transition = "transform 1.4s cubic-bezier(0.22,1,0.36,1), opacity 1s ease";
  question.style.transform = "translateY(-200px)";
  question.style.opacity = "0";

  calmMode = true;

  setTimeout(() => {
    liftMode = true;
    calmMode = false;

    particles.forEach(p => {
      p.liftSpeed = 1 + Math.random() * 1.2;
    });

    overlay.style.transition = "background 3s ease";
    overlay.style.background = "rgba(253, 226, 228, 0.75)";
  }, 900);
});

// ---------------- REPEL ----------------
function repelAllIcons() {
  const cx = innerWidth / 2;
  const cy = innerHeight / 2;

  particles.forEach(p => {
    const dx = (p.x + p.size/2) - cx;
    const dy = (p.y + p.size/2) - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;

    p.vx += (dx/len) * (1.4 + Math.random()*0.6);
    p.vy += (dy/len) * (1.4 + Math.random()*0.6);

    const MAX_SPEED = 3;
    p.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, p.vx));
    p.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, p.vy));

    p.canRotate = true;

    setTimeout(() => {
      p.vx *= 0.55;
      p.vy *= 0.55;
    }, 2600);
  });
}

// ---------------- WORD SPAWN ----------------
const words = [
  "randomword1","randomword2","randomword3","randomword4","randomword5",
  "randomword6"
];

function spawnWord(x, y) {
  if (calmMode || liftMode) return;

  const w = document.createElement("span");
  w.innerText = words[Math.floor(Math.random()*words.length)];
  w.style.position = "fixed";
  w.style.left = x + "px";
  w.style.top = y + "px";
  w.style.transform = "translate(-50%,0)";
  w.style.fontSize = "16px";
  w.style.color = "#5a2a2a";
  w.style.opacity = "0.9";
  w.style.pointerEvents = "none";
  w.style.zIndex = "999";
  w.style.transition = "transform 1.6s ease-out, opacity 1.6s ease-out";
  document.body.appendChild(w);

  requestAnimationFrame(() => {
    w.style.transform = "translate(-50%,-40px)";
    w.style.opacity = "0";
  });

  setTimeout(() => w.remove(), 1700);
}

window.addEventListener("click", e => {
  if (e.target.closest(".icon") || e.target.id === "hiBtn") return;
  spawnWord(e.clientX, e.clientY);
});

window.addEventListener("touchstart", e => {
  if (!e.touches.length) return;
  if (e.target.closest(".icon") || e.target.id === "hiBtn") return;
  const t = e.touches[0];
  spawnWord(t.clientX, t.clientY);
});

// ---------------- MUTE BUTTON ----------------
const muteBtn = document.getElementById("muteBtn");

if (muteBtn && bgSong) {
  muteBtn.addEventListener("click", () => {
    bgSong.muted = !bgSong.muted;
    muteBtn.innerText = bgSong.muted ? "🔇" : "🔊";
  });
}
// ================= GALLERY LOGIC =================

// ================= GALLERY LOGIC (IMAGE + VIDEO) =================

const galleryItems = [
  { type: "video", src: "video1.mp4" },
  { type: "image", src: "image1.jpeg" },
  { type: "video", src: "video2.mp4" },
  {type: "image", src: "image2.jpeg" },
  { type: "video", src: "video3.mp4" },
  {type: "image", src: "image3.jpeg" },
  { type: "video", src: "video4.mp4" },
  { type: "image", src: "image4.jpeg" },
  { type: "image", src: "image5.jpeg" },
  { type: "video", src: "video5.mp4" },
  { type: "image", src: "image6.jpeg"} ,
  { type: "video", src: "video6.mp4" },
  // add more here
];

let currentIndex = 0;

const galleryWrapper = document.getElementById("galleryWrapper");
const mediaContainer = document.getElementById("mediaContainer");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

function renderMedia() {
  if (!mediaContainer) return;

  mediaContainer.innerHTML = "";

  const item = galleryItems[currentIndex];

  let element;

  if (item.type === "image") {
    element = document.createElement("img");
    element.src = item.src;
  }

  if (item.type === "video") {
    element = document.createElement("video");
    element.src = item.src;
    element.autoplay = true;
    element.loop = true;
    element.muted = true; // IMPORTANT
    element.playsInline = true;
  }

  element.style.opacity = "0";
  element.style.transition = "opacity 1.8s ease";

  element.style.maxWidth = "100%";
  element.style.maxHeight = "100%";
  element.style.borderRadius = "18px";
  element.style.objectFit = "cover";

  mediaContainer.appendChild(element);

  setTimeout(() => {
    element.style.opacity = "1";
  }, 150);
}

// Next button
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (currentIndex < galleryItems.length - 1) {
      currentIndex++;
      renderMedia();
    }
  });
}

// Prev button
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderMedia();
    }
  });
}

// Load first media when gallery appears
if (galleryWrapper) {
  const observer = new MutationObserver(() => {
    if (galleryWrapper.classList.contains("show")) {
      renderMedia();
    }
  });

  observer.observe(galleryWrapper, { attributes: true });
}
const letterBtn = document.getElementById("letterBtn");
const galleryCard = document.getElementById("galleryCard");

if (letterBtn && galleryWrapper && galleryCard) {

  letterBtn.addEventListener("click", () => {

    // Prevent double click chaos
    if (galleryWrapper.classList.contains("letter-open")) return;

    // Step 1: slide gallery
    galleryWrapper.classList.add("letter-open");

    // Step 2: wait for slide to finish
    function onSlideEnd(e) {
      if (e.propertyName !== "transform") return;

      galleryCard.removeEventListener("transitionend", onSlideEnd);

      // Step 3: reveal letter
      galleryWrapper.classList.add("show-letter");
    }

    galleryCard.addEventListener("transitionend", onSlideEnd);
  });
}
const replayBtn = document.getElementById("replayBtn");

if (replayBtn) {
  replayBtn.addEventListener("click", () => {

    // Reset gallery state
    galleryWrapper.classList.remove("letter-open");
    galleryWrapper.classList.remove("show-letter");
    galleryWrapper.classList.remove("show");

    // Reset index
    currentIndex = 0;
    renderMedia();

    // Stop music
    if (bgSong) {
      bgSong.pause();
      bgSong.currentTime = 0;
      songStarted = false;
    }

    // Reset UI
    question.classList.remove("enter");
    choices.classList.remove("show");
    btn.classList.remove("exit");

    // Reload page visuals cleanly
    location.reload(); // 🔥 safest full reset
  });
}


const noBtn = document.querySelector(".no");
const noOverlay = document.getElementById("noOverlay");

if (noBtn) {

  let hoverCount = 0;
  const maxHovers = 30;
  let stopped = false;

  noBtn.addEventListener("mouseenter", () => {

    if (stopped) return;

    hoverCount++;

    if (hoverCount >= maxHovers) {
      stopped = true;
      noBtn.textContent = "no"; // optional personality change
      return;
    }

    const maxMove = 120;

    const moveX = (Math.random() - 0.5) * maxMove;
    const moveY = (Math.random() - 0.5) * maxMove;

    noBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  // Only works after stopped
  noBtn.addEventListener("click", () => {

    if (!stopped) return; // ignore clicks before 30 hovers

    if (noOverlay) {
      noOverlay.classList.add("show");

      setTimeout(() => {
        noOverlay.classList.remove("show");
      }, 2500);
    }
  });

}
