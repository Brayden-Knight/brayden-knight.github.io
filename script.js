const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const progress = document.getElementById("progress");

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// Reveal sections as they enter the viewport.
const revealItems = document.querySelectorAll("[data-reveal]");

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
}

// Small desktop-only 3D tilt for artwork.
if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll("[data-tilt]").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateX = (0.5 - y) * 3.5;
      const rotateY = (x - 0.5) * 4;

      card.style.transform =
        `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

// Highlight the section currently nearest the viewport.
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = navLinks
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach(link => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${visible.target.id}`
        );
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.15, 0.4] }
  );

  sections.forEach(section => navObserver.observe(section));
}
