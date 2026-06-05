const portalData = window.DSE_PORTAL_DATA || { subjects: [], interestTags: [], salaryOutcomes: [], sources: {} };
const quizState = {
  currentIndex: 0,
  answers: {},
};

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
        ${levels.map((level) => `<option value="${h(level)}" ${level === "學士 Undergraduate" ? "selected" : ""}>${h(level)}</option>`).join("")}
      </select>
    </label>
  `;
  container.addEventListener("change", renderOutcomes);
}

function renderOutcomes() {
  const container = document.querySelector("#outcomeRows");
  if (!container) return;
  const level = document.querySelector("#outcomeLevel")?.value || "學士 Undergraduate";
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
          <p>約 HK$${h(monthly.toLocaleString("en-HK"))} / 月。UGC broad academic programme category，只包括全職就業畢業生。</p>
          <div class="career-title-list">
            ${(row.careers || []).map((career) => `<span>${h(career)}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderVtcProgrammes() {
  const container = document.querySelector("#vtcProgrammes");
  if (!container) return;
  container.innerHTML = (portalData.vtcProgrammes || [])
    .map(
      (programme) => `
        <article class="vtc-programme-card">
          <div>
            <span class="record-code">${h(programme.code)}</span>
            <h3>${h(programme.title)}</h3>
            <p>${h(programme.articulation)}</p>
          </div>
          <dl>
            <div><dt>上課地點</dt><dd>${h(programme.campus)}</dd></div>
            <div><dt>資料來源</dt><dd>VTC 2026 admission programme listing</dd></div>
          </dl>
          <a href="${h(programme.link)}" target="_blank" rel="noreferrer">查看課程頁</a>
        </article>
      `,
    )
    .join("");
}

function renderOverseasRoutes() {
  const container = document.querySelector("#overseasRoutes");
  if (!container) return;
  const flags = { uk: "🇬🇧", au: "🇦🇺", ca: "🇨🇦", tw: "🇹🇼", cn: "🇨🇳" };
  container.innerHTML = (portalData.overseasRoutes || [])
    .map(
      (route) => `
        <article class="overseas-row">
          <div class="country-visual" aria-hidden="true">
            <span>${flags[route.visual] || "✈️"}</span>
            <i>${h(route.destination.split(" ")[0])}</i>
          </div>
          <div class="overseas-content">
            <header>
              <p class="eyebrow">Destination</p>
              <h2>${h(route.destination)}</h2>
              <p>${h(route.note)}</p>
            </header>
            <div class="overseas-facts">
              <section><h3>提供課程的學府</h3><p>${h(route.institutions)}</p></section>
              <section><h3>招生 / 申請時間</h3><p>${h(route.intake)}</p></section>
              <section><h3>簽證 / 入境準備</h3><p>${h(route.visa)}</p></section>
              <section><h3>住宿安排</h3><p>${h(route.accommodation)}</p></section>
              <section><h3>學費區間</h3><p>${h(route.tuition)}</p></section>
              <section><h3>生活費區間</h3><p>${h(route.living)}</p></section>
            </div>
            <div class="timeline-card">
              <h3>準備時間線</h3>
              <ol>${(route.checklist || []).map((item) => `<li>${h(item)}</li>`).join("")}</ol>
            </div>
            <div class="source-links inline-sources">
              ${(route.sources || []).map(([label, url]) => `<a href="${h(url)}" target="_blank" rel="noreferrer">${h(label)}</a>`).join("")}
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function scoreQuiz(answers) {
  const totals = Object.fromEntries(portalData.interestTags.map((interest) => [interest.id, 0]));

  portalData.quizQuestions.forEach((question) => {
    const selected = Number(answers[question.id]);
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

function buildQuizResultModel(totals) {
  const ranked = Object.entries(totals)
    .map(([id, score]) => ({
      ...(portalData.interestTags.find((interest) => interest.id === id) || { id, label: id, description: "" }),
      score,
    }))
    .sort((a, b) => b.score - a.score);
  const topInterests = ranked.filter((item) => item.score > 0).slice(0, 3);
  const topInterestIds = topInterests.map((item) => item.id);
  const recommendations = portalData.subjects
    .map((subject) => ({ ...subject, matchScore: subjectScore(subject, topInterestIds) }))
    .filter((subject) => subject.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || a.name.localeCompare(b.name))
    .slice(0, 10);
  return { ranked, topInterests, recommendations, generatedAt: new Date().toISOString() };
}

function renderQuizResultContent(container, model) {
  if (!container) return;
  const ranked = model.ranked || [];
  const topInterests = model.topInterests || [];
  const recommendations = model.recommendations || [];
  const maxScore = Math.max(...ranked.map((item) => item.score), 1);

  if (!ranked.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>未有測驗結果</h2>
        <p>請先完成性向測試，系統會把答案儲存在本機瀏覽器，再帶你來到這一頁。</p>
        <a class="primary-button" href="./quiz.html#start">開始測驗</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="result-layout">
      <aside class="result-sidebar" aria-label="興趣 meta tags 摘要">
        <p class="eyebrow">Meta tags</p>
        <h2>你的前三個方向</h2>
        <div class="result-tag-stack">
          ${topInterests
            .map(
              (interest, index) => `
                <article>
                  <span>0${index + 1}</span>
                  <h3>${h(interest.label)}</h3>
                  <p>${h(interest.description)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
        <div class="result-actions">
          <a class="primary-button" href="./calculator.html">下一步：計算 DSE 成績</a>
          <a class="ghost-button" href="./quiz.html#start">重新作答</a>
        </div>
      </aside>

      <section class="result-main">
        <div class="section-head">
          <div>
            <p class="eyebrow">Score profile</p>
            <h2>各興趣方向得分</h2>
          </div>
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
          <div class="section-head compact-head">
            <div>
              <p class="eyebrow">Subject match</p>
              <h2>可以優先比較的科目</h2>
            </div>
          </div>
          <div class="recommendation-grid">
            ${recommendations
              .map(
                (subject) => `
                  <article>
                    <span>${h(subject.kla)}</span>
                    <h3>${h(subject.name)}</h3>
                    <p>${h(subject.scope)}</p>
                    <div class="tag-row">${(subject.pathways || []).slice(0, 4).map((pathway) => `<span>${h(pathway)}</span>`).join("")}</div>
                    <a href="./subjects.html">查看科目資料庫</a>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>

        <section class="quiz-next-steps database-card">
          <h2>建議流程</h2>
          <ol>
            <li>保留這 3 個 meta tags，去計分器輸入 predicted / actual DSE 成績。</li>
            <li>用分數先篩出可報讀課程，再回到科目資料庫查指定科目、能力要求和課程方向。</li>
            <li>如果學士 / 副學位門檻未穩，查看本地後備；如果香港路徑不合適，再比較海外升學。</li>
          </ol>
        </section>
      </section>
    </div>
  `;
}

function renderQuizResult(totals) {
  const model = buildQuizResultModel(totals);
  localStorage.setItem("dseAptitudeResult.v1", JSON.stringify(model));
  window.location.href = "./result.html";
}

function renderStoredQuizResult() {
  const container = document.querySelector("#quizResultPage");
  if (!container) return;
  try {
    const model = JSON.parse(localStorage.getItem("dseAptitudeResult.v1") || "null");
    renderQuizResultContent(container, model || {});
  } catch {
    renderQuizResultContent(container, {});
  }
}

function updateQuizProgress() {
  const progress = document.querySelector("#quizProgress");
  if (!progress) return;
  const answeredCount = Object.keys(quizState.answers).length;
  const total = portalData.quizQuestions.length;
  progress.innerHTML = `
    <strong>${answeredCount} / ${total}</strong>
    <span>${answeredCount === total ? "可以查看結果" : `第 ${quizState.currentIndex + 1} 題`}</span>
  `;
}

function renderQuizQuestion() {
  const form = document.querySelector("#quizForm");
  if (!form) return;
  const total = portalData.quizQuestions.length;
  const question = portalData.quizQuestions[quizState.currentIndex];
  if (!question) return;
  const selectedAnswer = quizState.answers[question.id];
  const isFirst = quizState.currentIndex === 0;
  const isLast = quizState.currentIndex === total - 1;

  form.innerHTML = `
    <div class="quiz-progress" id="quizProgress" aria-live="polite"></div>
    <fieldset class="quiz-question">
      <legend>
        <span>${String(quizState.currentIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
        ${h(question.text)}
      </legend>
      <div class="choice-grid">
        ${question.choices
          .map(
            (choice, choiceIndex) => `
              <label class="choice-option">
                <input type="radio" name="${h(question.id)}" value="${choiceIndex}" ${String(selectedAnswer) === String(choiceIndex) ? "checked" : ""} required />
                <span>${h(choice.label)}</span>
              </label>
            `,
          )
          .join("")}
      </div>
    </fieldset>
    <div class="quiz-actions">
      <button class="ghost-button" type="button" id="quizBack" ${isFirst ? "disabled" : ""}>上一題</button>
      <button class="primary-button" type="submit">${isLast ? "查看我的學科傾向" : "下一題"}</button>
    </div>
  `;
  updateQuizProgress();
}

function renderQuiz() {
  const form = document.querySelector("#quizForm");
  if (!form) return;
  const intro = document.querySelector(".quiz-intro");
  const startButton = document.querySelector("#startQuiz");

  function startQuiz() {
    quizState.currentIndex = 0;
    quizState.answers = {};
    if (intro) intro.hidden = true;
    form.hidden = false;
    const result = document.querySelector("#quizResult");
    if (result) result.hidden = true;
    renderQuizQuestion();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (startButton) {
    form.hidden = true;
    startButton.addEventListener("click", startQuiz);
    if (window.location.hash === "#start") startQuiz();
  } else {
    renderQuizQuestion();
  }

  form.addEventListener("change", () => {
    const question = portalData.quizQuestions[quizState.currentIndex];
    const answer = new FormData(form).get(question.id);
    if (answer !== null) quizState.answers[question.id] = answer;
    updateQuizProgress();
  });
  form.addEventListener("reset", () => {
    quizState.currentIndex = 0;
    quizState.answers = {};
    setTimeout(updateQuizProgress, 0);
    const result = document.querySelector("#quizResult");
    if (result) result.hidden = true;
    if (intro) intro.hidden = true;
    form.hidden = false;
    renderQuizQuestion();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = portalData.quizQuestions[quizState.currentIndex];
    const answer = new FormData(form).get(question.id);
    if (answer === null) {
      form.querySelector(".quiz-question")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    quizState.answers[question.id] = answer;
    if (quizState.currentIndex < portalData.quizQuestions.length - 1) {
      quizState.currentIndex += 1;
      renderQuizQuestion();
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    renderQuizResult(scoreQuiz(quizState.answers));
  });
  form.addEventListener("click", (event) => {
    if (event.target.closest("#quizBack")) {
      quizState.currentIndex = Math.max(0, quizState.currentIndex - 1);
      renderQuizQuestion();
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

renderSubjectFilters();
renderSubjects();
renderInterestPlanner();
renderOutcomeControls();
renderOutcomes();
renderVtcProgrammes();
renderOverseasRoutes();
renderQuiz();
renderStoredQuizResult();
