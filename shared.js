/* Theme cycle + scroll reveals + the phone mockup's countdown.
   The page is fully usable without JS: styles that hide content only
   apply under html.js, added here as the very first thing. */
document.documentElement.classList.add("js");

/* ---------- theme: auto → light → dark ---------- */
(function () {
  var ORDER = ["auto", "light", "dark"];
  var FACE = { auto: "◐", light: "☀", dark: "☾" };
  var LABEL = {
    auto: "Theme: follows your system",
    light: "Theme: light",
    dark: "Theme: dark",
  };
  var PAPER = { light: "#F6F2EA", dark: "#1B1915" };
  var root = document.documentElement;
  var mode = "auto";
  try {
    var saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") mode = saved;
  } catch (e) {}

  function paint() {
    if (mode === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    var icon = document.getElementById("themeIcon");
    var btn = document.getElementById("themeBtn");
    if (icon) icon.textContent = FACE[mode];
    if (btn) {
      btn.title = LABEL[mode];
      btn.setAttribute("aria-label", LABEL[mode] + ". Tap to change.");
    }
    var dark =
      mode === "dark" ||
      (mode === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.remove(); });
    var m = document.createElement("meta");
    m.name = "theme-color";
    m.content = dark ? PAPER.dark : PAPER.light;
    document.head.appendChild(m);
  }

  function init() {
    var btn = document.getElementById("themeBtn");
    if (btn)
      btn.addEventListener("click", function () {
        mode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
        try { localStorage.setItem("theme", mode); } catch (e) {}
        paint();
      });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (mode === "auto") paint();
    });
    paint();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

/* ---------- scroll reveals ---------- */
(function () {
  function revealAll() {
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("in"); });
  }
  function init() {
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.setAttribute("data-reveal", "");
        child.style.setProperty("--reveal-delay", Math.min(i * 70, 420) + "ms");
      });
    });
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver !== "function"
    ) {
      revealAll();
      return;
    }
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

/* ---------- phone: scale to slot + live countdown ---------- */
(function () {
  function init() {
    var slot = document.querySelector(".phone-slot");
    if (!slot) return;

    function fit() {
      /* the phone renders at 290x600; scale it to fit the viewport height
         and the slot's available column width */
      var maxW = Math.min(340, slot.parentElement.getBoundingClientRect().width);
      var maxH = Math.max(420, window.innerHeight * 0.78);
      var s = Math.min(maxW / 290, maxH / 600, 1);
      slot.style.setProperty("--phone-scale", s.toFixed(4));
    }
    fit();
    addEventListener("resize", fit);

    /* the "parked" banner slides in once the phone is on screen. The phone
       itself is never hidden — only the banner keys off .in — so a missed
       intersection (mobile, reduced-motion, old Safari) can't blank it. */
    if (typeof IntersectionObserver === "function") {
      var io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
          });
        },
        { threshold: 0.25 }
      );
      io.observe(slot);
    } else slot.classList.add("in");

    /* "sweep in 37h 3m" counts down a minute at a time. Pure theater,
       same numbers as the App Store screenshot. */
    var count = document.getElementById("swCountdown");
    if (!count) return;
    var minutes = 37 * 60 + 3;
    setInterval(function () {
      minutes = minutes > 1 ? minutes - 1 : 37 * 60 + 3;
      var h = Math.floor(minutes / 60), m = minutes % 60;
      count.textContent = h + "h " + m + "m";
    }, 60000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

/* ---------- website analytics ----------
   None yet. This site sets no cookies and loads no analytics; if a GA4
   property is added later, drop the gtag loader here AND update the
   "This website" section of privacy.html to match. */
