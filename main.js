console.log("main.js loaded")

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

function syncThemeIcon() {
  if (!themeBtn) return;
  themeBtn.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
}
syncThemeIcon();

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(
      THEME_KEY,
      document.body.classList.contains("light") ? "light" : "dark"
    );
    syncThemeIcon();
  });
}

// ===== Contact form: validation + AJAX submit + honeypot =====
const form = document.querySelector(".contact-form");

if (form) {
  const errorEl = form.querySelector(".form-error");
  const okEl = form.querySelector(".form-ok");

  // ❗ исключаем honeypot из списка инпутов
  const inputs = Array.from(
    form.querySelectorAll('input:not([name="company"]), textarea')
  );

  const btn = form.querySelector('button[type="submit"]');
  const emailInput = form.querySelector('input[name="email"]');

  const showError = (msg) => {
    if (okEl) okEl.style.display = "none";
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = "block";
    }
  };

  const showOk = (msg) => {
    if (errorEl) errorEl.style.display = "none";
    if (okEl) {
      okEl.textContent = msg;
      okEl.style.display = "block";
    }
  };

  const clearStates = () => {
    inputs.forEach(el => el.classList.remove("is-error"));
    if (errorEl) errorEl.style.display = "none";
    if (okEl) okEl.style.display = "none";
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const validate = () => {
    clearStates();

    let firstBad = null;

    inputs.forEach(el => {
      const val = (el.value || "").trim();
      if (el.hasAttribute("required") && !val) {
        el.classList.add("is-error");
        if (!firstBad) firstBad = el;
      }
    });

    if (firstBad) {
      showError("Заполни все поля.");
      firstBad.focus();
      return false;
    }

    if (emailInput && !isValidEmail(emailInput.value)) {
      emailInput.classList.add("is-error");
      showError("Введи корректный email (например: name@gmail.com).");
      emailInput.focus();
      return false;
    }

    return true;
  };

  // убираем ошибку при вводе
  inputs.forEach(el => {
    el.addEventListener("input", () => {
      el.classList.remove("is-error");
      if (errorEl) errorEl.style.display = "none";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 🛡️ HONEYPOT — защита от ботов
    const trap = form.querySelector('input[name="company"]');
    if (trap && trap.value.trim() !== "") {
      return; // бот — тихо выходим
    }

    if (!validate()) return;

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Отправляю…";
      }

      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        showOk("Готово! Сообщение отправлено ✅");
        form.reset();
      } else {
        showError("Не получилось отправить 😕 Попробуй позже.");
      }
    } catch {
      showError("Ошибка сети 😕 Проверь интернет.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Отправить";
      }
    }
  });
}


// ===== Devlog + tabs + Active nav (safe, no duplicates) =====
(() => {
  // --- Active nav link ---
  const links = document.querySelectorAll(".nav-link");
  if (links.length) {
    const currentPage = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    links.forEach((link) => {
      const hrefRaw = link.getAttribute("href") || "";
      const hrefPage = hrefRaw.split("#")[0].split("?")[0].split("/").pop().toLowerCase();
      if (hrefPage === currentPage) link.classList.add("active");
    });
  }

  // --- Devlog open/close ---
  const devlogBtn = document.getElementById("devlogBtn");
  const devlogOverlay = document.getElementById("devlogOverlay");
  const devlogClose = document.getElementById("devlogClose");

  if (!devlogBtn || !devlogOverlay || !devlogClose) return;

  const openDevlog = () => devlogOverlay.classList.add("show");
  const closeDevlog = () => devlogOverlay.classList.remove("show");

  // защита от повторного навешивания
  if (!devlogBtn.dataset.bound) {
    devlogBtn.dataset.bound = "true";

    devlogBtn.addEventListener("click", openDevlog);
    devlogClose.addEventListener("click", closeDevlog);

    devlogOverlay.addEventListener("click", (e) => {
      if (e.target === devlogOverlay) closeDevlog();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDevlog();
    });
  }

  // --- Devlog tabs (with animation restart) ---
  const tabs = document.querySelectorAll(".devlog-tab");
  const contents = document.querySelectorAll(".devlog-content");
  if (!tabs.length || !contents.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      const target = document.getElementById("devlog-" + id);
      if (!target) return;

      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");

      // перезапуск анимации (чтобы fade работал каждый раз)
      target.style.animation = "none";
      void target.offsetHeight;
      target.style.animation = "";

      target.classList.add("active");
    });
  });
})();
