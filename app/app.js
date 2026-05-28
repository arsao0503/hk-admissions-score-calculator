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

const subjectLabels = {
  chi: "中國語文",
  eng: "英國語文",
  math: "數學",
  biology: "Biology 生物",
  chemistry: "Chemistry 化學",
  physics: "Physics 物理",
  combinedScience: "Combined Science 組合科學",
  integratedScience: "Integrated Science 綜合科學",
  m1: "M1 微積分與統計",
  m2: "M2 代數與微積分",
  ict: "ICT 資訊及通訊科技",
  dat: "Design and Applied Technology 設計與應用科技",
  technologyAndLiving: "Technology and Living 科技與生活",
  economics: "Economics 經濟",
  bafs: "BAFS 企會財",
  geography: "Geography 地理",
  history: "History 歷史",
  chineseHistory: "Chinese History 中史",
  chineseLiterature: "Chinese Literature 中國文學",
  literatureInEnglish: "Literature in English 英語文學",
  ethicsAndReligiousStudies: "Ethics and Religious Studies 倫理與宗教",
  healthManagementAndSocialCare: "Health Management and Social Care 健康管理與社會關懷",
  tourismAndHospitalityStudies: "Tourism and Hospitality Studies 旅遊與款待",
  visualArts: "Visual Arts 視覺藝術",
  music: "Music 音樂",
  physicalEducation: "Physical Education 體育",
};

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
  awards: [],
  categories: [],
  institutions: [],
  matchMode: "realistic",
  activeProfileId: "",
};

const storageKey = "hkAdmissionsScoreProfiles.v1";
const filterLabels = {
  awards: "課程級別",
  categories: "學科範疇",
  institutions: "院校",
};

const els = {
  subjectsGrid: document.querySelector("#subjectsGrid"),
  best5: document.querySelector("#best5"),
  best6: document.querySelector("#best6"),
  fourCoreTwoElectives: document.querySelector("#fourCoreTwoElectives"),
  cspeScore: document.querySelector("#cspeScore"),
  heroBest5: document.querySelector("#heroBest5"),
  heroBand: document.querySelector("#heroBand"),
  mobileBest5: document.querySelector("#mobileBest5"),
  mobileResultCount: document.querySelector("#mobileResultCount"),
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
          <div class="subject-row-title">
            <label>${subject.label}</label>
            <button class="icon-button remove-subject-button" type="button" data-remove-elective="${subject.key}" aria-label="刪除 ${subject.label}">×</button>
          </div>
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
  els.subjectsGrid.querySelectorAll("[data-remove-elective]").forEach((button) => {
    button.addEventListener("click", (event) => {
      removeElectiveSubject(event.currentTarget.dataset.removeElective);
    });
  });
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

function removeElectiveSubject(key) {
  delete state.scores[key];
  delete state.electiveSubjects[key];
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

function subjectKeyFromText(value) {
  const text = String(value || "").toLowerCase();
  const rules = [
    ["technologyAndLiving", ["technology and living"]],
    ["healthManagementAndSocialCare", ["health management"]],
    ["tourismAndHospitalityStudies", ["tourism and hospitality"]],
    ["literatureInEnglish", ["literature in english"]],
    ["chineseLiterature", ["chinese literature"]],
    ["chineseHistory", ["chinese history"]],
    ["ethicsAndReligiousStudies", ["ethics and religious"]],
    ["combinedScience", ["combined science"]],
    ["integratedScience", ["integrated science"]],
    ["bafs", ["business, accounting", "bafs"]],
    ["ict", ["information and communication technology", "ict"]],
    ["dat", ["design and applied technology"]],
    ["visualArts", ["visual arts"]],
    ["physicalEducation", ["physical education"]],
    ["chi", ["chinese language", "chinese"]],
    ["eng", ["english language", "english"]],
    ["m1", ["m1", "calculus and statistics"]],
    ["m2", ["m2", "algebra and calculus"]],
    ["math", ["mathematics", "math"]],
    ["biology", ["biology"]],
    ["chemistry", ["chemistry"]],
    ["physics", ["physics"]],
    ["economics", ["economics"]],
    ["geography", ["geography"]],
    ["history", ["history"]],
    ["music", ["music"]],
  ];
  return rules.find(([, terms]) => terms.some((term) => text.includes(term)))?.[0] || "";
}

function weightingSubjectsFromText(value) {
  const text = String(value || "").trim();
  if (/math(?:ematics)?\s*,\s*m1\s*\/\s*m2/i.test(text)) return ["Mathematics", "M1", "M2"];
  if (/m1\s*\/\s*m2|m1\s+or\s+m2/i.test(text)) return ["M1", "M2"];
  return text.split(/,|\bor\b/i).map((subject) => subject.trim()).filter(Boolean);
}

function parseWeightingText(text) {
  const entries = [];
  const pattern = /([^()•]+?)\s*\(x\s*([\d.]+)\)/gi;
  let match;
  while ((match = pattern.exec(String(text || "")))) {
    const value = Number(match[2]);
    if (!Number.isFinite(value)) continue;
    entries.push(
      ...weightingSubjectsFromText(match[1])
        .map((subject) => ({
          subject,
          subjectKey: subjectKeyFromText(subject),
          value,
          kind: "multiplier",
        })),
    );
  }
  return entries;
}

function programmeWeightings(programme) {
  if (Array.isArray(programme.subjectWeightings) && programme.subjectWeightings.length) {
    return programme.subjectWeightings;
  }
  return parseWeightingText(`${programme.subjectWeighting || ""} • ${programme.selectionFormula || ""}`);
}

function selectedWeightingEntries(programme) {
  const selectedKeys = new Set(subjectEntries().map((entry) => entry.subject));
  if (!selectedKeys.size) return [];
  const bestBySubject = new Map();
  programmeWeightings(programme)
    .filter((entry) => selectedKeys.has(entry.subjectKey))
    .forEach((entry) => {
      const current = bestBySubject.get(entry.subjectKey);
      if (!current || Number(entry.value) > Number(current.value)) {
        bestBySubject.set(entry.subjectKey, entry);
      }
    });
  return [...bestBySubject.values()];
}

function weightedProjection(programme) {
  const entries = subjectEntries();
  if (!entries.length) return null;
  const weightings = programmeWeightings(programme);
  if (!weightings.length) return null;

  const kind = weightings.some((item) => item.kind === "weight") ? "weight" : "multiplier";
  const explicitWeights = weightings
    .filter((item) => item.subjectKey)
    .map((item) => Number(item.value))
    .filter(Number.isFinite);
  const defaultValue =
    kind === "weight"
      ? Math.min(...explicitWeights, 5)
      : 1;
  const weightMap = new Map(
    weightings
      .filter((item) => item.subjectKey)
      .map((item) => [item.subjectKey, Number(item.value)]),
  );
  const calculated = entries.map((entry) => {
    const weight = Number.isFinite(weightMap.get(entry.subject)) ? weightMap.get(entry.subject) : defaultValue;
    return {
      ...entry,
      label: subjectLabels[entry.subject] || entry.subject,
      weight,
      weightedScore: entry.score * weight,
    };
  });
  const counted = calculated.sort((a, b) => b.weightedScore - a.weightedScore).slice(0, 5);
  return {
    kind,
    total: counted.reduce((sum, entry) => sum + entry.weightedScore, 0),
    counted,
  };
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
    const projection = weightedProjection(programme);
    const target = programme.averageScoreHigh;
    if (!projection || !Number.isFinite(target)) {
      return { status: "unknown", label: "只供參考", delta: 0, projection };
    }
    const delta = projection.total - target;
    const ratio = target ? delta / target : 0;
    if (ratio >= 0.05) return { status: "safe", label: "較穩陣", delta, projection };
    if (ratio >= -0.03) return { status: "match", label: "接近平均", delta, projection };
    return { status: "reach", label: "挑戰", delta, projection };
  }
  const target = programme.averageScoreHigh;
  if (!Number.isFinite(target)) {
    return { status: "unknown", label: "只供參考", delta: 0 };
  }
  if (!score) {
    return { status: "unknown", label: "只供參考", delta: 0 };
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

const awardPriority = ["Bachelor's Degree", "Associate Degree", "Higher Diploma", "Not specified"];

function awardSort(a, b) {
  const aIndex = awardPriority.indexOf(a);
  const bIndex = awardPriority.indexOf(b);
  return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex) || a.localeCompare(b);
}

function programmeCategory(programme) {
  return programme.detailedCategory || programme.areaOfStudy || "";
}

function selectedValues(select) {
  return Array.from(select.querySelectorAll("input[type='checkbox']:checked")).map((option) => option.value);
}

function renderMultiSelectOptions(container, options, selectedValues) {
  const availableValues = new Set(options);
  const validSelected = selectedValues.filter((value) => availableValues.has(value));
  const selectedSet = new Set(validSelected);
  const label = filterLabels[container.dataset.filter] || "Filter";
  const summary = validSelected.length ? `${validSelected.length} 已選` : "全部";
  const isOpen = container.classList.contains("open");
  container.innerHTML = `
    <button class="filter-trigger" type="button" aria-expanded="${isOpen ? "true" : "false"}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(summary)}</strong>
    </button>
    <div class="filter-panel">
      ${
        options.length
          ? options
              .map(
                (option) => `
                  <label class="check-option">
                    <input type="checkbox" value="${escapeHtml(option)}" ${selectedSet.has(option) ? "checked" : ""} />
                    <span>${escapeHtml(option)}</span>
                  </label>
                `,
              )
              .join("")
          : `<p class="filter-empty">沒有可選項</p>`
      }
    </div>
  `;
  return validSelected;
}

function programmePassesFilters(programme, match, excludeFilter = "") {
  const query = state.search.trim().toLowerCase();
  const searchable =
    `${programme.title} ${programme.institution} ${programme.areaOfStudy} ${programme.detailedCategory} ${programme.selectionFormula} ${programme.subjectWeighting}`.toLowerCase();

  return (
    (!query || searchable.includes(query)) &&
    (excludeFilter === "awards" || !state.awards.length || state.awards.includes(programme.awardLevel)) &&
    (excludeFilter === "categories" || !state.categories.length || state.categories.includes(programmeCategory(programme))) &&
    (excludeFilter === "institutions" ||
      !state.institutions.length ||
      state.institutions.includes(programme.institution)) &&
    modeAllows(match.status)
  );
}

function filteredRows(userScore, excludeFilter = "") {
  return data.programmes
    .map((programme) => ({ programme, match: matchProgramme(programme, userScore) }))
    .filter(({ programme, match }) => programmePassesFilters(programme, match, excludeFilter));
}

function uniqueOptions(rows, getter, sorter = (a, b) => a.localeCompare(b)) {
  return [...new Set(rows.map(({ programme }) => getter(programme)).filter(Boolean))].sort(sorter);
}

function updateFilterOptions(userScore) {
  const awardOptions = uniqueOptions(filteredRows(userScore, "awards"), (programme) => programme.awardLevel, awardSort);
  const categoryOptions = uniqueOptions(filteredRows(userScore, "categories"), programmeCategory);
  const institutionOptions = uniqueOptions(filteredRows(userScore, "institutions"), (programme) => programme.institution);

  state.awards = renderMultiSelectOptions(els.awardFilter, awardOptions, state.awards);
  state.categories = renderMultiSelectOptions(els.categoryFilter, categoryOptions, state.categories);
  state.institutions = renderMultiSelectOptions(els.institutionFilter, institutionOptions, state.institutions);
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
  updateFilterOptions(userScore);

  const rows = filteredRows(userScore)
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
  if (els.mobileResultCount) {
    els.mobileResultCount.textContent = rows.length.toString();
  }

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
    !Number.isFinite(match.delta) || (!topTotal(5) && !match.projection)
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
          match.projection
            ? `<span>Projection: ${escapeHtml(match.projection.total.toFixed(1))}</span>`
            : ""
        }
        ${
          programme.averageScoreText
            ? `<span>比較基準: ${escapeHtml(programme.referenceScoreLabel || "Score")} ${escapeHtml(programme.averageScoreText)}</span>`
            : ""
        }
        <span>差距: ${escapeHtml(delta)}</span>
        <span>資料狀態: ${escapeHtml(sourceStatusLabel(programme.sourceConfidence))}</span>
      </div>
      ${programme.selectionFormula ? `<p><strong>Selection formula / multiplier:</strong> ${escapeHtml(programme.selectionFormula)}</p>` : ""}
      ${weightingGrid(programme)}
      ${projectionGrid(match.projection)}
      ${scoreStatsTable(programme)}
      <p>${escapeHtml(programme.rawScoreText || "CSPE score row")}</p>
      <div class="programme-actions">${links}</div>
    </article>
  `;
}

function weightingGrid(programme) {
  const entries = selectedWeightingEntries(programme);
  if (!entries.length) return "";
  return `
    <section class="weighting-block">
      <div class="subsection-title">
        <strong>Subject multiplier / weighting</strong>
        ${
          programme.subjectWeightingSourceUrl
            ? `<a href="${programme.subjectWeightingSourceUrl}" target="_blank" rel="noreferrer">來源</a>`
            : ""
        }
      </div>
      <div class="weighting-grid">
        ${entries
          .map(
            (entry) => `
              <div>
                <dt>${escapeHtml(entry.subject)}</dt>
                <dd>${entry.kind === "weight" ? "Weight" : "x"} ${escapeHtml(Number(entry.value).toString())}</dd>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function projectionGrid(projection) {
  if (!projection) return "";
  return `
    <section class="projection-block">
      <div class="subsection-title">
        <strong>你的 weighted projection</strong>
        <span>${escapeHtml(projection.total.toFixed(1))}</span>
      </div>
      <div class="projection-grid">
        ${projection.counted
          .map(
            (entry) => `
              <div>
                <dt>${escapeHtml(entry.label)}</dt>
                <dd>${entry.score} × ${entry.weight} = ${entry.weightedScore.toFixed(1)}</dd>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
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
  if (els.mobileBest5) {
    els.mobileBest5.textContent = best5.toString();
  }
  renderEligibility();
  renderResults();
}

function bindControls() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderResults();
  });
  [els.awardFilter, els.categoryFilter, els.institutionFilter].forEach((filter) => {
    filter.addEventListener("click", (event) => {
      if (event.target.closest(".filter-trigger")) {
        filter.classList.toggle("open");
      }
    });
    filter.addEventListener("change", () => {
      state[filter.dataset.filter] = selectedValues(filter);
      filter.classList.add("open");
      renderResults();
    });
  });
  document.addEventListener("click", (event) => {
    [els.awardFilter, els.categoryFilter, els.institutionFilter].forEach((filter) => {
      if (!filter.contains(event.target)) filter.classList.remove("open");
    });
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
renderProfiles();
bindControls();
update();
