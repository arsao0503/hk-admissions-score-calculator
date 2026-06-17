function setupMobileNav() {
  const nav = document.querySelector(".portal-nav");
  if (!nav || nav.querySelector(".nav-toggle")) return;
  const links = Array.from(nav.querySelectorAll("a"));
  const linksPanel = document.createElement("div");
  linksPanel.className = "nav-links";
  links.forEach((link) => linksPanel.append(link));

  const toggle = document.createElement("button");
  toggle.className = "nav-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "portalNavLinks");
  toggle.setAttribute("aria-label", "開啟選單");
  toggle.innerHTML = "<span></span><span></span><span></span>";
  linksPanel.id = "portalNavLinks";

  nav.append(linksPanel, toggle);
  nav.classList.add("nav-ready");

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "關閉選單" : "開啟選單");
  });

  linksPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "開啟選單");
    });
  });
}

function setupSiteFooter() {
  if (document.querySelector(".site-footer")) return;

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div>
      <strong>HKDSE Pathway Portal</strong>
      <p>分數、性向、後備路線和出路資料只作規劃參考，正式選擇仍以院校及官方來源為準。</p>
    </div>
    <nav aria-label="頁尾連結">
      <a href="./index.html">首頁</a>
      <a href="./quiz.html">性向測試</a>
      <a href="./calculator.html">計分器</a>
      <a href="./outcomes.html">出路與薪資</a>
      <a href="./planner.html">本地後備</a>
      <a href="./overseas.html">海外升學</a>
    </nav>
  `;
  document.body.append(footer);
}

setupMobileNav();
setupSiteFooter();
