const revealItems = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileLinks = document.querySelectorAll(".mobile-menu a");
const demoModal = document.getElementById("demoModal");
const openDemoButton = document.querySelector("[data-open-demo]");
const closeDemoButtons = document.querySelectorAll("[data-close-demo]");
let previousFocus = null;

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function setMenuState(isOpen) {
  if (!menuToggle || !mobileMenu) {
    return;
  }

  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });
}

mobileLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

function openDemoModal() {
  if (!demoModal) {
    return;
  }

  previousFocus = document.activeElement;
  demoModal.classList.add("is-open");
  demoModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  const closeButton = demoModal.querySelector(".modal-close");
  closeButton?.focus();
}

function closeDemoModal() {
  if (!demoModal) {
    return;
  }

  demoModal.classList.remove("is-open");
  demoModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  previousFocus?.focus?.();
}

openDemoButton?.addEventListener("click", openDemoModal);

closeDemoButtons.forEach((button) => {
  button.addEventListener("click", closeDemoModal);
});

setMenuState(false);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);

    if (demoModal?.classList.contains("is-open")) {
      closeDemoModal();
    }
  }
});
