function setupMobileNav() {
  const nav = document.querySelector(".portal-nav");
  if (!nav || nav.querySelector(".nav-toggle")) return;

  const toggle = document.createElement("button");
  toggle.className = "nav-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "開啟選單");
  toggle.innerHTML = "<span></span><span></span><span></span>";

  nav.prepend(toggle);
  nav.classList.add("nav-ready");

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "關閉選單" : "開啟選單");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "開啟選單");
    });
  });
}

setupMobileNav();
