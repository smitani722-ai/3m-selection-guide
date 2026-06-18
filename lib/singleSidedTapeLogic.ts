import routesData from "@/data/singleSidedTapeRoutes.json";
import type { Product, SelectionCriteria } from "./selectionEngine";

export interface SingleSidedTapeRoute {
  no: number;
  use: string;
  subUse: string;
  work: string;
  performance1: string;
  performance2: string;
  productId: string;
  alternativeIds?: string[];
  reason: string;
}

export interface SingleSidedTapeAnswers {
  category?: string;
  singleTapeUse?: string;
  singleTapeSubUse?: string;
  singleTapeWork?: string;
  singleTapePerformance1?: string;
  singleTapePerformance2?: string;
}

export const singleSidedTapeRoutes = routesData as SingleSidedTapeRoute[];

export const SINGLE_SIDED_TAPE_QUESTION_IDS = [
  "singleTapeUse",
  "singleTapeSubUse",
  "singleTapeWork",
  "singleTapePerformance1",
  "singleTapePerformance2",
] as const;

type SingleSidedTapeQuestionId = (typeof SINGLE_SIDED_TAPE_QUESTION_IDS)[number];

const routeFieldByQuestionId: Record<SingleSidedTapeQuestionId, keyof SingleSidedTapeRoute> = {
  singleTapeUse: "use",
  singleTapeSubUse: "subUse",
  singleTapeWork: "work",
  singleTapePerformance1: "performance1",
  singleTapePerformance2: "performance2",
};

const priorQuestionIds: Record<SingleSidedTapeQuestionId, SingleSidedTapeQuestionId[]> = {
  singleTapeUse: [],
  singleTapeSubUse: ["singleTapeUse"],
  singleTapeWork: ["singleTapeUse", "singleTapeSubUse"],
  singleTapePerformance1: ["singleTapeUse", "singleTapeSubUse", "singleTapeWork"],
  singleTapePerformance2: ["singleTapeUse", "singleTapeSubUse", "singleTapeWork", "singleTapePerformance1"],
};

const displayLabelByQuestionId: Partial<Record<SingleSidedTapeQuestionId, Record<string, string>>> = {
  singleTapeUse: {
    固定する: "固定・結束",
    スプライスつなぐ: "スプライス",
    "熱・燃焼から守る": "耐熱・難燃",
    "滑らせる、振動音をおさえる": "滑り助長・異音防止",
    屋外での仮固定: "屋外仮固定",
    ラインテープ: "ライン表示",
    防止テープ: "防水・シール",
    防水テープ: "防水・シール",
  },
  singleTapeWork: {
    塗装用: "建築塗装部",
    ガラスシーリング: "ガラス周辺",
    サイディングシーリング: "サイディング目地",
    躯体コンクリート: "コンクリート躯体",
    "アノダイジング（アルマイト処理）": "アノダイジング（アルマイト処理）マスキング",
  },
};

const questionCopyByUse: Record<string, Partial<Record<SingleSidedTapeQuestionId, { text: string; subtext?: string }>>> = {
  保護膜剥離: {
    singleTapeSubUse: {
      text: "作業方法はどちらですか？",
      subtext: "手貼りか機械貼りかを選択してください",
    },
  },
  "熱・燃焼から守る": {
    singleTapeSubUse: {
      text: "どちらの目的ですか？",
      subtext: "遮熱か、火花・耐熱保護かを選択してください",
    },
    singleTapeWork: {
      text: "耐熱温度は？",
      subtext: "必要な耐熱温度を選択してください",
    },
  },
  "滑らせる、振動音をおさえる": {
    singleTapeSubUse: {
      text: "必要な機能は何ですか？",
      subtext: "滑り性、再剥離性、接着力、帯電防止などから選択してください",
    },
    singleTapeWork: {
      text: "厚みの希望はどちらですか？",
      subtext: "厚みや色など、追加で重視する条件を選択してください",
    },
  },
  ["\u30e9\u30a4\u30f3\u30c6\u30fc\u30d7"]: {
    singleTapeWork: {
      text: "\u5e0c\u671b\u3059\u308b\u3082\u306e\u306f\u3069\u308c\u3067\u3059\u304b\uff1f",
      subtext: "\u30e9\u30a4\u30f3\u8868\u793a\u3067\u91cd\u8996\u3059\u308b\u73fe\u5834\u6761\u4ef6\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044",
    },
  },
};

const performance1SortOrder = [
  "粉体塗装・塗装乾燥温度200度1時間以下",
  "塗装乾燥温度190度1時間以下",
  "塗装乾燥温度160度1時間以下",
  "塗装乾燥温度150度30分以下",
];

function answerForQuestion(answers: SingleSidedTapeAnswers, questionId: SingleSidedTapeQuestionId): string | undefined {
  return answers[questionId];
}

function routeValueForQuestion(route: SingleSidedTapeRoute, questionId: SingleSidedTapeQuestionId): string {
  return String(route[routeFieldByQuestionId[questionId]] || "指定なし");
}

function routeMatchesAnswers(route: SingleSidedTapeRoute, answers: SingleSidedTapeAnswers, questionIds: SingleSidedTapeQuestionId[]): boolean {
  return questionIds.every((questionId) => {
    const answer = answerForQuestion(answers, questionId);
    if (!answer || answer === "指定なし") return true;
    return routeValueForQuestion(route, questionId) === answer;
  });
}

export function isSingleSidedTapeQuestion(questionId: string): questionId is SingleSidedTapeQuestionId {
  return SINGLE_SIDED_TAPE_QUESTION_IDS.includes(questionId as SingleSidedTapeQuestionId);
}

export function getSingleSidedTapeOptions(questionId: SingleSidedTapeQuestionId, answers: SingleSidedTapeAnswers) {
  const candidateRoutes = singleSidedTapeRoutes.filter((route) => routeMatchesAnswers(route, answers, priorQuestionIds[questionId]));
  const values = Array.from(new Set(candidateRoutes.map((route) => routeValueForQuestion(route, questionId)).filter(Boolean)));

  if (questionId === "singleTapePerformance1") {
    values.sort((a, b) => {
      const aIndex = performance1SortOrder.indexOf(a);
      const bIndex = performance1SortOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }

  return (values.length > 0 ? values : ["指定なし"]).map((value) => ({
    value,
    label: displayLabelByQuestionId[questionId]?.[value] ?? value,
  }));
}

export function hasOnlyOneDisplayableSingleSidedTapeOption(questionId: string, answers: SingleSidedTapeAnswers): boolean {
  if (!isSingleSidedTapeQuestion(questionId)) return false;
  const options = getSingleSidedTapeOptions(questionId, answers);
  const displayableOptions = options.filter((option) => option.value && option.label);
  return displayableOptions.length <= 1;
}

export function getSingleSidedTapeDisplayLabel(questionId: string, value: string): string {
  if (!isSingleSidedTapeQuestion(questionId)) return value;
  return displayLabelByQuestionId[questionId]?.[value] ?? value;
}

export function getSingleSidedTapeQuestionCopy(
  questionId: string,
  answers: SingleSidedTapeAnswers,
): { text?: string; subtext?: string } {
  if (!isSingleSidedTapeQuestion(questionId)) return {};
  const use = answers.singleTapeUse;
  if (!use) return {};
  return questionCopyByUse[use]?.[questionId] ?? {};
}

export function getSingleSidedTapeRoute(criteria: SelectionCriteria): SingleSidedTapeRoute | null {
  if (criteria.category !== "片面テープ") return null;
  if (!criteria.singleTapeUse) return null;

  const answers: SingleSidedTapeAnswers = {
    category: criteria.category,
    singleTapeUse: criteria.singleTapeUse,
    singleTapeSubUse: criteria.singleTapeSubUse,
    singleTapeWork: criteria.singleTapeWork,
    singleTapePerformance1: criteria.singleTapePerformance1,
    singleTapePerformance2: criteria.singleTapePerformance2,
  };

  const exactRoute = singleSidedTapeRoutes.find((route) =>
    routeMatchesAnswers(route, answers, [...SINGLE_SIDED_TAPE_QUESTION_IDS]),
  );
  if (exactRoute) return exactRoute;

  return null;
}

export function buildSingleSidedTapeResult(
  route: SingleSidedTapeRoute,
  allProducts: Product[],
): { primary: Product; alternatives: Product[]; reasons: string[] } | null {
  const primary = allProducts.find((product) => product.id === route.productId);
  if (!primary) return null;

  const alternatives = route.alternativeIds
    ? route.alternativeIds
        .map((id) => allProducts.find((product) => product.id === id))
        .filter((product): product is Product => Boolean(product))
    : allProducts
        .filter((product) => product.category === "片面テープ" && product.id !== primary.id)
        .filter((product) => product.applications.some((application) => [route.use, route.subUse, route.work].includes(application)))
        .slice(0, 3);

  return {
    primary,
    alternatives,
    reasons: [route.reason],
  };
}
