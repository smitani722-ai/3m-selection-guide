import {
  getSingleSidedTapeOptions,
  hasOnlyOneDisplayableSingleSidedTapeOption,
  isSingleSidedTapeQuestion,
} from "./singleSidedTapeLogic";

export interface QuestionOption {
  value: string;
  label: string;
  icon?: string;
  help?: string;
}

export interface Question {
  id: string;
  step: number;
  text: string;
  subtext?: string;
  type: "single" | "multi" | "boolean";
  options: QuestionOption[];
  criteriaKey: string;
}

type AnswerValue = string | string[] | boolean | undefined;
type AnswerRecord = Record<string, AnswerValue>;

function answerList(value: AnswerValue): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

function includesAny(values: string[], keywords: string[]): boolean {
  return values.some((value) => keywords.some((keyword) => value.includes(keyword)));
}

export function shouldShowPermanentQuestion(answers: AnswerRecord): boolean {
  const category = answers.category;
  const application = answerList(answers.application);
  const features = answerList(answers.features);
  const selectedValues = [...application, ...features];

  if (category !== "両面テープ") return false;
  if (isSiliconeRoute(answers)) return false;

  const hasRemovableRoute = includesAny(selectedValues, [
    "再剥離",
    "仮固定",
    "片側弱接着",
    "弱粘着",
    "再利用",
    "繰り返し",
    "貼り替え",
    "リワーク",
    "剥がしやすさ",
  ]);

  if (!hasRemovableRoute) return false;

  const isPermanentRoute =
    application.includes("固定") ||
    includesAny(selectedValues, [
      "構造接合",
      "高接着",
      "VHB",
      "超高強度",
      "高保持力",
    ]);

  return !isPermanentRoute;
}

export function shouldShowQuestion(question: Question, answers: AnswerRecord): boolean {
  if (question.id === "category") return true;
  if (answers.category === "片面テープ") {
    if (hasOnlyOneDisplayableSingleSidedTapeOption(question.id, answers as Record<string, string>)) return false;
    return isSingleSidedTapeQuestion(question.id);
  }
  if (isSingleSidedTapeQuestion(question.id)) return false;
  if (question.id === "permanent") return shouldShowPermanentQuestion(answers);
  return true;
}

function isHighAdhesionRoute(answers: AnswerRecord): boolean {
  const application = answerList(answers.application);
  const features = answerList(answers.features);
  const selectedValues = [...application, ...features];

  return (
    application.includes("固定") &&
    includesAny(selectedValues, ["高接着", "VHB", "構造接合", "超高強度", "高保持力"])
  );
}

function isSiliconeRoute(answers: AnswerRecord): boolean {
  const selectedValues = [
    ...answerList(answers.substrateA),
    ...answerList(answers.substrateB),
    ...answerList(answers.features),
  ];

  return includesAny(selectedValues, ["シリコン", "シリコンゴム", "シリコン接着"]);
}

function isLowVocRoute(answers: AnswerRecord): boolean {
  return includesAny(answerList(answers.features), ["低VOC", "低アウトガス"]);
}

function isFlexibleRoute(answers: AnswerRecord): boolean {
  return includesAny(answerList(answers.features), ["柔軟", "弾性"]);
}

export function shouldShowOption(question: Question, option: QuestionOption, answers: AnswerRecord): boolean {
  if (question.id === "thickness" && option.value === "極薄" && isHighAdhesionRoute(answers)) {
    return false;
  }

  if (question.id === "thickness" && option.value === "極薄" && isLowVocRoute(answers)) {
    return false;
  }

  if (question.id === "thickness" && ["極薄", "0.1mm"].includes(option.value) && isFlexibleRoute(answers)) {
    return false;
  }

  if (question.id === "thickness" && option.value === "1mm以上" && isSiliconeRoute(answers)) {
    return false;
  }

  return true;
}

export function getVisibleOptions(question: Question, answers: AnswerRecord): QuestionOption[] {
  if (answers.category === "片面テープ" && isSingleSidedTapeQuestion(question.id)) {
    return getSingleSidedTapeOptions(question.id, answers as Record<string, string>);
  }

  return question.options.filter((option) => shouldShowOption(question, option, answers));
}

export function getVisibleQuestions(answers: AnswerRecord): Question[] {
  return questions.filter((question) => shouldShowQuestion(question, answers));
}

export const questions: Question[] = [
  {
    id: "category",
    step: 1,
    text: "何を選定したいですか？",
    subtext: "製品カテゴリを選択してください",
    type: "single",
    criteriaKey: "category",
    options: [
      { value: "両面テープ", label: "両面テープ", icon: "🔲" },
      { value: "接着剤", label: "接着剤", icon: "💉" },
      {
        value: "ファスナー",
        label: "ファスナー（Dual Lock / Hook&Loop）",
        icon: "🔗",
        help: "Dual Lockは、繰り返し着脱できる高保持力ファスナーです。",
      },
      { value: "片面テープ", label: "片面テープ", icon: "📏" },
    ],
  },
  {
    id: "application",
    step: 2,
    text: "主な用途は何ですか？",
    subtext: "複数選択可能",
    type: "multi",
    criteriaKey: "application",
    options: [
      { value: "固定", label: "固定・接合" },
      { value: "再剥離", label: "再剥離", help: "貼った後に剥がす予定がある用途です。糊ごと再利用する意味ではありません。" },
      { value: "仮固定", label: "仮固定" },
      { value: "防水", label: "防水・シール" },
      { value: "防振", label: "防振・衝撃吸収" },
      { value: "耐熱", label: "耐熱用途" },
      { value: "絶縁", label: "電気絶縁" },
      { value: "マーキング", label: "マーキング" },
      { value: "補強", label: "補強" },
      { value: "着脱", label: "着脱・脱着" },
    ],
  },
  {
    id: "singleTapeUse",
    step: 2,
    text: "片面テープの用途は何ですか？",
    subtext: "ExcelマスターのQ2用途から選択してください",
    type: "single",
    criteriaKey: "singleTapeUse",
    options: [],
  },
  {
    id: "singleTapeSubUse",
    step: 3,
    text: "何業界向けですか？",
    subtext: "前の回答に応じて候補を絞り込みます",
    type: "single",
    criteriaKey: "singleTapeSubUse",
    options: [],
  },
  {
    id: "singleTapeWork",
    step: 4,
    text: "施工部位はどこですか？",
    subtext: "実際の施工部位を選択してください",
    type: "single",
    criteriaKey: "singleTapeWork",
    options: [],
  },
  {
    id: "singleTapePerformance1",
    step: 5,
    text: "必要性能①は何ですか？",
    subtext: "重視する条件を選択してください",
    type: "single",
    criteriaKey: "singleTapePerformance1",
    options: [],
  },
  {
    id: "singleTapePerformance2",
    step: 6,
    text: "必要性能②は何ですか？",
    subtext: "追加条件がなければ「指定なし」を選択してください",
    type: "single",
    criteriaKey: "singleTapePerformance2",
    options: [],
  },
  {
    id: "substrateA",
    step: 3,
    text: "被着体A（一方の素材）は何ですか？",
    subtext: "接着する素材を1つ選んでください",
    type: "single",
    criteriaKey: "substrateA",
    options: [
      { value: "SUS", label: "SUS（ステンレス）" },
      { value: "アルミ", label: "アルミ" },
      { value: "鉄", label: "鉄・スチール" },
      { value: "ガラス", label: "ガラス" },
      { value: "ABS", label: "ABS樹脂" },
      { value: "PC", label: "PC（ポリカーボネート）" },
      { value: "PP", label: "PP（ポリプロピレン）" },
      { value: "PE", label: "PE（ポリエチレン）" },
      { value: "ナイロン", label: "ナイロン・POM・PBT" },
      { value: "EPDM", label: "EPDM・ゴム" },
      { value: "シリコン", label: "シリコン・シリコンゴム" },
      { value: "木材", label: "木材" },
      { value: "コンクリート", label: "コンクリート・モルタル" },
      { value: "塗装面", label: "塗装面" },
    ],
  },
  {
    id: "substrateB",
    step: 4,
    text: "被着体B（もう一方の素材）は何ですか？",
    subtext: "もう一方の被着体を選択（同じ素材でも可）",
    type: "single",
    criteriaKey: "substrateB",
    options: [
      { value: "SUS", label: "SUS（ステンレス）" },
      { value: "アルミ", label: "アルミ" },
      { value: "鉄", label: "鉄・スチール" },
      { value: "ガラス", label: "ガラス" },
      { value: "ABS", label: "ABS樹脂" },
      { value: "PC", label: "PC（ポリカーボネート）" },
      { value: "PP", label: "PP（ポリプロピレン）" },
      { value: "PE", label: "PE（ポリエチレン）" },
      { value: "ナイロン", label: "ナイロン・POM・PBT" },
      { value: "EPDM", label: "EPDM・ゴム" },
      { value: "シリコン", label: "シリコン・シリコンゴム" },
      { value: "木材", label: "木材" },
      { value: "コンクリート", label: "コンクリート・モルタル" },
      { value: "塗装面", label: "塗装面" },
    ],
  },
  {
    id: "environment",
    step: 5,
    text: "使用環境は？",
    subtext: "複数選択可能",
    type: "multi",
    criteriaKey: "environment",
    options: [
      { value: "屋内", label: "屋内" },
      { value: "屋外", label: "屋外" },
      { value: "高温", label: "高温（80°C以上）" },
      { value: "超高温", label: "超高温（200°C以上）" },
      { value: "低温", label: "低温（0°C以下）" },
      { value: "湿気", label: "湿気・水" },
      { value: "薬品", label: "薬品・溶剤" },
      { value: "油", label: "油" },
      { value: "振動", label: "振動・衝撃" },
    ],
  },
  {
    id: "features",
    step: 6,
    text: "必要な特性は？",
    subtext: "複数選択可能",
    type: "multi",
    criteriaKey: "features",
    options: [
      { value: "高接着", label: "高接着力" },
      { value: "再剥離", label: "再剥離", help: "後工程やメンテナンスで剥がす可能性がある用途です。" },
      { value: "高耐熱", label: "高耐熱" },
      { value: "低VOC", label: "低VOC・低アウトガス", help: "においや揮発成分を抑えたい電子機器・車載・光学用途向けの条件です。" },
      { value: "LSE対応", label: "LSE対応（PP・PE等難接着材）", help: "PP・PE・TPOなど、通常の粘着剤が付きにくい素材への対応です。" },
      { value: "透明", label: "透明" },
      { value: "柔軟", label: "柔軟・弾性" },
      { value: "高保持力", label: "高保持力（ズレ防止）", help: "Dual Lockなどで、外れにくさやズレにくさを重視する条件です。" },
      { value: "難接着材対応", label: "難接着材対応" },
      { value: "シリコン接着", label: "シリコン素材接着" },
    ],
  },
  {
    id: "thickness",
    step: 7,
    text: "厚み要求は？",
    type: "single",
    criteriaKey: "thickness",
    options: [
      { value: "極薄", label: "極薄（0.1mm以下）" },
      { value: "0.1mm", label: "薄手（0.1〜0.3mm）" },
      { value: "0.5mm", label: "中程度（0.3〜1mm）" },
      { value: "1mm以上", label: "厚手（1mm以上）" },
      { value: "指定なし", label: "指定なし" },
    ],
  },
  {
    id: "permanent",
    step: 8,
    text: "恒久固定ですか？",
    subtext: "後で剥がす予定がない場合は「はい」を選択",
    type: "boolean",
    criteriaKey: "permanent",
    options: [
      { value: "true", label: "はい（剥がさない）" },
      { value: "false", label: "いいえ（再剥離・着脱あり）" },
    ],
  },
  {
    id: "priceSensitive",
    step: 9,
    text: "価格重視ですか？",
    subtext: "コストを優先する場合は「はい」を選択",
    type: "boolean",
    criteriaKey: "priceSensitive",
    options: [
      { value: "false", label: "いいえ（性能優先）" },
      { value: "true", label: "はい（コスト重視）" },
    ],
  },
];

export const TOTAL_STEPS = questions.length;
