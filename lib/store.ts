"use client";

import { create } from "zustand";
import { SelectionCriteria, SelectionResult, selectProducts } from "./selectionEngine";
import { getTotalStepsForAnswers, getQuestionsForCategoryAndAnswers } from "./questions";

type Answers = Partial<Record<string, string | string[] | boolean>>;

interface SelectorState {
  currentStep: number;
  answers: Answers;
  result: SelectionResult | null;
  noMatchReason: string | null;  // "floor_handTear" など
  isComplete: boolean;
  setAnswer: (key: string, value: string | string[] | boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  compute: () => void;
}

function buildCriteria(answers: Answers): SelectionCriteria {
  const category = (answers.category as string) ?? "";
  const features: string[] = [];
  const environment: string[] = [];
  const application: string[] = [];
  let permanent = true;
  let substrateA = (answers.substrateA as string) ?? "";
  let substrateB = (answers.substrateB as string) ?? "";

  // ── 用途コンテキストによるプリシード ─────────────────────────
  // カテゴリ選択後の用途質問の回答を features / environment に先行投入し、
  // 後続の個別質問と合わせてスコアリングを最適化する
  const appCtx = (answers.applicationContext as string) ?? "";

  if (category === "両面テープ") {
    if (appCtx === "シリコン固定") {
      if (!features.includes("シリコン接着")) features.push("シリコン接着");
      substrateB = substrateB || "シリコン";
    } else if (appCtx === "粗面固定") {
      substrateB = substrateB || "コンクリート";
    } else if (appCtx === "FPC固定") {
      if (!environment.includes("高温")) environment.push("高温");
      if (!features.includes("超高耐熱")) features.push("超高耐熱");
    } else if (appCtx === "フォーム貼り合わせ") {
      if (!features.includes("フォーム")) features.push("フォーム");
    } else if (appCtx === "高耐熱用途") {
      if (!environment.includes("高温")) environment.push("高温");
      if (!features.includes("高耐熱")) features.push("高耐熱");
    } else if (["建材固定", "パネル固定", "ガラス固定", "車内装"].includes(appCtx)) {
      if (!features.includes("超高強度")) features.push("超高強度");
    } else if (appCtx === "LCD固定") {
      if (!features.includes("低VOC")) features.push("低VOC");
    }

    const tempEnv = answers.tempEnv as string;
    if (tempEnv === "outdoor") { if (!environment.includes("屋外")) environment.push("屋外"); }
    else if (tempEnv === "warm") { if (!environment.includes("高温")) environment.push("高温"); }
    else if (tempEnv === "hot") {
      if (!environment.includes("高温")) environment.push("高温");
      if (!features.includes("高耐熱")) features.push("高耐熱");
    }
    else if (tempEnv === "superhot") {
      if (!environment.includes("高温")) environment.push("高温");
      if (!features.includes("超高耐熱")) features.push("超高耐熱");
    }
    else if (!environment.includes("高温") && !environment.includes("屋外")) environment.push("屋内");

    const fixType = answers.fixType as string;
    if (fixType === "removable") { permanent = false; features.push("再剥離"); }
    else if (fixType === "temp") { permanent = false; features.push("仮固定"); }
    else permanent = true;

    const specialNeeds = (answers.specialNeeds as string[]) ?? [];
    if (specialNeeds.includes("lowVOC") && !features.includes("低VOC")) features.push("低VOC");
    if (specialNeeds.includes("silicone")) {
      substrateB = substrateB || "シリコン";
      if (!features.includes("シリコン接着")) features.push("シリコン接着");
    }
    if (specialNeeds.includes("roughSurface")) substrateB = substrateB || "コンクリート";
    if (specialNeeds.includes("foam") && !features.includes("フォーム")) features.push("フォーム");
    if (specialNeeds.includes("vhb") && !features.includes("超高強度")) features.push("超高強度");

  } else if (category === "接着剤") {
    // 用途コンテキストによるプリシード
    if (appCtx === "油面接着") { if (!environment.includes("油")) environment.push("油"); }
    else if (appCtx === "高耐熱接着") { if (!environment.includes("高温")) environment.push("高温"); }
    else if (appCtx === "柔軟接着") { if (!features.includes("柔軟")) features.push("柔軟"); }
    else if (appCtx === "ゴム接着") { substrateB = substrateB || "EPDM"; }

    const specialEnv = (answers.specialEnv as string[]) ?? [];
    if (specialEnv.includes("油面") && !environment.includes("油")) environment.push("油");
    if (specialEnv.includes("高温") && !environment.includes("高温")) environment.push("高温");
    if (specialEnv.includes("薬品")) environment.push("薬品");
    if (specialEnv.includes("振動")) environment.push("振動");

    const strength = answers.strength as string;
    if (strength === "ultraHigh") features.push("超高強度");
    else if (strength === "flexible" && !features.includes("柔軟")) features.push("柔軟");

    permanent = true;

  } else if (category === "ファスナー") {
    // 用途コンテキストによるプリシード
    if (appCtx === "屋外固定") { if (!environment.includes("屋外")) environment.push("屋外"); }
    else if (appCtx === "展示用途" || appCtx === "サイン用途") {
      // 透明色ヒント：colorReqが未指定なら"透明"を優先（上書き可）
      // ここでは features に透明ヒントを与えるのみ（scoring側でboostあり）
    } else if (appCtx === "家電内装") {
      if (!features.includes("薄型")) features.push("薄型");
    } else if (appCtx === "頻繁着脱") {
      if (!features.includes("再使用可")) features.push("再使用可");
    } else if (appCtx === "仮固定") {
      permanent = false;
    }

    const detachFreq = answers.detachFreq as string;
    if (detachFreq === "frequent") { permanent = false; if (!features.includes("再剥離")) features.push("再剥離"); }
    else if (detachFreq === "occasional") permanent = false;
    else if (detachFreq) permanent = true;

    const fixStrength = answers.fixStrength as string;
    if (fixStrength === "high") features.push("強固定");

    if (substrateA === "PP") features.push("LSE対応");

    if (answers.outdoor === "true" || answers.outdoor === true) {
      if (!environment.includes("屋外")) environment.push("屋外");
    } else if (!environment.includes("屋外")) environment.push("屋内");

    if (answers.needsThin === "true" || answers.needsThin === true) {
      if (!features.includes("薄型")) features.push("薄型");
    }

  } else if (category === "片面テープ") {
    const mainPurpose = answers.mainPurpose as string;
    if (mainPurpose === "marking") {
      application.push("マーキング");
      features.push("マーキング");
      // 床ライン3ルール: forklift → 971L / cost → 764 / else → 471
      const forklift = answers.forkliftDurability === "true" || answers.forkliftDurability === true;
      const costPriority = answers.priceSensitive === "true" || answers.priceSensitive === true;
      if (forklift) {
        features.push("フォークリフト耐久");  // → 971L（ルールベース）
      } else if (costPriority) {
        features.push("標準ライン");           // → 764（ルールベース）
      } else {
        features.push("視認性");              // → 471（ルールベース）
      }
    }
    else if (mainPurpose === "insulation") { application.push("絶縁"); features.push("電気絶縁"); }
    else if (mainPurpose === "waterproof") { application.push("防水"); features.push("防水", "自己融着"); }
    else if (mainPurpose === "aluminum") { application.push("シール"); features.push("アルミ箔", "熱反射"); }
    else if (mainPurpose === "protection") application.push("保護");
    else if (mainPurpose === "masking") application.push("マスキング");

    const heatReq = answers.heatReq as string;
    if (heatReq === "medium") features.push("耐熱");
    else if (heatReq === "high") { environment.push("高温"); features.push("高耐熱"); }
    else environment.push("屋内");

    // 手切れ性は床ライン以外でのみ有効（床ラインはカッター施工が標準）
    if ((answers.handCut === "true" || answers.handCut === true) && mainPurpose !== "marking") {
      features.push("手切れ性");
    }

    const otherReqs = (answers.otherReqs as string[]) ?? [];
    if (otherReqs.includes("outdoor")) environment.push("屋外");
    if (otherReqs.includes("chemical")) features.push("耐薬品");
    if (otherReqs.includes("waterproof") && !features.includes("自己融着")) features.push("防水", "自己融着");
    if (otherReqs.includes("ul")) features.push("UL");

    permanent = true;
  }

  return {
    category,
    application,
    substrateA,
    substrateB,
    environment,
    features,
    thickness: (answers.thickness as string) ?? "指定なし",
    processingMethod: (answers.processing as string) ?? "",
    priceSensitive: answers.priceSensitive === "true" || answers.priceSensitive === true,
    permanent,
    color: category === "ファスナー" ? ((answers.colorReq as string) ?? "none") : undefined,
    applicationContext: appCtx !== "指定なし" && appCtx ? appCtx : undefined,
  };
}

export const useSelectorStore = create<SelectorState>((set, get) => ({
  currentStep: 0,
  answers: {},
  result: null,
  noMatchReason: null,
  isComplete: false,

  setAnswer: (key, value) => {
    set((state) => ({ answers: { ...state.answers, [key]: value } }));
  },

  nextStep: () => {
    const { currentStep, answers, compute } = get();
    const category = answers.category as string | undefined;
    const totalSteps = category ? getTotalStepsForAnswers(category, answers) : 1;
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      compute();
      set({ isComplete: true });
    }
  },

  prevStep: () => {
    const { currentStep, answers, isComplete } = get();
    if (isComplete) {
      const category = answers.category as string | undefined;
      const totalSteps = category ? getTotalStepsForAnswers(category, answers) : 1;
      set({ isComplete: false, currentStep: totalSteps - 1 });
      return;
    }
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  reset: () => {
    set({ currentStep: 0, answers: {}, result: null, noMatchReason: null, isComplete: false });
  },

  compute: () => {
    const { answers } = get();
    // 床ライン + 手切れ性 → 使用できる製品なし（カッター施工が前提）
    const isFloorMarking = answers.mainPurpose === "marking";
    const isHandCut = answers.handCut === "true" || answers.handCut === true;
    if (isFloorMarking && isHandCut) {
      set({ result: null, noMatchReason: "floor_handTear" });
      return;
    }
    set({ result: selectProducts(buildCriteria(answers)), noMatchReason: null });
  },
}));
