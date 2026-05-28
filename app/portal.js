const portalData = window.DSE_PORTAL_DATA || { subjects: [], interestTags: [], salaryOutcomes: [], sources: {} };

function h(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  return Math.round(value * 1000).toLocaleString("en-HK");
}

function renderSubjectFilters() {
  const container = document.querySelector("#subjectFilters");
  if (!container) return;
  const klas = [...new Set(portalData.subjects.map((subject) => subject.kla))].sort();
  const interests = portalData.interestTags;
  container.innerHTML = `
    <label>
      搜尋科目 / 出路
      <input id="subjectSearch" type="search" placeholder="例如 工程 / 醫療 / 寫作 / 數據" />
    </label>
    <label>
      學習領域
      <select id="subjectKla">
        <option value="">全部</option>
        ${klas.map((kla) => `<option value="${h(kla)}">${h(kla)}</option>`).join("")}
      </select>
    </label>
    <label>
      興趣方向
      <select id="subjectInterest">
        <option value="">全部</option>
        ${interests.map((interest) => `<option value="${h(interest.id)}">${h(interest.label)}</option>`).join("")}
      </select>
    </label>
  `;
  container.addEventListener("input", renderSubjects);
  container.addEventListener("change", renderSubjects);
}

function renderSubjects() {
  const container = document.querySelector("#subjectCards");
  if (!container) return;
  const query = document.querySelector("#subjectSearch")?.value.trim().toLowerCase() || "";
  const kla = document.querySelector("#subjectKla")?.value || "";
  const interest = document.querySelector("#subjectInterest")?.value || "";

  const subjects = portalData.subjects.filter((subject) => {
    const text = [
      subject.name,
      subject.type,
      subject.kla,
      subject.scope,
      subject.assessment,
      subject.fit,
      subject.caution,
      ...(subject.syllabus || []),
      ...(subject.facts || []),
      ...(subject.pathways || []),
    ]
      .join(" ")
      .toLowerCase();
    return (!query || text.includes(query)) && (!kla || subject.kla === kla) && (!interest || subject.interests.includes(interest));
  });

  container.innerHTML = subjects
    .map(
      (subject) => `
        <article class="subject-detail-card">
          <header>
            <span>${h(subject.type)} · ${h(subject.kla)}</span>
            <h2>${h(subject.name)}</h2>
          </header>
          <dl>
            <div>
              <dt>Syllabus 主題</dt>
              <dd>
                <ul class="syllabus-list">
                  ${(subject.syllabus || [subject.scope]).map((item) => `<li>${h(item)}</li>`).join("")}
                </ul>
              </dd>
            </div>
            <div>
              <dt>學習範圍</dt>
              <dd>${h(subject.scope)}</dd>
            </div>
            <div>
              <dt>評核與準備</dt>
              <dd>${h(subject.assessment)}</dd>
            </div>
            <div>
              <dt>適合學生</dt>
              <dd>${h(subject.fit)}</dd>
            </div>
            <div>
              <dt>選科前要小心</dt>
              <dd>${h(subject.caution)}</dd>
            </div>
          </dl>
          <section class="fact-box">
            <h3>3 條 syllabus 小知識</h3>
            <ol>
              ${(subject.facts || []).slice(0, 3).map((fact) => `<li>${h(fact)}</li>`).join("")}
            </ol>
          </section>
          <div class="tag-row">
            ${(subject.pathways || []).map((pathway) => `<span>${h(pathway)}</span>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderInterestPlanner() {
  const container = document.querySelector("#interestPlanner");
  if (!container) return;
  container.innerHTML = portalData.interestTags
    .map((interest) => {
      const subjects = portalData.subjects.filter((subject) => subject.interests.includes(interest.id)).slice(0, 6);
      return `
        <article class="route-card">
          <span>${h(interest.label)}</span>
          <h3>${h(interest.description)}</h3>
          <div class="tag-row">
            ${subjects.map((subject) => `<a href="./subjects.html">${h(subject.name)}</a>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderOutcomeControls() {
  const container = document.querySelector("#outcomeControls");
  if (!container) return;
  const levels = [...new Set(portalData.salaryOutcomes.map((row) => row.level))];
  container.innerHTML = `
    <label>
      修課程度
      <select id="outcomeLevel">
        <option value="">全部</option>
        ${levels.map((level) => `<option value="${h(level)}" ${level === "Undergraduate" ? "selected" : ""}>${h(level)}</option>`).join("")}
      </select>
    </label>
  `;
  container.addEventListener("change", renderOutcomes);
}

function renderOutcomes() {
  const container = document.querySelector("#outcomeRows");
  if (!container) return;
  const level = document.querySelector("#outcomeLevel")?.value || "Undergraduate";
  const rows = portalData.salaryOutcomes
    .filter((row) => !level || row.level === level)
    .sort((a, b) => b.annualK - a.annualK);

  container.innerHTML = rows
    .map((row) => {
      const monthly = Math.round((row.annualK * 1000) / 12 / 100) * 100;
      return `
        <article class="outcome-row">
          <div>
            <span>${h(row.year)} · ${h(row.level)}</span>
            <h2>${h(row.category)}</h2>
          </div>
          <strong>HK$${h(row.annualK)}k / 年</strong>
          <p>約 HK$${h(monthly.toLocaleString("en-HK"))} / 月。資料層級：UGC broad academic programme category，只包括全職就業畢業生。</p>
        </article>
      `;
    })
    .join("");
}

renderSubjectFilters();
renderSubjects();
renderInterestPlanner();
renderOutcomeControls();
renderOutcomes();
