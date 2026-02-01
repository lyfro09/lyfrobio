// год в футере
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// активная ссылка в меню
const current = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach(a => {
  const href = a.getAttribute("href");
  // для страниц в pages мы сравним по имени файла
  const hrefFile = href.split("/").pop();
  if (hrefFile === current) a.classList.add("active");
});

// Появление блоков при скролле
const revealEls = document.querySelectorAll(".section, .card");

revealEls.forEach(el => el.classList.add("reveal"));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.12 });

revealEls.forEach(el => io.observe(el));

document.querySelectorAll(".cards .card").forEach((card, i) => {
  card.style.transitionDelay = `${i * 70}ms`;
});

// Появление футера при появлении в зоне видимости
const footer = document.querySelector(".footer");

if (footer) {
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) footer.classList.add("footer-show");
    });
  }, { threshold: 0.15 });

  footerObserver.observe(footer);
}

/* ==================================================
   SIMPLE TERMINAL PRELOADER (SINGLE LINE)
   ================================================== */

const preloader = document.getElementById("preloader");
const typeTextEl = document.getElementById("typeText");
const typeSubEl = document.getElementById("typeSub");

if (preloader && typeTextEl) {
  document.body.classList.add("lock");

  const lines = [
    "> initializing profile: lyfro09...",
    "> compiling assets... done.",
    "> ready. welcome."
  ];

  typeSubEl.textContent = "Нажми, чтобы пропустить";

  let lineIndex = 0;
  let charIndex = 0;

  // скорость (как было — средняя)
  let speed = 35;
  const minSpeed = 16;
  const accel = 0.92;

  const closePreloader = () => {
    preloader.classList.add("hide");
    document.body.classList.remove("lock");
  };

  const getDelay = (ch) => {
    speed = Math.max(minSpeed, speed * accel);
    let d = speed + Math.random() * 10;

    if (ch === " ") d *= 0.6;
    if (".,;:!?".includes(ch)) d += 60;
    if (ch === ">") d += 70;

    return d;
  };

  const type = () => {
    const line = lines[lineIndex];

    if (!line) {
      setTimeout(closePreloader, 300);
      return;
    }

    const ch = line[charIndex];

    if (ch !== undefined) {
      typeTextEl.textContent = line.slice(0, charIndex + 1);
      charIndex++;
      setTimeout(type, getDelay(ch));
    } else {
      // следующая строка (перезаписывает предыдущую)
      lineIndex++;
      charIndex = 0;
      speed = 35;
      setTimeout(type, 260);
    }
  };

  // старт
  type();

  // пропуск
  preloader.addEventListener("click", closePreloader);
  window.addEventListener("keydown", (e) => {
    if (["Escape", "Enter", " "].includes(e.key)) closePreloader();
  });
}


/* ==================================================
   THEME TOGGLE (сохранение)
   ================================================== */

const themeBtn = document.getElementById("themeToggle");
const THEME_KEY = "lyfro09_theme";

if (localStorage.getItem(THEME_KEY) === "light") {
  document.body.classList.add("light");
}

function syncThemeIcon(){
  if (!themeBtn) return;
  themeBtn.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
}
syncThemeIcon();

if (themeBtn){
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(
      THEME_KEY,
      document.body.classList.contains("light") ? "light" : "dark"
    );
    syncThemeIcon();
  });
}
