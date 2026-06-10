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
  programmeGroup: "ugcDegree",
  matchMode: "realistic",
  activeProfileId: "",
  interests: [],
};

const storageKey = "hkAdmissionsScoreProfiles.v1";
const filterLabels = {
  awards: "課程級別",
  categories: "學科範疇",
  institutions: "院校",
};

const ugcFundedInstitutions = new Set([
  "City University of Hong Kong",
  "Hong Kong Baptist University",
  "Lingnan University",
  "The Chinese University of Hong Kong",
  "The Education University of Hong Kong",
  "The Hong Kong Polytechnic University",
  "The Hong Kong University of Science and Technology",
  "The University of Hong Kong",
]);

const programmeGroups = [
  { id: "ugcDegree", label: "UGC funded 資助學位", description: "JUPAS 八大資助學士" },
  { id: "eappDegree", label: "E-APP 自資學位", description: "CSPE / iPASS 自資學士" },
  { id: "subDegree", label: "副學位 / 高級文憑", description: "AD / HD" },
  { id: "otherDegree", label: "其他學位", description: "非八大 JUPAS / 其他學士" },
  { id: "all", label: "全部課程", description: "不按來源分組" },
];

const interestOptions = [
  { id: "health", label: "醫療 / 生命科學", subjects: ["biology", "chemistry"], programmes: "醫療、生命科學、護理、食品與營養" },
  { id: "engineering", label: "工程 / 系統 / 解難", subjects: ["physics", "chemistry", "ict"], programmes: "工程、電腦、數據、建築環境" },
  { id: "business", label: "商業 / 金融 / 管理", subjects: ["economics", "bafs"], programmes: "工商管理、會計、金融、經濟" },
  { id: "people", label: "人群 / 社會 / 服務", subjects: ["geography", "biology", "economics"], programmes: "社會科學、教育、公共政策、健康服務" },
  { id: "creative", label: "設計 / 影像 / 創作", subjects: ["visualArts", "ict"], programmes: "設計、傳理、創意媒體、建築相關" },
  { id: "environment", label: "城市 / 環境 / 地理", subjects: ["geography", "biology", "chemistry"], programmes: "地理、環境科學、城市規劃、可持續發展" },
  { id: "data", label: "科技 / 數據 / AI", subjects: ["ict", "physics", "economics"], programmes: "電腦科學、數據科學、金融科技、資訊管理" },
  { id: "science", label: "實驗 / 理論 / 研究", subjects: ["biology", "chemistry", "physics"], programmes: "理學、科研、醫療相關、工程" },
];

const subjectGuides = [
  {
    key: "biology",
    name: "Biology 生物",
    category: "Science Education",
    summary: "研究生命系統、人體、遺傳、生態和生物科技，適合對醫療、生命科學和環境議題有興趣的學生。",
    assessment: "以公開試筆試為主，學校實驗和探究能力會影響日常學習表現。",
    skills: ["概念理解", "實驗推論", "資料分析"],
    programmes: ["醫療及健康", "生命科學", "環境科學", "食品與營養"],
    careers: ["醫療相關", "科研", "環境顧問", "教育"],
  },
  {
    key: "chemistry",
    name: "Chemistry 化學",
    category: "Science Education",
    summary: "學習物質結構、反應、能量、分析化學和有機化學，常見於醫療、工程和理科相關課程要求或加權。",
    assessment: "重視計算、化學概念、實驗設計和數據解讀。",
    skills: ["定量計算", "實驗設計", "微觀推理"],
    programmes: ["藥劑", "工程", "化學", "食品及材料"],
    careers: ["化驗", "製藥", "工程", "科研"],
  },
  {
    key: "physics",
    name: "Physics 物理",
    category: "Science Education",
    summary: "涵蓋力學、波、電磁、能量和現代物理，適合喜歡用數學和模型理解世界的學生。",
    assessment: "計算和概念題比重高，需要清楚表達推理步驟。",
    skills: ["數學建模", "系統思考", "問題拆解"],
    programmes: ["工程", "物理", "數據科學", "建築環境"],
    careers: ["工程", "科技", "研究", "教育"],
  },
  {
    key: "economics",
    name: "Economics 經濟",
    category: "Personal, Social and Humanities Education",
    summary: "理解市場、價格、資源分配、宏觀經濟和政策取捨，適合對商業、社會議題和金融有興趣的學生。",
    assessment: "需要概念應用、圖表分析和文字解釋。",
    skills: ["邏輯推論", "圖表閱讀", "政策分析"],
    programmes: ["經濟", "商業", "金融", "社會科學"],
    careers: ["金融", "分析", "政策研究", "商業管理"],
  },
  {
    key: "bafs",
    name: "BAFS 企會財",
    category: "Business Education",
    summary: "涵蓋企業、會計、財務和管理基礎，適合想了解公司運作、會計或商業決策的學生。",
    assessment: "會計單元重視程序和準確度，管理單元重視概念應用。",
    skills: ["財務理解", "商業分析", "決策表達"],
    programmes: ["會計", "工商管理", "金融", "市場學"],
    careers: ["會計", "銀行", "營運", "創業"],
  },
  {
    key: "ict",
    name: "ICT 資訊及通訊科技",
    category: "Technology Education",
    summary: "學習電腦系統、網絡、數據、程式和資訊社會議題，適合想接觸科技和數碼產品的學生。",
    assessment: "概念、應用和部分實作思維並重，不等於只學寫程式。",
    skills: ["系統理解", "數據處理", "運算思維"],
    programmes: ["電腦科學", "資訊系統", "數據科學", "金融科技"],
    careers: ["軟件", "數據", "IT 支援", "產品營運"],
  },
  {
    key: "geography",
    name: "Geography 地理",
    category: "Personal, Social and Humanities Education",
    summary: "連接自然環境、城市、人口、災害和可持續發展，適合喜歡地圖、現象分析和社會議題的學生。",
    assessment: "需要讀圖、資料回應、個案理解和長短題表達。",
    skills: ["空間思考", "資料解讀", "議題分析"],
    programmes: ["城市規劃", "環境", "社會科學", "旅遊"],
    careers: ["規劃", "環境顧問", "教育", "公共政策"],
  },
  {
    key: "visualArts",
    name: "Visual Arts 視覺藝術",
    category: "Arts Education",
    summary: "訓練視覺表達、藝術評賞、創作過程和作品集思維，適合對設計、影像和創意方向有興趣的學生。",
    assessment: "作品集和創作過程很重要，需要長期累積，不只是考試前溫習。",
    skills: ["視覺表達", "創意思考", "作品發展"],
    programmes: ["設計", "創意媒體", "建築相關", "藝術"],
    careers: ["設計", "影像", "品牌", "展覽與文化"],
  },
];

const graduateOutcomes = [
  { category: "Medicine, Dentistry and Health", salary: 540, label: "醫療、牙科及健康" },
  { category: "Education", salary: 362, label: "教育" },
  { category: "Social Sciences", salary: 300, label: "社會科學" },
  { category: "Sciences", salary: 292, label: "理學" },
  { category: "Business and Management", salary: 291, label: "商業及管理" },
  { category: "Engineering and Technology", salary: 288, label: "工程及科技" },
  { category: "Arts and Humanities", salary: 269, label: "文學及人文" },
];

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
  programmeGroupFilter: document.querySelector("#programmeGroupFilter"),
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
  interestOptions: document.querySelector("#interestOptions"),
  subjectRecommendations: document.querySelector("#subjectRecommendations"),
  subjectLibrary: document.querySelector("#subjectLibrary"),
  outcomeGrid: document.querySelector("#outcomeGrid"),
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
  const subjectControl = (subject) => {
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
      <div class="subject-row core">
        <label for="${subject.key}">${subject.label}</label>
        <select id="${subject.key}" data-subject="${subject.key}" aria-label="${subject.label}">
          ${options
            .map(([value, label]) => `<option value="${value}">${label}</option>`)
            .join("")}
        </select>
      </div>
    `;
  };

  const subjects = allSubjects();
  const coreControls = subjects.filter((subject) => subject.type !== "elective").map(subjectControl).join("");
  const electiveControls = subjects.filter((subject) => subject.type === "elective").map(subjectControl).join("");

  els.subjectsGrid.innerHTML = `
    <div class="core-subjects-grid">
      ${coreControls}
    </div>
    <div class="elective-subjects-section">
      <div class="elective-subjects-head">
        <strong>選修科</strong>
        <span>一科一個 column，可按需要新增至最多 ${maxElectives} 科。</span>
      </div>
      <div class="elective-columns">
        ${electiveControls}
      </div>
    </div>
    <button class="add-subject-button" id="addSubject" type="button" ${electiveKeys().length >= maxElectives ? "disabled" : ""}>新增學科</button>
  `;

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
    body: ["建議先核對中文、英文、數學、公民科和指定科目要求；如果未滿足副學位 / 高級文憑常見要求，可到升學路線頁查看 VTC Diploma of Foundation Studies，作為銜接 Higher Diploma 的本地後備。", electiveWarning, duplicateWarning]
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

function programmeGroupId(programme) {
  if (programme.awardLevel === "Bachelor's Degree" && programme.sourceSystem === "CSPE") return "eappDegree";
  if (
    programme.awardLevel === "Bachelor's Degree" &&
    programme.sourceSystem === "JUPAS" &&
    ugcFundedInstitutions.has(programme.institution)
  ) {
    return "ugcDegree";
  }
  if (programme.awardLevel === "Associate Degree" || programme.awardLevel === "Higher Diploma") return "subDegree";
  if (programme.awardLevel === "Bachelor's Degree") return "otherDegree";
  return "all";
}

function programmeGroupLabel(programme) {
  return programmeGroups.find((group) => group.id === programmeGroupId(programme))?.label || "其他課程";
}

function programmePassesGroup(programme) {
  return state.programmeGroup === "all" || programmeGroupId(programme) === state.programmeGroup;
}

function renderProgrammeGroupFilter() {
  if (!els.programmeGroupFilter) return;
  const rows = data.programmes || [];
  els.programmeGroupFilter.innerHTML = programmeGroups
    .map((group) => {
      const count =
        group.id === "all"
          ? rows.length
          : rows.filter((programme) => programmeGroupId(programme) === group.id).length;
      return `
        <button class="${state.programmeGroup === group.id ? "selected" : ""}" type="button" data-programme-group="${escapeHtml(group.id)}">
          <strong>${escapeHtml(group.label)}</strong>
          <span>${escapeHtml(group.description)} · ${count}</span>
        </button>
      `;
    })
    .join("");
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
    <span class="filter-label">${escapeHtml(label)}</span>
    <button class="filter-trigger" type="button" aria-expanded="${isOpen ? "true" : "false"}">
      <strong>${escapeHtml(summary)}</strong>
      <span aria-hidden="true">▾</span>
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
    programmePassesGroup(programme) &&
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
        <span>分類: ${escapeHtml(programmeGroupLabel(programme))}</span>
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

function renderInterestOptions() {
  if (!els.interestOptions) return;
  const selected = new Set(state.interests);
  els.interestOptions.innerHTML = interestOptions
    .map(
      (option) => `
        <button class="interest-chip ${selected.has(option.id) ? "selected" : ""}" type="button" data-interest="${option.id}">
          ${escapeHtml(option.label)}
        </button>
      `,
    )
    .join("");
}

function renderSubjectRecommendations() {
  if (!els.subjectRecommendations) return;
  const selectedInterests = interestOptions.filter((option) => state.interests.includes(option.id));
  const subjectScores = new Map();
  const programmeAreas = new Set();

  selectedInterests.forEach((interest) => {
    interest.subjects.forEach((subject, index) => {
      subjectScores.set(subject, (subjectScores.get(subject) || 0) + 3 - Math.min(index, 2));
    });
    programmeAreas.add(interest.programmes);
  });

  const recommendedSubjects = [...subjectScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([subject]) => subjectGuides.find((guide) => guide.key === subject))
    .filter(Boolean);

  if (!selectedInterests.length) {
    els.subjectRecommendations.innerHTML = `
      <div class="empty-state compact">先選擇幾個興趣方向，這裡會顯示相關高中科目、升學範疇和需要人工核對的地方。</div>
    `;
    return;
  }

  els.subjectRecommendations.innerHTML = `
    <div class="recommendation-summary">
      <span>${selectedInterests.length} 個興趣方向</span>
      <strong>建議先比較 ${recommendedSubjects.length} 個科目</strong>
      <p>這是探索式配對，不代表院校要求。真正報讀前仍要回到 programme card 檢查指定科目和 multiplier。</p>
    </div>
    <div class="recommendation-subjects">
      ${recommendedSubjects
        .map(
          (subject) => `
            <article>
              <h3>${escapeHtml(subject.name)}</h3>
              <p>${escapeHtml(subject.summary)}</p>
              <div>${subject.programmes.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="pathway-tags">
      ${[...programmeAreas].map((area) => `<span>${escapeHtml(area)}</span>`).join("")}
    </div>
  `;
}

function renderSubjectLibrary() {
  if (!els.subjectLibrary) return;
  els.subjectLibrary.innerHTML = subjectGuides
    .map(
      (subject) => `
        <article class="subject-card">
          <div>
            <span>${escapeHtml(subject.category)}</span>
            <h3>${escapeHtml(subject.name)}</h3>
          </div>
          <p>${escapeHtml(subject.summary)}</p>
          <dl>
            <div>
              <dt>評核 / 學習重點</dt>
              <dd>${escapeHtml(subject.assessment)}</dd>
            </div>
            <div>
              <dt>訓練能力</dt>
              <dd>${subject.skills.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</dd>
            </div>
            <div>
              <dt>相關方向</dt>
              <dd>${subject.careers.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</dd>
            </div>
          </dl>
        </article>
      `,
    )
    .join("");
}

function renderGraduateOutcomes() {
  if (!els.outcomeGrid) return;
  els.outcomeGrid.innerHTML = graduateOutcomes
    .map((item) => {
      const monthly = Math.round((item.salary * 1000) / 12 / 100) * 100;
      return `
        <article class="outcome-card">
          <span>UGC 2023/24 Undergraduate</span>
          <h3>${escapeHtml(item.label)}</h3>
          <strong>HK$${escapeHtml(item.salary)}k / 年</strong>
          <p>約 HK$${escapeHtml(monthly.toLocaleString("en-HK"))} / 月。只包括全職就業畢業生，按 broad academic programme category 統計。</p>
        </article>
      `;
    })
    .join("");
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
  els.interestOptions?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-interest]");
    if (!button) return;
    const interest = button.dataset.interest;
    state.interests = state.interests.includes(interest)
      ? state.interests.filter((item) => item !== interest)
      : [...state.interests, interest].slice(-4);
    renderInterestOptions();
    renderSubjectRecommendations();
  });
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderResults();
  });
  els.programmeGroupFilter?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-programme-group]");
    if (!button) return;
    state.programmeGroup = button.dataset.programmeGroup;
    state.awards = [];
    state.categories = [];
    state.institutions = [];
    renderProgrammeGroupFilter();
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
renderProgrammeGroupFilter();
renderInterestOptions();
renderSubjectRecommendations();
renderSubjectLibrary();
renderGraduateOutcomes();
bindControls();
update();
