const data = window.HK_ADMISSIONS_DATA || { programmes: [] };

const gradeOptions = [
  ["", "-"],
  ["7", "5**"],
  ["6", "5*"],
  ["5", "5"],
  ["4", "4"],
  ["3", "3"],
  ["2", "2"],
  ["1", "1"],
  ["0", "U"],
];

const electiveSubjectOptions = [
  ["", "先選科目"],
  ["biology", "Biology 生物"],
  ["chemistry", "Chemistry 化學"],
  ["physics", "Physics 物理"],
  ["ict", "ICT 資訊及通訊科技"],
  ["m1", "M1 微積分與統計"],
  ["m2", "M2 代數與微積分"],
  ["economics", "Economics 經濟"],
  ["bafs", "BAFS 企會財"],
  ["geography", "Geography 地理"],
  ["history", "History 歷史"],
  ["chineseHistory", "Chinese History 中史"],
  ["literature", "Literature 文學"],
  ["visualArts", "Visual Arts 視覺藝術"],
  ["tourism", "Tourism 旅款"],
  ["other", "Other 其他"],
];

const subjects = [
  { key: "chi", label: "中國語文" },
  { key: "eng", label: "英國語文" },
  { key: "math", label: "數學" },
  { key: "citizenship", label: "公民與社會發展", type: "citizenship" },
  { key: "x1", label: "選修科 1", type: "elective" },
  { key: "x2", label: "選修科 2", type: "elective" },
  { key: "x3", label: "選修科 3", type: "elective" },
  { key: "x4", label: "其他科目", type: "elective" },
];

const state = {
  scores: Object.fromEntries(subjects.map((subject) => [subject.key, ""])),
  electiveSubjects: Object.fromEntries(
    subjects.filter((subject) => subject.type === "elective").map((subject) => [subject.key, ""]),
  ),
  search: "",
  award: "",
  area: "",
  matchMode: "realistic",
  activeProfileId: "",
};

const storageKey = "hkAdmissionsScoreProfiles.v1";

const els = {
  subjectsGrid: document.querySelector("#subjectsGrid"),
  best5: document.querySelector("#best5"),
  best6: document.querySelector("#best6"),
  fourCoreTwoElectives: document.querySelector("#fourCoreTwoElectives"),
  cspeScore: document.querySelector("#cspeScore"),
  heroBest5: document.querySelector("#heroBest5"),
  heroBand: document.querySelector("#heroBand"),
  eligibilityBox: document.querySelector("#eligibilityBox"),
  searchInput: document.querySelector("#searchInput"),
  awardFilter: document.querySelector("#awardFilter"),
  areaFilter: document.querySelector("#areaFilter"),
  matchMode: document.querySelector("#matchMode"),
  resultCount: document.querySelector("#resultCount"),
  resultsList: document.querySelector("#resultsList"),
  resetScores: document.querySelector("#resetScores"),
  profileSelect: document.querySelector("#profileSelect"),
  profileName: document.querySelector("#profileName"),
  saveProfile: document.querySelector("#saveProfile"),
  deleteProfile: document.querySelector("#deleteProfile"),
};

function renderSubjects() {
  els.subjectsGrid.innerHTML = subjects
    .map((subject) => {
      const options =
        subject.type === "citizenship"
          ? [
              ["", "-"],
              ["A", "達標"],
              ["N", "未達標"],
            ]
          : gradeOptions;

      if (subject.type === "elective") {
        return `
        <div class="subject-row elective">
          <label>${subject.label}</label>
          <label>
            <span class="field-caption">科目</span>
            <select data-elective-subject="${subject.key}" aria-label="${subject.label} 科目">
              ${electiveSubjectOptions
                .map(([value, label]) => `<option value="${value}">${label}</option>`)
                .join("")}
            </select>
          </label>
          <label>
            <span class="field-caption">等級</span>
            <select id="${subject.key}" data-subject="${subject.key}" aria-label="${subject.label} 等級">
              ${gradeOptions
                .map(([value, label]) => `<option value="${value}">${label}</option>`)
                .join("")}
            </select>
          </label>
        </div>
      `;
      }

      return `
        <div class="subject-row">
          <label for="${subject.key}">${subject.label}</label>
          <select id="${subject.key}" data-subject="${subject.key}" aria-label="${subject.label}">
            ${options
              .map(([value, label]) => `<option value="${value}">${label}</option>`)
              .join("")}
          </select>
        </div>
      `;
    })
    .join("");

  els.subjectsGrid.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", (event) => {
      state.scores[event.target.dataset.subject] = event.target.value;
      update();
    });
  });
  els.subjectsGrid.querySelectorAll("[data-elective-subject]").forEach((select) => {
    select.addEventListener("change", (event) => {
      state.electiveSubjects[event.target.dataset.electiveSubject] = event.target.value;
      update();
    });
  });
}

function subjectEntries() {
  return Object.entries(state.scores)
    .filter(([key, value]) => key !== "citizenship" && value !== "")
    .filter(([key]) => !key.startsWith("x") || state.electiveSubjects[key])
    .map(([key, value]) => ({
      key,
      score: Number(value),
      subject: state.electiveSubjects[key] || key,
    }));
}

function scoreValues() {
  return subjectEntries().map((entry) => entry.score);
}

function topTotal(count) {
  return scoreValues()
    .sort((a, b) => b - a)
    .slice(0, count)
    .reduce((sum, value) => sum + value, 0);
}

function fourCoreTwoX() {
  const core = ["chi", "eng", "math"]
    .map((key) => Number(state.scores[key] || 0))
    .reduce((sum, value) => sum + value, 0);
  const electives = ["x1", "x2", "x3", "x4"]
    .filter((key) => state.electiveSubjects[key] && state.scores[key] !== "")
    .map((key) => Number(state.scores[key]))
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((sum, value) => sum + value, 0);
  return core + electives;
}

function enteredSubjectCount() {
  return scoreValues().length;
}

function hasLevel(key, min) {
  return Number(state.scores[key] || 0) >= min;
}

function selectedElectiveEntries() {
  return ["x1", "x2", "x3", "x4"]
    .filter((key) => state.electiveSubjects[key] && state.scores[key] !== "")
    .map((key) => ({
      key,
      subject: state.electiveSubjects[key],
      score: Number(state.scores[key]),
    }));
}

function incompleteElectives() {
  return ["x1", "x2", "x3", "x4"].filter(
    (key) => state.scores[key] !== "" && !state.electiveSubjects[key],
  );
}

function eligibility() {
  if (enteredSubjectCount() === 0 && !state.scores.citizenship) {
    return {
      tone: "neutral",
      title: "基本門檻檢查",
      body: "輸入成績後顯示。此檢查只作初步參考，實際要求以院校及課程官方資料為準。",
    };
  }

  const incomplete = incompleteElectives();
  const electiveWarning = incomplete.length
    ? `有 ${incomplete.length} 科選修只填了等級但未選科目，已不計入總分。`
    : "";
  const level2Count = scoreValues().filter((value) => value >= 2).length;
  const subDegreeLikely = hasLevel("chi", 2) && hasLevel("eng", 2) && level2Count >= 5;
  const degreeLikely =
    hasLevel("chi", 3) &&
    hasLevel("eng", 3) &&
    hasLevel("math", 2) &&
    state.scores.citizenship === "A" &&
    selectedElectiveEntries().some((entry) => entry.score >= 2);

  if (degreeLikely) {
    return {
      tone: "good",
      title: "初步符合本地學士課程常見基本門檻",
      body: ["仍要逐個課程檢查指定科目、加權公式、面試或作品集要求。", electiveWarning]
        .filter(Boolean)
        .join(" "),
    };
  }

  if (subDegreeLikely) {
    return {
      tone: "good",
      title: "初步符合副學位 / 高級文憑常見基本門檻",
      body: ["可優先比較 Associate Degree / Higher Diploma。學士課程通常仍要更高核心科要求。", electiveWarning]
        .filter(Boolean)
        .join(" "),
    };
  }

  return {
    tone: "warn",
    title: "可能未滿足常見基本門檻",
    body: ["建議先核對中文、英文、數學、公民科和指定科目要求；部分課程可能有替代安排或額外評核。", electiveWarning]
      .filter(Boolean)
      .join(" "),
  };
}

function matchProgramme(programme, score) {
  if (!score) {
    return { status: "unknown", label: "輸入分數後比較", delta: 0 };
  }

  const target = programme.averageScoreHigh;
  const delta = score - target;
  if (delta >= 2) return { status: "safe", label: "較穩陣", delta };
  if (delta >= -1) return { status: "match", label: "接近平均", delta };
  return { status: "reach", label: "挑戰", delta };
}

function modeAllows(status) {
  if (state.matchMode === "all") return true;
  if (state.matchMode === "safe") return status === "safe";
  if (state.matchMode === "reach") return true;
  return status === "safe" || status === "match";
}

function populateFilters() {
  const awards = [...new Set(data.programmes.map((p) => p.awardLevel).filter(Boolean))].sort();
  const areas = [...new Set(data.programmes.map((p) => p.areaOfStudy).filter(Boolean))].sort();

  els.awardFilter.innerHTML += awards
    .map((award) => `<option value="${escapeHtml(award)}">${escapeHtml(award)}</option>`)
    .join("");
  els.areaFilter.innerHTML += areas
    .map((area) => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`)
    .join("");
}

function loadProfiles() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(storageKey, JSON.stringify(profiles));
}

function renderProfiles() {
  const profiles = loadProfiles();
  els.profileSelect.innerHTML =
    `<option value="">未儲存</option>` +
    profiles
      .map((profile) => `<option value="${profile.id}">${escapeHtml(profile.name)}</option>`)
      .join("");
  els.profileSelect.value = state.activeProfileId;
}

function applyProfile(profile) {
  state.scores = { ...state.scores, ...(profile?.scores || {}) };
  state.electiveSubjects = { ...state.electiveSubjects, ...(profile?.electiveSubjects || {}) };
  state.activeProfileId = profile?.id || "";
  els.profileName.value = profile?.name || "";
  els.subjectsGrid.querySelectorAll("select").forEach((select) => {
    if (select.dataset.subject) select.value = state.scores[select.dataset.subject] || "";
    if (select.dataset.electiveSubject) {
      select.value = state.electiveSubjects[select.dataset.electiveSubject] || "";
    }
  });
  renderProfiles();
  update();
}

function renderEligibility() {
  const result = eligibility();
  const color = result.tone === "warn" ? "#b7791f" : result.tone === "good" ? "#247a42" : "#0f766e";
  els.eligibilityBox.style.borderLeftColor = color;
  els.eligibilityBox.innerHTML = `<strong>${escapeHtml(result.title)}</strong><p>${escapeHtml(result.body)}</p>`;
}

function renderResults() {
  const userScore = topTotal(5);
  const query = state.search.trim().toLowerCase();

  const rows = data.programmes
    .map((programme) => ({ programme, match: matchProgramme(programme, userScore) }))
    .filter(({ programme, match }) => {
      const searchable = `${programme.title} ${programme.institution} ${programme.areaOfStudy}`.toLowerCase();
      return (
        (!query || searchable.includes(query)) &&
        (!state.award || programme.awardLevel === state.award) &&
        (!state.area || programme.areaOfStudy === state.area) &&
        modeAllows(match.status)
      );
    })
    .sort((a, b) => {
      if (!userScore) return a.programme.averageScoreHigh - b.programme.averageScoreHigh;
      const aDistance = Math.abs(userScore - a.programme.averageScoreHigh);
      const bDistance = Math.abs(userScore - b.programme.averageScoreHigh);
      return aDistance - bDistance || a.programme.averageScoreHigh - b.programme.averageScoreHigh;
    })
    .slice(0, 80);

  els.resultCount.textContent = rows.length.toString();

  if (!rows.length) {
    els.resultsList.innerHTML = `<div class="empty-state">沒有符合條件的課程。試下放寬分數策略或清除搜尋字。</div>`;
    return;
  }

  els.resultsList.innerHTML = rows.map(({ programme, match }) => programmeCard(programme, match)).join("");
}

function programmeCard(programme, match) {
  const delta = topTotal(5) ? `${match.delta >= 0 ? "+" : ""}${match.delta.toFixed(1)}` : "N/A";
  const links = [
    programme.programmeUrl
      ? `<a href="${programme.programmeUrl}" target="_blank" rel="noreferrer">課程頁</a>`
      : "",
    programme.scoreSourceUrl
      ? `<a href="${programme.scoreSourceUrl}" target="_blank" rel="noreferrer">分數來源</a>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="programme-card">
      <header>
        <div>
          <h3>${escapeHtml(programme.title)}</h3>
          <p>${escapeHtml(programme.institution)}</p>
        </div>
        <span class="badge ${match.status}">${escapeHtml(match.label)}</span>
      </header>
      <div class="programme-meta">
        <span>${escapeHtml(programme.awardLevel)}</span>
        <span>${escapeHtml(programme.areaOfStudy)}</span>
        <span>Match reference: ${escapeHtml(programme.referenceScoreLabel || "Score")} ${escapeHtml(programme.averageScoreText)}</span>
        <span>差距: ${escapeHtml(delta)}</span>
        <span>Source status: ${escapeHtml(programme.sourceConfidence || "N/A")}</span>
      </div>
      ${scoreStatsTable(programme)}
      <p>${escapeHtml(programme.rawScoreText || "CSPE score row")}</p>
      <div class="programme-actions">${links}</div>
    </article>
  `;
}

function scoreStatsTable(programme) {
  const stats = programme.scoreStats || {};
  const rows = [
    ["Lower Quartile", stats.lowerQuartile],
    ["Median", stats.median],
    ["Mean", stats.mean],
    ["Upper Quartile", stats.upperQuartile],
    ["Highest", stats.highest],
    ["Lowest / Minimum admitted", stats.lowestOrMinimumAdmitted],
  ];

  return `
    <dl class="score-stats">
      ${rows
        .map(
          ([label, stat]) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(stat?.text || "N/A")}</dd>
            </div>
          `,
        )
        .join("")}
    </dl>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function update() {
  const best5 = topTotal(5);
  const best6 = topTotal(6);
  els.best5.textContent = best5.toString();
  els.best6.textContent = best6.toString();
  els.fourCoreTwoElectives.textContent = fourCoreTwoX().toString();
  els.cspeScore.textContent = best5.toString();
  els.heroBest5.textContent = best5.toString();
  els.heroBand.textContent = best5 ? `${best5} 分附近的可選課程` : "未輸入成績";
  renderEligibility();
  renderResults();
}

function bindControls() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderResults();
  });
  els.awardFilter.addEventListener("change", (event) => {
    state.award = event.target.value;
    renderResults();
  });
  els.areaFilter.addEventListener("change", (event) => {
    state.area = event.target.value;
    renderResults();
  });
  els.matchMode.addEventListener("change", (event) => {
    state.matchMode = event.target.value;
    renderResults();
  });
  els.resetScores.addEventListener("click", () => {
    state.scores = Object.fromEntries(subjects.map((subject) => [subject.key, ""]));
    state.electiveSubjects = Object.fromEntries(
      subjects.filter((subject) => subject.type === "elective").map((subject) => [subject.key, ""]),
    );
    state.activeProfileId = "";
    els.profileName.value = "";
    els.subjectsGrid.querySelectorAll("select").forEach((select) => {
      select.value = "";
    });
    renderProfiles();
    update();
  });
  els.profileSelect.addEventListener("change", (event) => {
    const profile = loadProfiles().find((item) => item.id === event.target.value);
    applyProfile(profile);
  });
  els.saveProfile.addEventListener("click", () => {
    const name = els.profileName.value.trim() || `Score profile ${new Date().toLocaleDateString()}`;
    const profiles = loadProfiles();
    const id = state.activeProfileId || `profile-${Date.now()}`;
    const next = {
      id,
      name,
      scores: { ...state.scores },
      electiveSubjects: { ...state.electiveSubjects },
      updatedAt: new Date().toISOString(),
    };
    const existingIndex = profiles.findIndex((profile) => profile.id === id);
    if (existingIndex >= 0) {
      profiles[existingIndex] = next;
    } else {
      profiles.push(next);
    }
    state.activeProfileId = id;
    saveProfiles(profiles);
    renderProfiles();
  });
  els.deleteProfile.addEventListener("click", () => {
    if (!state.activeProfileId) return;
    saveProfiles(loadProfiles().filter((profile) => profile.id !== state.activeProfileId));
    state.activeProfileId = "";
    els.profileName.value = "";
    renderProfiles();
  });
}

renderSubjects();
populateFilters();
renderProfiles();
bindControls();
update();
