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

  return (values.length > 0 ? values : ["指定なし"]).map((value) => ({
    value,
    label: value,
  }));
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

  const alternatives = allProducts
    .filter((product) => product.category === "片面テープ" && product.id !== primary.id)
    .filter((product) => product.applications.some((application) => [route.use, route.subUse, route.work].includes(application)))
    .slice(0, 3);

  return {
    primary,
    alternatives,
    reasons: [route.reason],
  };
}
