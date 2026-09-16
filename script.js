const TRACKS = [
  {
    title: "Aankhein Khuli Song Mohabbatein",
    artist: "Lata Mangeshkar · Udit Narayan",
    file: "music/Aankhein Khuli Song Mohabbatein.mp3",
  },
  {
    title: "Kash Koi Ladki Mujhe Pyar Karti",
    artist: "Juhi Chawla",
    file: "music/Kash Koi Ladki Mujhe Pyar Karti.mp3",
  },
  {
    title: "Aaye Ho Meri Zindagi Mein",
    artist: "Alka Yagnik",
    file: "music/Aaye Ho Meri Zindagi Mein.mp3",
  },
  {
    title: "Hum Unse Mohabbat Karke",
    artist: "Kumar Sanu",
    file: "music/Hum Unse Mohabbat Karke.mp3",
  },
  {
    title: "Pairon Mein Bandhan Hai",
    artist:
      "Lata Mangeshkar · Udit Narayan · Shankar Mahadevan · Kavita Krishnamurthy",
    file: "music/Pairon Mein Bandhan Hai.mp3",
  },
  {
    title: "Pehla Nasha Pehla Khumar",
    artist: "Udit Narayan · Sadhana Sargam",
    file: "music/Pehla Nasha Pehla Khumar.mp3",
  },
  {
    title: "Pehli Pehli Baar Mohabbat Ki Hai",
    artist: "Kumar Sanu · Alka Yagnik",
    file: "music/Pehli Pehli Baar Mohabbat Ki Hai.mp3",
  },
  {
    title: "Raah Mein Unse Mulaqat",
    artist: "Kumar Sanu · Alka Yagnik",
    file: "music/Raah Mein Unse Mulaqat.mp3",
  },
  {
    title: "Tu Jo Hans Hans Ke Sanam",
    artist: "Udit Narayan · Kavita Krishnamurthy",
    file: "music/Tu Jo Hans Hans Ke Sanam.mp3",
  },
  {
    title: "Tujhe Na Dekhu Toh Chain",
    artist: "Anu Malik · Alka Yagnik",
    file: "music/Tujhe Na Dekhu Toh Chain.mp3",
  },
  {
    title: "Us Ladki Pe Dil Aaya",
    artist: "Kumar Sanu · Alka Yagnik",
    file: "music/Us Ladki pe Dil Aaya.mp3",
  },
];

const BG = {
  day: "./background/day.mp4",
  night: "./background/night.mp4",
  dayMobile: "./background/mob_day.mp4",
  nightMobile: "./background/mob_night.mp4",
};

const $ = (id) => document.getElementById(id);

const DOM = {
  video: $("backgroundVideo"),
  playBtns: [$("playBtn"), $("playBtnMob")],
  prevBtns: [$("prevBtn"), $("prevBtnMob")],
  nextBtns: [$("nextBtn"), $("nextBtnMob")],
  chooseBtns: [$("chooseBtn"), $("chooseBtnMob")],
  rainBtn: $("rainBtn"),
  modeBtn: $("modeBtn"),
  title: $("trackTitle"),
  artist: $("trackArtist"),
  current: $("currentTime"),
  duration: $("duration"),
  progress: $("progressArea"),
  fill: $("progressFill"),
  modal: $("trackModal"),
  close: $("closeModal"),
  search: $("searchInput"),
  list: $("trackList"),
  rain: $("rain"),
};

const audio = new Audio();

audio.preload = "metadata";

let currentIndex = 0;
let mode = "night";
let rainEnabled = false;
let dragging = false;
let currentBackground = "";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";

  return `${Math.floor(seconds / 60)}:${String(
    Math.floor(seconds % 60),
  ).padStart(2, "0")}`;
};

function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getBackground() {
  if (isMobile()) {
    return mode === "night" ? BG.nightMobile : BG.dayMobile;
  }

  return mode === "night" ? BG.night : BG.day;
}

function setBackground(force = false) {
  const background = getBackground();

  if (!force && background === currentBackground) {
    return;
  }

  currentBackground = background;

  DOM.video.classList.add("opacity-0");

  setTimeout(() => {
    DOM.video.src = background;
    DOM.video.load();

    const playPromise = DOM.video.play();

    if (playPromise) {
      playPromise.catch(() => {});
    }

    DOM.video.classList.remove("opacity-0");
  }, 300);
}

function updatePlayIcon() {
  DOM.playBtns.forEach((btn) => {
    if (!btn) return;

    btn.innerHTML = audio.paused
      ? '<i class="fa-solid fa-circle-play text-[2.4rem] text-signal"></i>'
      : '<i class="fa-solid fa-circle-pause text-[2.4rem] text-signal"></i>';
  });
}

function loadTrack(index, autoplay = false) {
  currentIndex = (index + TRACKS.length) % TRACKS.length;

  const track = TRACKS[currentIndex];

  DOM.title.textContent = track.title;
  DOM.artist.textContent = track.artist;

  audio.pause();

  audio.src = encodeURI(track.file);

  audio.load();

  DOM.current.textContent = "0:00";
  DOM.duration.textContent = "0:00";
  DOM.fill.style.width = "0%";

  renderTracks(DOM.search.value);

  updatePlayIcon();

  if (autoplay) {
    audio
      .play()
      .then(updatePlayIcon)
      .catch((error) => {
        console.error("Audio playback failed:", error);
        console.error("File:", track.file);

        updatePlayIcon();
      });
  }
}

function togglePlay() {
  if (!audio.src) {
    loadTrack(currentIndex, true);
    return;
  }

  if (audio.paused) {
    audio
      .play()
      .then(updatePlayIcon)
      .catch((error) => {
        console.error("Playback failed:", error);

        updatePlayIcon();
      });
  } else {
    audio.pause();

    updatePlayIcon();
  }
}

function renderTracks(query = "") {
  const value = query.trim().toLowerCase();

  const tracks = TRACKS.map((track, index) => ({
    ...track,
    index,
  })).filter((track) =>
    `${track.title} ${track.artist}`.toLowerCase().includes(value),
  );

  if (!tracks.length) {
    DOM.list.innerHTML = `
      <div class="py-8 text-center font-mono text-[8px] tracking-[.1em] text-white/30">
        NO TRACK FOUND
      </div>
    `;

    return;
  }

  DOM.list.innerHTML = tracks
    .map((track) => {
      const active = track.index === currentIndex;

      return `
        <button
          data-index="${track.index}"
          class="track-item flex w-full items-center justify-between gap-4 rounded border px-3 py-3 text-left ${
            active ? "border-signal/30 bg-signal/10" : "border-transparent"
          }"
        >
          <div class="min-w-0">
            <div class="truncate font-display text-[17px] leading-none ${
              active ? "text-signal" : "text-white"
            }">
              ${track.title}
            </div>

            <div class="mt-1 truncate font-mono text-[8px] tracking-widest ${
              active ? "text-signal/70" : "text-white/40"
            }">
              ${track.artist}
            </div>
          </div>
        </button>
      `;
    })
    .join("");
}

function openModal() {
  renderTracks(DOM.search.value);

  DOM.modal.classList.remove("opacity-0", "invisible");

  DOM.modal.classList.add("opacity-100", "visible");

  setTimeout(() => DOM.search.focus(), 100);
}

function closeModal() {
  DOM.modal.classList.remove("opacity-100", "visible");

  DOM.modal.classList.add("opacity-0", "invisible");

  DOM.search.value = "";
}

function setMode(next) {
  mode = next;

  setBackground(true);

  DOM.modeBtn.innerHTML =
    mode === "night"
      ? '<i class="fa-solid fa-sun mr-1"></i> Day'
      : '<i class="fa-solid fa-moon mr-1"></i> Night';
}

function createRain() {
  DOM.rain.innerHTML = "";

  const amount = innerWidth < 768 ? 120 : 240;

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < amount; i++) {
    const drop = document.createElement("span");

    drop.className = "rain-drop";

    drop.style.left = `${Math.random() * 110}%`;

    drop.style.height = `${25 + Math.random() * 45}px`;

    drop.style.opacity = `${0.15 + Math.random() * 0.35}`;

    drop.style.animationDuration = `${0.35 + Math.random() * 0.8}s`;

    drop.style.animationDelay = `${Math.random() * 2}s`;

    drop.style.transform = `rotate(${9 + Math.random() * 7}deg)`;

    fragment.appendChild(drop);
  }

  DOM.rain.appendChild(fragment);
}

function toggleRain() {
  rainEnabled = !rainEnabled;

  if (rainEnabled) {
    createRain();

    DOM.rain.classList.remove("hidden");

    DOM.rainBtn.classList.add(
      "border-signal/50",
      "bg-signal/15",
      "text-signal",
    );
  } else {
    DOM.rain.classList.add("hidden");

    DOM.rainBtn.classList.remove(
      "border-signal/50",
      "bg-signal/15",
      "text-signal",
    );
  }
}

function updateProgress(e) {
  if (!audio.duration) return;

  const rect = DOM.progress.getBoundingClientRect();

  const x = e.clientX - rect.left;

  const percent = Math.max(0, Math.min(1, x / rect.width));

  DOM.fill.style.width = `${percent * 100}%`;

  if (dragging) {
    audio.currentTime = percent * audio.duration;
  }
}

DOM.playBtns.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", togglePlay);
  }
});

DOM.nextBtns.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      loadTrack(currentIndex + 1, true);
    });
  }
});

DOM.prevBtns.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      loadTrack(currentIndex - 1, true);
    });
  }
});

DOM.chooseBtns.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", openModal);
  }
});

DOM.close.addEventListener("click", closeModal);

DOM.rainBtn.addEventListener("click", toggleRain);

DOM.modeBtn.addEventListener("click", () => {
  setMode(mode === "night" ? "day" : "night");
});

DOM.search.addEventListener("input", () => {
  renderTracks(DOM.search.value);
});

DOM.list.addEventListener("click", (e) => {
  const button = e.target.closest("[data-index]");

  if (!button) return;

  loadTrack(Number(button.dataset.index), true);

  closeModal();
});

DOM.modal.addEventListener("click", (e) => {
  if (e.target === DOM.modal) {
    closeModal();
  }
});

DOM.progress.addEventListener("pointerdown", (e) => {
  dragging = true;

  DOM.progress.setPointerCapture(e.pointerId);

  updateProgress(e);
});

DOM.progress.addEventListener("pointermove", (e) => {
  if (dragging) {
    updateProgress(e);
  }
});

DOM.progress.addEventListener("pointerup", (e) => {
  dragging = false;

  updateProgress(e);
});

DOM.progress.addEventListener("pointercancel", () => {
  dragging = false;
});

audio.addEventListener("loadedmetadata", () => {
  DOM.duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (dragging) return;

  DOM.current.textContent = formatTime(audio.currentTime);

  if (audio.duration) {
    DOM.fill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  }
});

audio.addEventListener("play", updatePlayIcon);

audio.addEventListener("pause", updatePlayIcon);

audio.addEventListener("error", () => {
  console.error("Could not load audio:", TRACKS[currentIndex].file);

  updatePlayIcon();
});

audio.addEventListener("ended", () => {
  loadTrack(currentIndex + 1, true);
});

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;

  if (e.code === "Space") {
    e.preventDefault();

    togglePlay();
  }

  if (e.code === "Escape") {
    closeModal();
  }

  if (e.code === "ArrowRight") {
    loadTrack(currentIndex + 1, true);
  }

  if (e.code === "ArrowLeft") {
    loadTrack(currentIndex - 1, true);
  }
});

let resizeTimer;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    setBackground();
  }, 250);
});

const mediaQuery = window.matchMedia("(max-width: 767px)");

mediaQuery.addEventListener("change", () => {
  setBackground(true);
});

DOM.video.src = getBackground();

DOM.video.load();

DOM.video.play().catch(() => {});

currentBackground = getBackground();

loadTrack(0);

renderTracks();

updatePlayIcon();

let journeyStartTime = Date.now();

function updateClockAndDistance() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");

  const minutes = String(now.getMinutes()).padStart(2, "0");

  const seconds = String(now.getSeconds()).padStart(2, "0");

  $("realClock").textContent = `${hours}:${minutes}:${seconds}`;

  const elapsedMinutes = Math.floor((Date.now() - journeyStartTime) / 60000);

  $("distance").textContent = `${elapsedMinutes} KM`;
}

updateClockAndDistance();

setInterval(updateClockAndDistance, 1000);
