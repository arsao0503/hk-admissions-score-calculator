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

function scoreQuiz(form) {
  const totals = Object.fromEntries(portalData.interestTags.map((interest) => [interest.id, 0]));
  const answers = new Map(new FormData(form).entries());

  portalData.quizQuestions.forEach((question) => {
    const selected = Number(answers.get(question.id));
    const choice = question.choices[selected];
    if (!choice) return;
    Object.entries(choice.scores).forEach(([interest, points]) => {
      totals[interest] = (totals[interest] || 0) + points;
    });
  });

  return totals;
}

function subjectScore(subject, topInterestIds) {
  return topInterestIds.reduce((score, interestId, index) => {
    if (!subject.interests.includes(interestId)) return score;
    return score + (topInterestIds.length - index) * 2;
  }, 0);
}

function renderQuizResult(totals) {
  const result = document.querySelector("#quizResult");
  if (!result) return;

  const ranked = Object.entries(totals)
    .map(([id, score]) => ({
      ...(portalData.interestTags.find((interest) => interest.id === id) || { id, label: id, description: "" }),
      score,
    }))
    .sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...ranked.map((item) => item.score), 1);
  const topInterests = ranked.filter((item) => item.score > 0).slice(0, 3);
  const topInterestIds = topInterests.map((item) => item.id);
  const recommendations = portalData.subjects
    .map((subject) => ({ ...subject, matchScore: subjectScore(subject, topInterestIds) }))
    .filter((subject) => subject.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || a.name.localeCompare(b.name))
    .slice(0, 8);

  result.hidden = false;
  result.innerHTML = `
    <div class="section-head">
      <div>
        <p class="eyebrow">Result</p>
        <h2>你的學科興趣傾向</h2>
      </div>
      <button class="ghost-button" id="quizReset" type="button">重新作答</button>
    </div>
    <div class="quiz-summary-grid">
      ${topInterests
        .map(
          (interest, index) => `
            <article>
              <span>Top ${index + 1}</span>
              <h3>${h(interest.label)}</h3>
              <p>${h(interest.description)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="score-bars" aria-label="各興趣方向得分">
      ${ranked
        .map(
          (interest) => `
            <div class="score-bar-row">
              <span>${h(interest.label)}</span>
              <div class="bar-track"><i style="width: ${(interest.score / maxScore) * 100}%"></i></div>
              <strong>${h(interest.score)}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
    <section class="quiz-recommendations">
      <h3>可以優先比較的選修科</h3>
      <div class="recommendation-grid">
        ${recommendations
          .map(
            (subject) => `
              <article>
                <span>${h(subject.kla)}</span>
                <h4>${h(subject.name)}</h4>
                <p>${h(subject.scope)}</p>
                <a href="./subjects.html">查看 syllabus</a>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
    <section class="quiz-next-steps">
      <h3>下一步應該怎樣用結果</h3>
      <ol>
        <li>先把推薦科目打開，看完整 syllabus、評核方式和 3 條小知識，不要只看科名。</li>
        <li>從推薦科目中選 2-3 個可能組合，記錄「喜歡原因」和「擔心位」。</li>
        <li>如果已有目標 programme，再到計分器核對指定科目、weighting 和 admission score 風險。</li>
      </ol>
    </section>
  `;

  document.querySelector("#quizReset")?.addEventListener("click", () => {
    document.querySelector("#quizForm")?.reset();
    result.hidden = true;
    document.querySelector("#quizProgress")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateQuizProgress() {
  const progress = document.querySelector("#quizProgress");
  const form = document.querySelector("#quizForm");
  if (!progress || !form) return;
  const answered = new FormData(form).entries();
  const answeredCount = new Set([...answered].map(([key]) => key)).size;
  const total = portalData.quizQuestions.length;
  progress.innerHTML = `
    <strong>${answeredCount} / ${total}</strong>
    <span>${answeredCount === total ? "可以查看結果" : `尚有 ${total - answeredCount} 題未完成`}</span>
  `;
}

function renderQuiz() {
  const form = document.querySelector("#quizForm");
  if (!form) return;

  form.innerHTML = `
    ${portalData.quizQuestions
      .map(
        (question, questionIndex) => `
          <fieldset class="quiz-question">
            <legend>
              <span>${String(questionIndex + 1).padStart(2, "0")}</span>
              ${h(question.text)}
            </legend>
            <div class="choice-grid">
              ${question.choices
                .map(
                  (choice, choiceIndex) => `
                    <label class="choice-option">
                      <input type="radio" name="${h(question.id)}" value="${choiceIndex}" required />
                      <span>${h(choice.label)}</span>
                    </label>
                  `,
                )
                .join("")}
            </div>
          </fieldset>
        `,
      )
      .join("")}
    <div class="quiz-actions">
      <button class="primary-button" type="submit">查看我的學科傾向</button>
      <button class="ghost-button" type="reset">清除答案</button>
    </div>
  `;

  form.addEventListener("change", updateQuizProgress);
  form.addEventListener("reset", () => {
    setTimeout(updateQuizProgress, 0);
    const result = document.querySelector("#quizResult");
    if (result) result.hidden = true;
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const missing = portalData.quizQuestions.filter((question) => !new FormData(form).has(question.id));
    if (missing.length) {
      document.querySelector(`[name="${missing[0].id}"]`)?.closest(".quiz-question")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    renderQuizResult(scoreQuiz(form));
  });
  updateQuizProgress();
}

renderSubjectFilters();
renderSubjects();
renderInterestPlanner();
renderOutcomeControls();
renderOutcomes();
renderQuiz();
