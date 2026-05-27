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
  ["combinedScience", "Combined Science 組合科學"],
  ["integratedScience", "Integrated Science 綜合科學"],
  ["m1", "M1 微積分與統計"],
  ["m2", "M2 代數與微積分"],
  ["ict", "ICT 資訊及通訊科技"],
  ["dat", "Design and Applied Technology 設計與應用科技"],
  ["technologyAndLiving", "Technology and Living 科技與生活"],
  ["economics", "Economics 經濟"],
  ["bafs", "BAFS 企會財"],
  ["geography", "Geography 地理"],
  ["history", "History 歷史"],
  ["chineseHistory", "Chinese History 中史"],
  ["chineseLiterature", "Chinese Literature 中國文學"],
  ["literatureInEnglish", "Literature in English 英語文學"],
  ["ethicsAndReligiousStudies", "Ethics and Religious Studies 倫理與宗教"],
  ["healthManagementAndSocialCare", "Health Management and Social Care 健康管理與社會關懷"],
  ["tourismAndHospitalityStudies", "Tourism and Hospitality Studies 旅遊與款待"],
  ["visualArts", "Visual Arts 視覺藝術"],
  ["music", "Music 音樂"],
  ["physicalEducation", "Physical Education 體育"],
];

const coreSubjects = [
  { key: "chi", label: "中國語文" },
  { key: "eng", label: "英國語文" },
  { key: "math", label: "數學" },
  { key: "citizenship", label: "公民與社會發展", type: "citizenship" },
];

const maxElectives = 6;
const defaultElectiveCount = 2;

const state = {
  scores: {
    ...Object.fromEntries(coreSubjects.map((subject) => [subject.key, ""])),
    ...Object.fromEntries(Array.from({ length: defaultElectiveCount }, (_, index) => [`x${index + 1}`, ""])),
  },
  electiveSubjects: Object.fromEntries(
    Array.from({ length: defaultElectiveCount }, (_, index) => [`x${index + 1}`, ""]),
  ),
  search: "",
  award: "",
  category: "",
  institutions: [],
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
  categoryFilter: document.querySelector("#categoryFilter"),
  institutionFilter: document.querySelector("#institutionFilter"),
  matchMode: document.querySelector("#matchMode"),
  resultCount: document.querySelector("#resultCount"),
  resultsList: document.querySelector("#resultsList"),
  resetScores: document.querySelector("#resetScores"),
  profileSelect: document.querySelector("#profileSelect"),
  profileName: document.querySelector("#profileName"),
  saveProfile: document.querySelector("#saveProfile"),
  deleteProfile: document.querySelector("#deleteProfile"),
};

function electiveKeys() {
  return Object.keys(state.electiveSubjects).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
}

function allSubjects() {
  return [
    ...coreSubjects,
    ...electiveKeys().map((key, index) => ({
      key,
      label: `選修科 ${index + 1}`,
      type: "elective",
    })),
  ];
}

function renderSubjects() {
  els.subjectsGrid.innerHTML = allSubjects()
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
    .join("") +
    `<button class="add-subject-button" id="addSubject" type="button" ${electiveKeys().length >= maxElectives ? "disabled" : ""}>新增學科</button>`;

  els.subjectsGrid.querySelectorAll("[data-subject]").forEach((select) => {
    select.addEventListener("change", (event) => {
      state.scores[event.target.dataset.subject] = event.target.value;
      update();
    });
  });
  els.subjectsGrid.querySelectorAll("[data-elective-subject]").forEach((select) => {
    select.addEventListener("change", (event) => {
      state.electiveSubjects[event.target.dataset.electiveSubject] = event.target.value;
      syncSubjectControls();
      update();
    });
  });
  els.subjectsGrid.querySelector("#addSubject")?.addEventListener("click", addElectiveSubject);
  syncSubjectControls();
}

function syncSubjectControls() {
  const selectedElectives = new Set(Object.values(state.electiveSubjects).filter(Boolean));
  els.subjectsGrid.querySelectorAll("select").forEach((select) => {
    if (select.dataset.subject) select.value = state.scores[select.dataset.subject] || "";
    if (select.dataset.electiveSubject) {
      select.value = state.electiveSubjects[select.dataset.electiveSubject] || "";
      Array.from(select.options).forEach((option) => {
        option.disabled = Boolean(
          option.value &&
            option.value !== select.value &&
            selectedElectives.has(option.value),
        );
      });
    }
  });
}

function addElectiveSubject() {
  if (electiveKeys().length >= maxElectives) return;
  const nextNumber = electiveKeys().reduce((max, key) => Math.max(max, Number(key.slice(1))), 0) + 1;
  const key = `x${nextNumber}`;
  state.scores[key] = "";
  state.electiveSubjects[key] = "";
  renderSubjects();
  update();
}

function subjectEntries() {
  const rawEntries = Object.entries(state.scores)
    .filter(([key, value]) => key !== "citizenship" && value !== "")
    .filter(([key]) => !key.startsWith("x") || state.electiveSubjects[key])
    .map(([key, value]) => ({
      key,
      score: Number(value),
      subject: state.electiveSubjects[key] || key,
    }));
  const bestBySubject = new Map();
  rawEntries.forEach((entry) => {
    const current = bestBySubject.get(entry.subject);
    if (!current || entry.score > current.score) {
      bestBySubject.set(entry.subject, entry);
    }
  });
  return [...bestBySubject.values()];
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
  const electives = electiveKeys()
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
  return electiveKeys()
    .filter((key) => state.electiveSubjects[key] && state.scores[key] !== "")
    .map((key) => ({
      key,
      subject: state.electiveSubjects[key],
      score: Number(state.scores[key]),
    }));
}

function incompleteElectives() {
  return electiveKeys().filter(
    (key) =>
      (state.scores[key] !== "" && !state.electiveSubjects[key]) ||
      (state.scores[key] === "" && state.electiveSubjects[key]),
  );
}

function duplicateElectiveSubjects() {
  const counts = selectedElectiveEntries().reduce((acc, entry) => {
    acc[entry.subject] = (acc[entry.subject] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).filter((subject) => counts[subject] > 1);
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
    ? `有 ${incomplete.length} 科選修未同時填妥科目及等級，已不計入總分。`
    : "";
  const duplicates = duplicateElectiveSubjects();
  const duplicateWarning = duplicates.length
    ? `重複選修科只按最高一個等級計算：${duplicates.join(", ")}。`
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
      body: ["仍要逐個課程檢查指定科目、加權公式、面試或作品集要求。", electiveWarning, duplicateWarning]
        .filter(Boolean)
        .join(" "),
    };
  }

  if (subDegreeLikely) {
    return {
      tone: "good",
      title: "初步符合副學位 / 高級文憑常見基本門檻",
      body: ["可優先比較 Associate Degree / Higher Diploma。學士課程通常仍要更高核心科要求。", electiveWarning, duplicateWarning]
        .filter(Boolean)
        .join(" "),
    };
  }

  return {
    tone: "warn",
    title: "可能未滿足常見基本門檻",
    body: ["建議先核對中文、英文、數學、公民科和指定科目要求；部分課程可能有替代安排或額外評核。", electiveWarning, duplicateWarning]
      .filter(Boolean)
      .join(" "),
  };
}

function matchProgramme(programme, score) {
  if (programme.sourceSystem === "JUPAS") {
    return { status: "unknown", label: "JUPAS 公式參考", delta: 0 };
  }
  const target = programme.averageScoreHigh;
  if (!Number.isFinite(target)) {
    return { status: "unknown", label: "缺分數資料", delta: 0 };
  }
  if (!score) {
    return { status: "unknown", label: "輸入分數後比較", delta: 0 };
  }

  const delta = score - target;
  if (delta >= 2) return { status: "safe", label: "較穩陣", delta };
  if (delta >= -1) return { status: "match", label: "接近平均", delta };
  return { status: "reach", label: "挑戰", delta };
}

function modeAllows(status) {
  if (state.matchMode === "all") return true;
  if (status === "unknown") return state.matchMode !== "safe";
  if (state.matchMode === "safe") return status === "safe";
  if (state.matchMode === "reach") return true;
  return status === "safe" || status === "match";
}

function populateFilters() {
  const awardPriority = ["Bachelor's Degree", "Associate Degree", "Higher Diploma", "Not specified"];
  const awards = [...new Set(data.programmes.map((p) => p.awardLevel).filter(Boolean))].sort(
    (a, b) => awardPriority.indexOf(a) - awardPriority.indexOf(b) || a.localeCompare(b),
  );
  const categories = [...new Set(data.programmes.map((p) => p.detailedCategory || p.areaOfStudy).filter(Boolean))].sort();
  const institutions = [...new Set(data.programmes.map((p) => p.institution).filter(Boolean))].sort();

  els.awardFilter.innerHTML += awards
    .map((award) => `<option value="${escapeHtml(award)}">${escapeHtml(award)}</option>`)
    .join("");
  els.categoryFilter.innerHTML += categories
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");
  els.institutionFilter.innerHTML = institutions
    .map((institution) => `<option value="${escapeHtml(institution)}">${escapeHtml(institution)}</option>`)
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
  if (!Object.keys(state.electiveSubjects).length) {
    state.electiveSubjects = Object.fromEntries(
      Array.from({ length: defaultElectiveCount }, (_, index) => [`x${index + 1}`, ""]),
    );
  }
  state.activeProfileId = profile?.id || "";
  els.profileName.value = profile?.name || "";
  renderSubjects();
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
      const searchable =
        `${programme.title} ${programme.institution} ${programme.areaOfStudy} ${programme.detailedCategory}`.toLowerCase();
      return (
        (!query || searchable.includes(query)) &&
        (!state.award || programme.awardLevel === state.award) &&
        (!state.category || (programme.detailedCategory || programme.areaOfStudy) === state.category) &&
        (!state.institutions.length || state.institutions.includes(programme.institution)) &&
        modeAllows(match.status)
      );
    })
    .sort((a, b) => {
      const awardDelta = awardRank(a.programme.awardLevel) - awardRank(b.programme.awardLevel);
      if (awardDelta) return awardDelta;
      const aScore = Number.isFinite(a.programme.averageScoreHigh) ? a.programme.averageScoreHigh : Number.POSITIVE_INFINITY;
      const bScore = Number.isFinite(b.programme.averageScoreHigh) ? b.programme.averageScoreHigh : Number.POSITIVE_INFINITY;
      if (!userScore) return aScore - bScore;
      if (a.programme.sourceSystem !== b.programme.sourceSystem) {
        return a.programme.sourceSystem === "JUPAS" ? -1 : 1;
      }
      if (a.programme.sourceSystem === "JUPAS") return bScore - aScore;
      const aDistance = Math.abs(userScore - aScore);
      const bDistance = Math.abs(userScore - bScore);
      return aDistance - bDistance || aScore - bScore;
    })
    .slice(0, 80);

  els.resultCount.textContent = rows.length.toString();

  if (!rows.length) {
    els.resultsList.innerHTML = `<div class="empty-state">沒有符合條件的課程。試下放寬分數策略或清除搜尋字。</div>`;
    return;
  }

  els.resultsList.innerHTML = rows.map(({ programme, match }) => programmeCard(programme, match)).join("");
}

function awardRank(award) {
  if (award === "Bachelor's Degree") return 0;
  if (award === "Associate Degree") return 1;
  if (award === "Higher Diploma") return 2;
  return 3;
}

function programmeCard(programme, match) {
  const delta =
    programme.sourceSystem === "JUPAS" || !topTotal(5)
      ? "N/A"
      : `${match.delta >= 0 ? "+" : ""}${match.delta.toFixed(1)}`;
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
        <span>來源: ${escapeHtml(programme.sourceSystem || "N/A")}</span>
        ${programme.programmeCode ? `<span>編號: ${escapeHtml(programme.programmeCode)}</span>` : ""}
        <span>級別: ${escapeHtml(programme.awardLevel)}</span>
        <span>細分: ${escapeHtml(programme.detailedCategory || programme.areaOfStudy)}</span>
        <span>官方範疇: ${escapeHtml(programme.areaOfStudy)}</span>
        ${
          programme.averageScoreText
            ? `<span>比較基準: ${escapeHtml(programme.referenceScoreLabel || "Score")} ${escapeHtml(programme.averageScoreText)}</span>`
            : ""
        }
        <span>差距: ${escapeHtml(delta)}</span>
        <span>資料狀態: ${escapeHtml(sourceStatusLabel(programme.sourceConfidence))}</span>
      </div>
      ${programme.selectionFormula ? `<p><strong>Selection formula:</strong> ${escapeHtml(programme.selectionFormula)}</p>` : ""}
      ${scoreStatsTable(programme)}
      <p>${escapeHtml(programme.rawScoreText || "CSPE score row")}</p>
      <div class="programme-actions">${links}</div>
    </article>
  `;
}

function sourceStatusLabel(value) {
  if (value === "official_html_extracted_needs_review") return "官方來源抽取，待人工複核";
  if (value === "official_pdf_extracted_needs_review") return "官方 PDF 抽取，待人工複核";
  if (!value) return "N/A";
  return value;
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
  ].filter(([, stat]) => stat?.text);

  return `
    ${
      rows.length
        ? `<dl class="score-stats">
            ${rows
              .map(
                ([label, stat]) => `
                  <div>
                    <dt>${escapeHtml(label)}</dt>
                    <dd>${escapeHtml(stat.text)}</dd>
                  </div>
                `,
              )
              .join("")}
          </dl>`
        : ""
    }
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
  els.categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderResults();
  });
  els.institutionFilter.addEventListener("change", () => {
    state.institutions = Array.from(els.institutionFilter.selectedOptions).map((option) => option.value);
    renderResults();
  });
  els.matchMode.addEventListener("change", (event) => {
    state.matchMode = event.target.value;
    renderResults();
  });
  els.resetScores.addEventListener("click", () => {
    state.scores = {
      ...Object.fromEntries(coreSubjects.map((subject) => [subject.key, ""])),
      ...Object.fromEntries(Array.from({ length: defaultElectiveCount }, (_, index) => [`x${index + 1}`, ""])),
    };
    state.electiveSubjects = Object.fromEntries(
      Array.from({ length: defaultElectiveCount }, (_, index) => [`x${index + 1}`, ""]),
    );
    state.activeProfileId = "";
    els.profileName.value = "";
    renderSubjects();
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
