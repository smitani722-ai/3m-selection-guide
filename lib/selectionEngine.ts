import productsData from "@/data/products.json";

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  applications: string[];
  substrates: string[];
  environment: string[];
  thickness?: string;
  tempRange?: { min: number; max: number };
  lse?: boolean;
  price: string;
  permanence?: string;
  notes: string;
  competitors: string[];
  datasheetUrl?: string;
  datasheetTitle?: string;
  datasheetDocumentType?: string;
  datasheetLanguage?: string;
  datasheetSourcePageUrl?: string;
  datasheetSourceSection?: string;
  datasheets?: {
    title: string;
    url: string;
    documentType: string;
    language: string;
  }[];
  workTime?: string;
  cureTime?: string;
}

export interface SelectionCriteria {
  category: string;
  application: string[];
  substrateA: string;
  substrateB: string;
  environment: string[];
  features: string[];
  thickness: string;
  processingMethod: string;
  priceSensitive: boolean;
  permanent: boolean;
}

export interface SelectionResult {
  primary: Product;
  alternatives: Product[];
  reasons: string[];
  warnings: string[];
  category: string;
  matchScore: number;
}

const products: Product[] = productsData.products as Product[];
const GPH_PRODUCT_IDS = ["GPH-060GF", "GPH-110GF", "GPH-160GF"];
const LSE_VHB_PRODUCT_IDS = ["LSE-060WF", "LVO-110BF", "LSE-160WF"];
const NON_RECOMMENDED_PRODUCT_IDS = ["9472LE", "9672LE"];

const LSE_SUBSTRATES = ["PP", "PE", "TPO", "TPE", "オレフィン系樹脂", "LSE材", "シリコン", "シリコンゴム", "ナイロン", "POM", "PBT", "PA"];
const ROUGH_SUBSTRATES = ["コンクリート", "モルタル", "木材", "粗面", "凹凸面", "塗装面"];
const METAL_SUBSTRATES = ["SUS", "アルミ", "鉄", "銅", "金属", "鋼"];
const LINE_TAPE_APPLICATIONS = ["床ライン", "安全表示", "区画表示", "通路表示", "フォークリフト導線", "工場マーキング", "マーキング"];
const NON_LINE_TAPE_APPLICATIONS = ["ケーブル防水", "ダクト補修", "配線結束", "電気絶縁処理", "ケーブルジョイント保護", "HVACシール", "防水", "絶縁", "結束", "シール", "補強"];

function values(criteria: SelectionCriteria): string[] {
  return [
    criteria.category,
    ...criteria.application,
    criteria.substrateA,
    criteria.substrateB,
    ...criteria.environment,
    ...criteria.features,
    criteria.thickness,
    criteria.processingMethod,
  ].filter(Boolean);
}

function includesAny(items: string[], keywords: string[]): boolean {
  return items.some((item) => keywords.some((keyword) => item.includes(keyword) || keyword.includes(item)));
}

function hasKeyword(items: string[], keywords: string[]): boolean {
  return items.some((item) => keywords.some((keyword) => item.includes(keyword)));
}

function thicknessNumber(thickness?: string): number | null {
  const match = thickness?.match(/[0-9.]+/);
  return match ? Number(match[0]) : null;
}

function nameplateTargetProductId(criteria: SelectionCriteria): string | null | undefined {
  const allValues = values(criteria);
  const allSubstrates = [criteria.substrateA, criteria.substrateB].filter(Boolean);
  const isNameplate = hasKeyword(criteria.application, ["銘板固定", "ラベル固定", "銘板", "ラベル"]);
  const needsUlCertification = hasKeyword(allValues, ["UL746C", "UL969", "ポリマー材料認証", "ラベルマーキングシステム認証"]);
  if (!isNameplate && !needsUlCertification) return undefined;

  const thickness = thicknessNumber(criteria.thickness);
  const needsGapAbsorption = hasKeyword(allValues, ["段差吸収", "防振", "フォーム必要", "フォーム", "追従性"]);
  const isRoughSurface = includesAny(allSubstrates, ["粗面", "コンクリート", "モルタル", "木材", "凹凸面"]) || hasKeyword(allValues, ["粗面", "凹凸面"]);
  const isSilicone = hasKeyword(allSubstrates, ["シリコンゴム", "シリコン樹脂", "シリコン"]);
  const needsHighHeat = hasKeyword(allValues, ["高耐熱", "耐熱"]);
  const needsFoamLowVoc = hasKeyword(allValues, ["フォーム材貼り合わせ", "フォーム材", "フォーム"]) && hasKeyword(allValues, ["低VOC", "低アウトガス"]);
  const needsLowVoc = hasKeyword(allValues, ["低VOC", "低アウトガス", "クリーンルーム", "電子部品", "光学用途"]);
  const needsVhb = hasKeyword(allValues, ["VHB", "超高強度"]);
  const needsLargeRoughSurface = hasKeyword(allValues, ["大面積", "パネル固定", "歪みあり", "反りあり", "凹凸が大きい", "追従性重視"]);
  const needsCompactRoughSurface = hasKeyword(allValues, ["小面積", "銘板サイズ", "厚みを目立たせたくない", "薄く仕上げたい", "コンパクトな固定"]);
  const hasSiliconeHighHeatUse = hasKeyword(allValues, ["シリコン用途"]) && hasKeyword(allValues, ["高耐熱", "高耐熱工程", "150℃", "200℃", "200℃級", "ポリイミド"]);
  const needsSiliconeHighHeatProcess =
    hasKeyword(allValues, ["ウェーブソルダー", "はんだ工程", "高耐熱工程", "150〜200℃", "150℃以上", "200℃級"]) ||
    hasSiliconeHighHeatUse ||
    (isSilicone && hasKeyword(allValues, ["高耐熱", "150℃", "200℃"]));
  const needsThinSiliconeTape = hasKeyword(allValues, ["薄手", "0.1mmクラス", "厚みを増やしたくない", "薄型構造"]);
  const needsThickSiliconeTape = hasKeyword(allValues, ["厚みが必要", "段差吸収", "フォーム構造", "フォーム"]);
  const hasSpecialRequest = needsHighHeat || needsGapAbsorption || isRoughSurface || isSilicone || needsLowVoc || needsVhb || needsUlCertification;

  if (thickness === null) return undefined;
  if (needsUlCertification) {
    if (thickness < 0.1) return "467MP";
    if (thickness >= 0.1 && thickness <= 0.3) return "468MP";
    return undefined;
  }
  if (isRoughSurface) {
    if (thickness >= 1.0 || needsLargeRoughSurface) return "5952";
    if (thickness < 1.0 || needsCompactRoughSurface) return "5925";
    if (thickness > 0.1 && thickness < 1.0) return "5925";
    return null;
  }

  if (needsFoamLowVoc && thickness >= 0.1 && thickness < 0.3) return "DCX-1018";
  if (needsGapAbsorption) return "Y4825";

  if (isSilicone) {
    if (needsSiliconeHighHeatProcess && thickness <= 0.2) return "4390";
    if (needsThinSiliconeTape || thickness < 0.3) return "9119P";
    if (needsThickSiliconeTape) return "Y4924";
    if (thickness >= 0.3) return "Y4924";
    return null;
  }

  if (needsHighHeat && thickness <= 0.1) return "467MP";
  if (needsHighHeat && thickness > 0.1 && thickness < 0.3) return "468MP";

  if (needsLowVoc) {
    if (thickness >= 0.1 && thickness < 0.3) return "1110";
    if (thickness >= 0.3 && thickness < 1.0) return null;
    if (thickness >= 1.0) return "LVO-110BF";
  }

  if (needsVhb) {
    if (thickness >= 0.1) return "Y4825";
    return null;
  }

  if (criteria.priceSensitive && !hasSpecialRequest) return "9660";
  if (thickness < 0.1) return "467MP";
  if (thickness >= 0.1 && thickness < 0.3) return "9660";
  if (thickness >= 0.3) return "Y4825";

  return undefined;
}

function isVhb(product: Product): boolean {
  return product.subcategory.includes("VHB") || product.features.includes("VHB");
}

function gphTargetProductIds(criteria: SelectionCriteria): string[] {
  const thickness = thicknessNumber(criteria.thickness);
  if (thickness === null) return GPH_PRODUCT_IDS;
  if (thickness >= 0.3 && thickness < 0.8) return ["GPH-060GF"];
  if (thickness >= 0.8 && thickness < 1.3) return ["GPH-110GF"];
  if (thickness >= 1.3) return ["GPH-160GF"];
  return [];
}

function lseVhbTargetProductIds(criteria: SelectionCriteria): string[] {
  const thickness = thicknessNumber(criteria.thickness);
  if (thickness === null) return ["LVO-110BF"];
  if (thickness >= 0.6 && thickness < 1.1) return ["LSE-060WF"];
  if (thickness >= 1.1 && thickness < 1.6) return ["LVO-110BF"];
  if (thickness >= 1.6) return ["LSE-160WF"];
  return [];
}

function lseTapeTargetProductId(criteria: SelectionCriteria): string | null {
  const thickness = thicknessNumber(criteria.thickness);
  if (thickness === null) return null;
  if (thickness <= 0.1 || hasKeyword(values(criteria), ["薄手", "薄型"])) return "93010LE";
  if (thickness < 0.2) return "93015LE";
  if (thickness < 0.6) return "93020LE";
  return null;
}

function calcScore(product: Product, criteria: SelectionCriteria): number {
  let score = 0;
  const allValues = values(criteria);
  const allSubstrates = [criteria.substrateA, criteria.substrateB].filter(Boolean);
  const isLSE = includesAny(allSubstrates, LSE_SUBSTRATES) || allValues.includes("LSE対応");
  const isSilicone = includesAny(allSubstrates, ["シリコン", "シリコンゴム"]);
  const isNylon = includesAny(allSubstrates, ["ナイロン", "POM", "PBT", "PA"]);
  const hasEngineeringPlastic = allSubstrates.some((substrate) =>
    ["ナイロン", "PA", "POM", "PBT", "PET", "難接着エンプラ", "エンジニアリングプラスチック"].some((keyword) => substrate.includes(keyword)),
  );
  const hasCommodityLseResin = allSubstrates.some((substrate) => ["PP", "PE", "TPO"].includes(substrate));
  const hasRoughSurfaceCondition = includesAny(allSubstrates, ROUGH_SUBSTRATES) || includesAny(allValues, ["粗面", "フォーム追従"]);
  const hasExplicitRoughSurfaceCondition = includesAny(allSubstrates, ["粗面", "コンクリート", "モルタル", "木材", "凹凸面"]) || includesAny(allValues, ["粗面", "凹凸", "段差", "フォーム追従"]);
  const isRough = hasRoughSurfaceCondition || includesAny(allValues, ["段差"]);
  const isHighTemp = includesAny(criteria.environment, ["高温"]) || includesAny(criteria.features, ["高耐熱"]);
  const isGphException = hasKeyword(allValues, ["GPH指定", "海外規格", "海外案件", "特殊条件", "極端な高温", "超高温", "200℃超"]);
  const isVeryHighTemp = isGphException;
  const needsPlasticizerResistantVhb = hasKeyword(allValues, ["軟質PVC", "軟質塩ビ", "PVCシート", "ビニール", "可塑剤"]);
  const needsGphAlternative = needsPlasticizerResistantVhb || hasKeyword(allValues, ["海外案件", "海外規格", "特殊高耐熱", "Y4825代替", "GPH指定"]);
  const targetGphIds = gphTargetProductIds(criteria);
  const needsProcessHeatTape = hasKeyword(allValues, ["リフロー", "はんだ実装", "SMT", "高温加工工程", "工程内固定", "貼ったまま"]);
  const needsFpcUltraHighHeat = !needsProcessHeatTape && hasKeyword(allValues, ["220℃超", "260℃", "ポリイミド", "FPC"]);
  const hasSiliconeHighHeatUse = hasKeyword(allValues, ["シリコン用途"]) && hasKeyword(allValues, ["高耐熱", "高耐熱工程", "150℃", "200℃", "200℃級", "ポリイミド"]);
  const needsSiliconeHighHeatProcess =
    hasKeyword(allValues, ["ウェーブソルダー", "はんだ工程", "高耐熱工程", "150〜200℃", "150℃以上", "200℃級"]) ||
    hasSiliconeHighHeatUse ||
    (isSilicone && hasKeyword(allValues, ["高耐熱", "150℃", "200℃"]));
  const needsThinSiliconeTape = hasKeyword(allValues, ["薄手", "0.1mmクラス", "厚みを増やしたくない", "薄型構造"]);
  const needsThickSiliconeTape = hasKeyword(allValues, ["厚みが必要", "段差吸収", "フォーム構造", "フォーム"]);
  const isPowderCoating = hasKeyword(allValues, ["粉体塗装", "JIS Z1541", "180℃", "30分", "乾燥工程"]);
  const isDomesticMarket = !hasKeyword(allValues, ["海外規格", "海外案件"]);
  const isChemical = criteria.environment.includes("薬品");
  const isVibration = criteria.environment.includes("振動") || criteria.features.includes("柔軟") || criteria.features.includes("耐衝撃");
  const requestedThickness = thicknessNumber(criteria.thickness);
  const isThin = ["極薄", "0.05mm", "0.1mm"].includes(criteria.thickness) || includesAny(allValues, ["薄手", "薄型"]);
  const isThick = criteria.thickness === "1mm以上";
  const needsThinHeatTape = isVeryHighTemp && (isThin || hasKeyword(allValues, ["低プロファイル", "電子部品", "FPC", "ポリイミド"]));
  const substrateAIsMetal = includesAny([criteria.substrateA].filter(Boolean), METAL_SUBSTRATES);
  const substrateBIsMetal = includesAny([criteria.substrateB].filter(Boolean), METAL_SUBSTRATES);
  const hasBothSubstrates = Boolean(criteria.substrateA && criteria.substrateB);
  const isMetalBonding = hasBothSubstrates && substrateAIsMetal && substrateBIsMetal && criteria.category === "接着剤";
  const isMixedMaterialBonding =
    hasBothSubstrates && criteria.category === "接着剤" && (substrateAIsMetal || substrateBIsMetal) && !(substrateAIsMetal && substrateBIsMetal);
  const isMetalTapeBonding = includesAny(allSubstrates, METAL_SUBSTRATES) && criteria.category === "両面テープ";
  const isStructuralTape = criteria.category === "両面テープ" && (criteria.application.includes("構造接合") || criteria.features.includes("高接着"));
  const needsUltraHighStrengthVhb =
    criteria.category === "両面テープ" &&
    !needsPlasticizerResistantVhb &&
    !isVeryHighTemp &&
    hasKeyword(allValues, ["VHB"]) &&
    hasKeyword(allValues, [
      "150℃以下",
      "さらに強力な接合",
      "高荷重",
      "高応力",
      "大型パネル",
      "構造接合強化",
      "剥離強度重視",
      "安全率を高くしたい",
      "最高レベルの接合力",
      "超高強度VHB",
    ]);
  const needsLvo = isLSE && hasKeyword(allValues, ["VHB", "フォーム", "追従性", "段差吸収", "ギャップ吸収"]);
  const targetLseVhbIds = lseVhbTargetProductIds(criteria);
  const needsFoamLowVoc = hasKeyword(allValues, ["フォーム材貼り合わせ", "フォーム材", "フォーム"]) && hasKeyword(allValues, ["低VOC", "低アウトガス"]);
  const needsGapFoamVhb = hasKeyword(allValues, ["段差吸収", "防振", "フォーム必要", "フォーム", "追従性"]);
  const needsLargeRoughSurface = hasKeyword(allValues, ["大面積", "パネル固定", "歪みあり", "反りあり", "凹凸が大きい", "追従性重視"]);
  const needsCompactRoughSurface = hasKeyword(allValues, ["小面積", "銘板サイズ", "厚みを目立たせたくない", "薄く仕上げたい", "コンパクトな固定"]);
  const needsLowCostLse = isLSE && !needsLvo && (criteria.priceSensitive || hasKeyword(allValues, ["価格が安い", "コスト重視", "低価格"]));
  const isGeneralStructuralAdhesive =
    criteria.category === "接着剤" &&
    (criteria.application.includes("構造接合") || criteria.features.includes("高強度") || criteria.application.includes("固定")) &&
    !isMetalBonding &&
    !isVibration;
  const needsFastNsEpoxy =
    criteria.category === "接着剤" &&
    hasKeyword(allValues, [
      "短時間で作業",
      "硬化待ち時間",
      "タクトタイム短縮",
      "生産性向上",
      "垂直面施工",
      "壁面接着",
      "液だれ防止",
      "ノンサグ",
      "仮固定時間",
      "早期作業性",
    ]);
  const needsLongWorkTimeEpoxy =
    criteria.category === "接着剤" &&
    hasKeyword(allValues, ["長い作業時間", "大型部品", "位置合わせ時間", "広面積接着", "ゆっくり組立", "長い可使時間"]);
  const needsWarningLineTape =
    criteria.category === "片面テープ" &&
    hasKeyword(allValues, [
      "黄黒ストライプ",
      "危険表示",
      "注意喚起",
      "立入禁止",
      "安全区域表示",
      "危険区域表示",
      "視認性重視",
      "警告表示",
    ]);

  if (product.category !== criteria.category) return -1;
  if (NON_RECOMMENDED_PRODUCT_IDS.includes(product.id)) return -1;
  if (needsLowCostLse && ["93010LE", "93015LE", "93020LE", "GPT-020F"].includes(product.id) && product.id !== "GPT-020F") return -1;
  const targetLseTapeId = isLSE && !isSilicone && !needsLvo ? lseTapeTargetProductId(criteria) : null;
  if (targetLseTapeId && ["93010LE", "93015LE", "93020LE", "467MP", "468MP"].includes(product.id) && product.id !== targetLseTapeId) {
    return -1;
  }
  if (isLSE && !isSilicone && !needsLvo && ["467MP", "468MP"].includes(product.id)) return -1;
  if (criteria.category === "両面テープ" && requestedThickness !== null && requestedThickness < 0.2 && product.id === "Y4825") {
    return -1;
  }

  const nameplateTargetId = nameplateTargetProductId(criteria);
  if (nameplateTargetId === null) return -1;
  if (nameplateTargetId !== undefined) {
    if (product.id === nameplateTargetId) score += 300;
    else score -= 80;
  }

  if (product.category === "片面テープ") {
    if (includesAny(criteria.application, NON_LINE_TAPE_APPLICATIONS)) {
      return -1;
    }
    if (criteria.application.length > 0 && !includesAny(criteria.application, LINE_TAPE_APPLICATIONS)) {
      score -= 20;
    }
    if (product.id === "471" && includesAny(criteria.application, LINE_TAPE_APPLICATIONS)) score += 60;
    if (needsWarningLineTape && product.id === "5702") score += 220;
    if (needsWarningLineTape && product.id === "471") score -= 45;
    if (!needsWarningLineTape && product.id === "5702") score -= 70;
    if (product.id === "764" && includesAny(criteria.application, LINE_TAPE_APPLICATIONS) && criteria.priceSensitive) score += 140;
    if (product.id === "471" && includesAny(criteria.application, LINE_TAPE_APPLICATIONS) && criteria.priceSensitive) score -= 35;
    if (product.id === "764" && !criteria.priceSensitive) score -= 60;
  }

  for (const substrate of allSubstrates) {
    if (product.substrates.includes(substrate)) score += 10;
    else if (product.substrates.some((s) => s.includes(substrate) || substrate.includes(s))) score += 5;
  }

  if (isLSE && product.lse) score += 20;
  if (isLSE && !product.lse) score -= 30;
  if (isLSE && isThin && product.id === "93010LE") score += 70;
  if (isLSE && !isThin && !needsLvo && requestedThickness !== null && requestedThickness < 0.2 && product.id === "93015LE") score += 70;
  if (isLSE && !isThin && !needsLvo && requestedThickness !== null && requestedThickness >= 0.2 && product.id === "93020LE") score += 170;
  if (isLSE && !isThin && !needsLvo && requestedThickness !== null && requestedThickness >= 0.2 && product.id === "93015LE") score -= 40;
  if (isLSE && isThin && product.id === "93015LE") score -= 10;
  if (needsLowCostLse && product.id === "GPT-020F") score += 280;
  if (isLSE && !needsLvo && ["467MP", "468MP"].includes(product.id)) score -= 150;
  if (criteria.category === "両面テープ" && requestedThickness !== null && requestedThickness <= 0.1 && product.id === "467MP") score += 120;
  if (criteria.category === "両面テープ" && requestedThickness !== null && requestedThickness > 0.1 && requestedThickness < 0.3 && product.id === "468MP") score += 120;
  if (needsFpcUltraHighHeat && criteria.category === "両面テープ" && requestedThickness !== null && requestedThickness <= 0.05 && product.id === "F9460PC") score += 420;
  if (needsFpcUltraHighHeat && criteria.category === "両面テープ" && requestedThickness !== null && requestedThickness > 0.05 && requestedThickness < 0.2 && product.id === "F9469PC") score += 420;
  if (criteria.category === "両面テープ" && needsSiliconeHighHeatProcess && requestedThickness !== null && requestedThickness <= 0.2 && product.id === "4390") score += 1200;
  if (criteria.category === "両面テープ" && needsSiliconeHighHeatProcess && requestedThickness !== null && requestedThickness <= 0.2 && ["9119P", "Y4924"].includes(product.id)) score -= 240;
  if (criteria.category === "両面テープ" && needsSiliconeHighHeatProcess && requestedThickness !== null && requestedThickness <= 0.2 && ["467MP", "468MP", "F9460PC", "F9469PC", "9077"].includes(product.id)) score -= 900;
  if (needsProcessHeatTape && product.id === "9077") score += 520;
  if (needsProcessHeatTape && ["F9460PC", "F9469PC"].includes(product.id)) score -= 260;
  if (!needsFpcUltraHighHeat && ["F9460PC", "F9469PC"].includes(product.id)) score -= 220;
  if (criteria.category === "両面テープ" && requestedThickness !== null && requestedThickness <= 0.05 && product.id === "F9469PC") score -= 80;
  if (criteria.category === "両面テープ" && requestedThickness !== null && requestedThickness > 0.05 && requestedThickness < 0.2 && product.id === "F9460PC") score -= 80;
  if (needsLvo && targetLseVhbIds.includes(product.id)) score += 260;
  if (needsLvo && LSE_VHB_PRODUCT_IDS.includes(product.id) && !targetLseVhbIds.includes(product.id)) score -= 90;
  if (needsLvo && product.id === "93015LE") score -= 65;

  if (isSilicone && product.id === "Y4924") score += 420;
  if (isSilicone && needsSiliconeHighHeatProcess && requestedThickness !== null && requestedThickness <= 0.2 && product.id === "4390") score += 520;
  if (isSilicone && needsSiliconeHighHeatProcess && requestedThickness !== null && requestedThickness <= 0.2 && product.id === "Y4924") score -= 160;
  if (isSilicone && !needsSiliconeHighHeatProcess && (needsThinSiliconeTape || (requestedThickness !== null && requestedThickness < 0.3)) && product.id === "9119P") score += 500;
  if (isSilicone && !needsSiliconeHighHeatProcess && (needsThinSiliconeTape || (requestedThickness !== null && requestedThickness < 0.3)) && product.id === "Y4924") score -= 180;
  if (isSilicone && needsThickSiliconeTape && product.id === "Y4924") score += 180;
  if (isSilicone && needsThickSiliconeTape && ["9119P", "4390"].includes(product.id)) score -= 120;
  if (isSilicone && ["93010LE", "93015LE", "93020LE"].includes(product.id)) score -= 240;
  if (isSilicone && ["9119P", "4390"].includes(product.id)) score += 40;
  if (isSilicone && !product.features.includes("シリコン接着")) score -= 20;
  if (isNylon && product.id === "DP8910NS") score += 30;
  if (hasEngineeringPlastic && product.id === "DP8910NS") score += 100;
  if (hasEngineeringPlastic && product.id === "DP8710NS") score -= 80;
  if (criteria.category === "接着剤" && hasCommodityLseResin && !hasEngineeringPlastic && product.id === "DP8010") score += 130;
  if (criteria.category === "接着剤" && hasCommodityLseResin && !hasEngineeringPlastic && product.id === "DP8910NS") score -= 90;

  if (hasRoughSurfaceCondition && product.id === "5925") score += 65;
  if (hasRoughSurfaceCondition && product.id === "5952") score += 35;
  if (hasExplicitRoughSurfaceCondition && requestedThickness !== null && requestedThickness < 1.0 && product.id === "5925") score += 230;
  if (hasExplicitRoughSurfaceCondition && requestedThickness !== null && requestedThickness < 1.0 && product.id === "5952") score -= 90;
  if (hasExplicitRoughSurfaceCondition && needsLargeRoughSurface && product.id === "5952") score += 220;
  if (hasExplicitRoughSurfaceCondition && needsLargeRoughSurface && product.id === "5925") score -= 80;
  if (hasExplicitRoughSurfaceCondition && needsCompactRoughSurface && product.id === "5925") score += 220;
  if (hasExplicitRoughSurfaceCondition && needsCompactRoughSurface && product.id === "5952") score -= 80;
  if (hasExplicitRoughSurfaceCondition && requestedThickness !== null && requestedThickness >= 1.0 && product.id === "5952") score += 170;
  if (hasExplicitRoughSurfaceCondition && requestedThickness !== null && requestedThickness >= 1.0 && product.id === "5925") score -= 60;
  if (!needsFoamLowVoc && !hasRoughSurfaceCondition && needsGapFoamVhb && product.id === "Y4825") score += 320;
  if (!hasRoughSurfaceCondition && needsGapFoamVhb && product.id === "5925") score -= 220;
  if (needsFoamLowVoc && product.id === "DCX-1018") score += 520;
  if (needsFoamLowVoc && product.id === "Y4825") score -= 420;

  for (const app of criteria.application) {
    if (product.applications?.includes(app)) score += 8;
  }

  for (const env of criteria.environment) {
    if (product.environment?.includes(env)) score += 5;
  }

  if (isHighTemp) {
    const tempMax = product.tempRange?.max ?? 0;
    if (product.id === "Y4825" && !isVeryHighTemp) score += 170;
    if (GPH_PRODUCT_IDS.includes(product.id) && !needsGphAlternative) score -= 130;
    if (product.id === "9077" && (needsThinHeatTape || needsProcessHeatTape)) score += 120;
    if (tempMax >= 200) score += isVeryHighTemp ? 20 : 0;
    else if (tempMax >= 120) score += 10;
    else if (tempMax < 100) score -= 20;
  }

  if (needsGphAlternative && targetGphIds.includes(product.id)) score += 360;
  if (needsGphAlternative && GPH_PRODUCT_IDS.includes(product.id) && !targetGphIds.includes(product.id)) score -= 80;
  if (needsPlasticizerResistantVhb && product.id === "Y4825") score -= 180;

  if (product.id === "Y4825" && !needsPlasticizerResistantVhb) {
    if (isDomesticMarket) score += 35;
    if (isPowderCoating) score += 80;
    if (isMetalTapeBonding) score += 35;
    if (isStructuralTape) score += 45;
    if (hasKeyword(allValues, ["SUS", "アルミ", "鉄", "粉体塗装", "ABS", "PC", "ガラス"])) score += 55;
  }
  if (GPH_PRODUCT_IDS.includes(product.id) && !needsGphAlternative) {
    if (isDomesticMarket) score -= 70;
    if (isPowderCoating) score -= 80;
    if (isMetalTapeBonding || isStructuralTape) score -= 60;
  }

  if (!isLSE && !isRough && isVhb(product) && product.id === "Y4825") score += 45;
  if (needsUltraHighStrengthVhb && product.id === "Y4950") score += 360;
  if (needsUltraHighStrengthVhb && product.id === "Y4825") score -= 80;
  if (needsUltraHighStrengthVhb && GPH_PRODUCT_IDS.includes(product.id)) score -= 120;
  if (!needsUltraHighStrengthVhb && product.id === "Y4950") score -= 70;
  const needsPriceSensitiveVhb = criteria.priceSensitive && hasKeyword(allValues, ["VHB"]);
  if (needsPriceSensitiveVhb && requestedThickness !== null && requestedThickness >= 0.3 && requestedThickness < 0.6 && product.id === "5604") score += 220;
  if (needsPriceSensitiveVhb && requestedThickness !== null && requestedThickness >= 0.6 && requestedThickness < 1.0 && product.id === "5608") score += 220;
  if (needsPriceSensitiveVhb && (requestedThickness === null || requestedThickness >= 1.0) && product.id === "5611") score += 220;
  if (!needsPriceSensitiveVhb && ["5604", "5608", "5611"].includes(product.id)) score -= 120;
  if (criteria.priceSensitive && hasKeyword(allValues, ["VHB"]) && product.id === "Y4825") score -= 90;
  if (!isVeryHighTemp && GPH_PRODUCT_IDS.includes(product.id)) score -= 5;
  const canUseRefrigeratedStorage = hasKeyword(allValues, ["冷蔵保管可能", "冷蔵保管可", "冷蔵保管できる"]);
  const cannotUseRefrigeratedStorage = hasKeyword(allValues, ["冷蔵保管不可", "冷蔵保管できない", "常温保管"]);
  const needsLowCostMetalBonding = isMetalBonding && criteria.priceSensitive && canUseRefrigeratedStorage && !cannotUseRefrigeratedStorage;
  if (isMetalBonding && product.id === "メタルグリップ" && !needsLowCostMetalBonding) return -1;
  if (isMetalBonding && product.id === "メタルボンダー") score += needsLowCostMetalBonding ? 70 : 220;
  if (isMetalBonding && product.id === "メタルグリップ") score += needsLowCostMetalBonding ? 260 : 25;
  if (isMixedMaterialBonding && product.id === "DP460") score += needsFastNsEpoxy ? 20 : 100;
  if (isMixedMaterialBonding && ["メタルグリップ", "メタルボンダー"].includes(product.id)) score -= 120;
  if (isMetalBonding && product.id.startsWith("DP")) score -= 25;
  if (needsFastNsEpoxy && product.id === "DP420NS") score += 180;
  if (needsFastNsEpoxy && product.id === "DP460") score -= 80;
  if (needsLongWorkTimeEpoxy && product.id === "DP460") score += 180;
  if (needsLongWorkTimeEpoxy && product.id === "DP420NS") score -= 70;
  if (isGeneralStructuralAdhesive && product.id === "DP8710NS") score += 70;
  if (isVibration && product.id === "DP125") score += 80;
  if (isVibration && product.id === "2216") score -= 15;
  if (isChemical && product.features.includes("耐薬品")) score += 15;

  const isRemovableTapeUse =
    criteria.category === "両面テープ" && (hasKeyword(allValues, ["再剥離", "仮固定"]) || criteria.permanent === false);
  const needsEasyRemoval =
    isRemovableTapeUse && hasKeyword(allValues, ["剥がしやすさ", "再利用", "何度も貼り替える", "貼り替え", "基材切れ", "フィルム基材"]);
  const needsRepeatReusableTape =
    criteria.category === "両面テープ" &&
    hasKeyword(allValues, ["何度も貼り直したい", "再利用したい", "繰り返し貼って剥がす", "リワーク", "繰り返し接着可能"]);
  const needsOneSideWeakTape =
    criteria.category === "両面テープ" &&
    hasKeyword(allValues, ["片側弱接着", "片側だけ剥がしたい", "フォームタイプ", "段差追従", "片側超弱接着"]);
  const needsLighterOneSideWeakTape =
    needsOneSideWeakTape && hasKeyword(allValues, ["できるだけ軽く剥がしたい", "弱粘着", "仮固定", "PRO用途", "片側超弱接着"]);
  if (needsRepeatReusableTape && product.id === "9415PC") score += 420;
  if (needsRepeatReusableTape && ["4591HM", "4591HL", "1110", "ST416P"].includes(product.id)) score -= 90;
  if (!needsRepeatReusableTape && needsLighterOneSideWeakTape && product.id === "4591HL") score += 360;
  if (!needsRepeatReusableTape && needsLighterOneSideWeakTape && product.id === "4591HM") score += 40;
  if (!needsRepeatReusableTape && needsLighterOneSideWeakTape && ["1110", "ST416P", "9415PC"].includes(product.id)) score -= 80;
  if (!needsRepeatReusableTape && !needsLighterOneSideWeakTape && needsOneSideWeakTape && product.id === "4591HM") score += 320;
  if (!needsRepeatReusableTape && !needsLighterOneSideWeakTape && needsOneSideWeakTape && product.id === "4591HL") score += 90;
  if (!needsRepeatReusableTape && !needsLighterOneSideWeakTape && needsOneSideWeakTape && ["1110", "ST416P", "9415PC"].includes(product.id)) score -= 80;
  if ((needsOneSideWeakTape || needsRepeatReusableTape) && isVhb(product)) score -= 500;

  if (isRemovableTapeUse && !needsEasyRemoval && product.id === "1110") score += 120;
  if (isRemovableTapeUse && !needsEasyRemoval && product.id === "ST416P") score -= 40;
  if (needsEasyRemoval && product.id === "ST416P") score += 190;
  if (needsEasyRemoval && product.id === "1110") score -= 30;

  for (const feat of criteria.features) {
    if (product.features.includes(feat)) score += 12;
    if (feat === "低VOC" && product.id === "DCX-1018") score += 20;
    if (feat === "再剥離" && product.permanence === "再剥離") score += 15;
    if (feat === "再剥離" && product.permanence === "再剥離可") score += 10;
    if (feat === "透明" && product.features.includes("透明")) score += 10;
    if (feat === "シリコン接着" && product.features.includes("シリコン接着")) score += 25;
    if (feat === "LSE対応" && product.lse) score += 15;
  }

  if (criteria.category === "ファスナー") {
    const needsLowProfile = criteria.features.includes("薄型") || criteria.application.includes("薄型設計固定") || criteria.thickness === "0.1mm";
    const isTransparentFastener = hasKeyword(allValues, ["透明"]);
    const isBlackFastener = hasKeyword(allValues, ["黒", "ブラック"]);
    const needsStrongFastener = includesAny(allValues, ["強固定", "強力固定", "高保持力", "厚手", "構造固定"]);

    if (isTransparentFastener) {
      if (needsStrongFastener && product.id === "SJ3560") score += 260;
      if (needsLowProfile && isLSE && product.id === "SJ4570") score += 280;
      if (needsLowProfile && !isLSE && product.id === "SJ4580") score += 250;
      if (["SJ3540", "SJ3550"].includes(product.id)) score -= 120;
      if (needsLowProfile && !isLSE && product.id === "SJ4570") score -= 40;
      if (needsLowProfile && isLSE && product.id === "SJ4580") score -= 80;
    } else {
      if (needsLowProfile && product.id === "SJ4570") score += 80;
      if (!needsLowProfile && product.id === "SJ4570") score -= 60;
      if (isLSE && product.id === "SJ3540") score += 95;
      if (isLSE && product.id === "SJ3526N") score -= 35;
      if (includesAny(allValues, ["強固定", "パネル", "着脱", "繰り返し", "固定"]) && product.id === "SJ3550") score += 55;
      if (product.id === "SJ3550" && !includesAny(allValues, ["薄型", "薄型設計固定"])) score += 15;
      if (isBlackFastener && ["SJ3560", "SJ4580"].includes(product.id)) score -= 100;
    }
  }

  if (criteria.permanent && product.permanence === "恒久固定") score += 10;
  if (criteria.permanent && product.permanence === "再剥離") score -= 20;
  if (!criteria.permanent && product.permanence === "再剥離") score += 10;
  if (!criteria.permanent && product.permanence === "再剥離可") score += 10;

  if (criteria.priceSensitive && product.price === "economy") score += 15;
  if (criteria.priceSensitive && product.price === "premium") score -= 5;

  const t = thicknessNumber(product.thickness);
  if (isThin && t !== null) {
    if (t <= 0.1) score += 12;
    else if (t > 0.5) score -= 10;
  }
  if (isThick && t !== null && t >= 1.0) score += 10;

  return score;
}

function buildReasons(product: Product, criteria: SelectionCriteria, productIsVhb: boolean): string[] {
  const reasons: string[] = [];
  const allValues = values(criteria);
  const allSubstrates = [criteria.substrateA, criteria.substrateB].filter(Boolean);
  const isLSE = includesAny(allSubstrates, LSE_SUBSTRATES) || allValues.includes("LSE対応");
  const isThin = ["極薄", "0.05mm", "0.1mm"].includes(criteria.thickness) || includesAny(allValues, ["薄手", "薄型"]);
  const isMetalBonding = criteria.category === "接着剤" && includesAny(allSubstrates, METAL_SUBSTRATES);
  const nameplateTargetId = nameplateTargetProductId(criteria);

  if (nameplateTargetId === product.id) {
    reasons.push("銘板やラベルを、指定された厚み条件で無理なく固定しやすい営業標準の選定です");
  }

  if (product.id === "Y4825") {
    reasons.push("国内で提案しやすく、納期や供給面の説明がしやすい標準VHBです");
    reasons.push("粉体塗装工程や金属・樹脂・ガラス固定で実績を説明しやすく、初回提案に向いています");
  }
  if (product.id === "Y4950") {
    reasons.push("Y4825では少し不安が残る高荷重案件で、安全率を上げて提案できます");
    reasons.push("大型パネルや高応力部位など、より強い接合力を求められる場面で説明しやすい製品です");
    reasons.push("150℃以下の使用環境で、強度重視のお客様に出しやすい上位VHBです");
  }
  if (GPH_PRODUCT_IDS.includes(product.id)) reasons.push("軟質PVCや塩ビ素材でも提案しやすく、可塑剤による接着トラブルを避けたい案件に向いています");
  if (GPH_PRODUCT_IDS.includes(product.id)) reasons.push("Y4825で説明しにくい塩ビ案件の代替として、お客様に使い分けを示しやすい製品です");
  if (product.id === "93010LE") reasons.push("PP・PEなどのLSE材で、薄く仕上げたい銘板やラベル固定に提案しやすい製品です");
  if (product.id === "93015LE" && isLSE && !isThin) reasons.push("LSE材で薄さと接着安定性のバランスを取りたい標準案件に向いています");
  if (product.id === "93020LE") reasons.push("LSE材で少し厚みを持たせたい固定に使いやすく、薄手品では不安な案件に提案できます");
  if (product.id === "GPT-020F") reasons.push("LSE材でも価格を優先したい案件で、最初にコストメリットを示しやすい候補です");
  if (product.id === "GPT-020F") reasons.push("高性能より予算重視のお客様に、現実的な落としどころとして提案できます");
  if (product.id === "467MP") reasons.push("UL認証が必要な超薄型ラベル・銘板固定で、認証要求に答えやすい製品です");
  if (product.id === "467MP") reasons.push("クリアランスが厳しい部品でも厚みを増やしにくく、設計変更を抑えて提案できます");
  if (product.id === "468MP") reasons.push("UL認証が必要で、467MPより少し厚みを持たせたい銘板・ラベル固定に向いています");
  if (product.id === "468MP") reasons.push("高耐熱の薄手固定として、認証と作業性の両方を説明しやすい製品です");
  if (product.id === "468MP") reasons.push("0.1〜0.3mm領域の認証用途で、薄すぎる不安を避けたい場合に提案できます");
  if (product.id === "LSE-060WF") reasons.push("LSE材でもフォームの追従性が必要な薄めのVHB案件に提案しやすい製品です");
  if (product.id === "LVO-110BF") reasons.push("LSE材の厚手フォーム固定で、低VOC・低アウトガスも同時に説明できる提案しやすい製品です");
  if (product.id === "LSE-160WF") reasons.push("LSE材でしっかり厚みを持たせ、段差や凹凸も吸収したい案件に向いています");
  if (product.id === "F9460PC") reasons.push("FPCやポリイミド部品で、通常の高耐熱品では説明しきれない260℃級案件に提案できます");
  if (product.id === "F9469PC") reasons.push("薄型設計を維持しながら高温工程に対応したい電子部品固定に向いています");
  if (product.id === "9077") reasons.push("貼ったままリフロー工程を通せるため、工程内固定の手戻りを減らしたいお客様に説明しやすい製品です");
  if (product.id === "Y4924") reasons.push("シリコンゴムのような難しい素材でも、専用品として自信を持って提案できます");
  if (product.id === "Y4924") reasons.push("フォームが段差や凹凸になじむため、シリコン部品の固定で現場の貼り合わせミスを減らしやすい製品です");
  if (product.id === "Y4924") reasons.push("シリコン素材への接着を最優先したい案件で、LSE用テープとの違いを説明しやすい製品です");
  if (product.id === "9119P") reasons.push("シリコンと一般材料を薄く貼り合わせたい場合に、厚みを増やさず提案できます");
  if (product.id === "9119P") reasons.push("薄型設計を崩したくないシリコン部品固定で使いやすい候補です");
  if (product.id === "9119P") reasons.push("片面シリコン・片面アクリル構造なので、異なる材料同士の貼り合わせを説明しやすい製品です");
  if (product.id === "4390") reasons.push("はんだ工程やウェーブソルダー周辺の高温工程で、薄手固定が必要な場合に提案しやすい製品です");
  if (product.id === "4390") reasons.push("ポリイミド基材のため、高温工程に入る電子部品用途で安心材料を示しやすい製品です");
  if (product.id === "4390") reasons.push("シリコン用途でも高温工程が絡む場合に、9119PやY4924との使い分けを説明できます");
  if (product.id === "ST416P") reasons.push("ポリエステルフィルム基材のため、不織布基材より切れにくく、剥離作業が容易です");
  if (product.id === "ST416P") reasons.push("頻繁な貼り替えや、剥がしやすさを重視する用途に適しています");
  if (product.id === "1110") reasons.push("通常の再剥離用途で、貼った後にきれいに剥がしたい案件に提案しやすい標準品です");
  if (product.id === "4591HM") reasons.push("片側だけ弱接着にできるため、フォームで段差に追従しながら片側だけ剥がしたい用途に向いています");
  if (product.id === "4591HL") reasons.push("4591HMよりさらに弱接着で、剥離性を重視した用途に適しています");
  if (product.id === "9415PC") reasons.push("9415PCは繰り返し貼って剥がせる再利用用途向け製品です");
  if (product.id === "9415PC") reasons.push("4591HMや4591HLのような片側弱接着とは用途が異なります");
  if (product.id === "9660") reasons.push("特殊要求がない銘板・ラベル固定で、価格を抑えた提案をしたい場合に使いやすい標準候補です");
  if (product.id === "9660") reasons.push("UL認証やVHB指定がない一般固定なら、過剰スペックを避けて提案できます");
  if (product.id === "9660") reasons.push("コスト重視のお客様に、まず提示しやすい現実的な選択肢です");
  if (product.id === "DCX-1018") reasons.push("低VOC・低アウトガスが必要なフォーム材貼り合わせで、Y4825では説明できない要求に対応できます");
  if (product.id === "DCX-1018") reasons.push("電子機器や光学用途で、揮発成分を嫌うお客様に安心材料を示しやすい製品です");
  if (product.id === "5604") reasons.push("価格を抑えたVHB提案で、0.4mm程度の薄めの固定に使いやすい候補です");
  if (product.id === "5608") reasons.push("価格重視でも少し厚みを持たせたいVHB案件に提案しやすい候補です");
  if (product.id === "5611") reasons.push("価格を抑えながら厚みと追従性も欲しいVHB案件に提案しやすい候補です");
  if (product.id === "5925") reasons.push("粗面でも厚みを目立たせたくない小型部品や銘板固定に提案しやすい製品です");
  if (product.id === "5925") reasons.push("5952ほど厚くしたくない現場で、粗面追従性を残しながらすっきり仕上げられます");
  if (product.id === "5952") reasons.push("粗面やコンクリートでもフォームがなじみやすく、現場で失敗しにくい製品です");
  if (product.id === "5952") reasons.push("コンクリート・モルタル・木材など、表面が荒れた現場用途で最初に提案しやすい営業標準品です");
  if (product.id === "DP8010") reasons.push("PP・PE・TPOのような接着しにくい樹脂で、プライマーなし提案をしやすい接着剤です");
  if (product.id === "メタルボンダー" && isMetalBonding) reasons.push("常温保管可能な金属接着の標準推奨品");
  if (product.id === "メタルボンダー" && isMetalBonding) reasons.push("現場管理が容易で取り扱いやすい");
  if (product.id === "メタルグリップ" && isMetalBonding) reasons.push("冷蔵保管が可能な場合のコスト重視選択肢");
  if (product.id === "メタルグリップ" && isMetalBonding) reasons.push("性能は近いが保管条件に注意");
  if (product.id === "DP420NS") reasons.push("DP420NSは可使時間約20分のため、DP460より早く次工程へ移れます");
  if (product.id === "DP420NS") reasons.push("ノンサグタイプのため、壁面施工や垂直面施工でも液だれしにくい製品です");
  if (product.id === "DP420NS") reasons.push("強度・耐水性・耐候性はDP460と同等レベルですが、作業性に優れています");
  if (product.id === "DP460") reasons.push("可使時間約60分のため、大型部品や位置合わせ時間が必要な作業に適しています");
  if (product.id === "DP8710NS") reasons.push("材料が限定しにくい多用途の構造接着案件で、まず提案しやすい標準アクリル接着剤です");
  if (product.id === "DP125") reasons.push("振動や衝撃がある部位で、硬すぎる接着剤による割れや剥がれを避けたい場合に提案できます");
  if (product.id === "471") reasons.push("床ラインや区画表示をきれいに見せたい工場マーキング用途で、標準品として提案しやすい製品です");
  if (product.id === "5702") {
    reasons.push("5702は黄黒ストライプによる高い視認性を持つ安全表示用ラインテープです");
    reasons.push("危険区域や注意喚起エリアの区画表示に適しています");
    reasons.push("一般的なライン表示用途の471より、安全表示に特化しています");
  }
  if (product.id === "764") reasons.push("ライン表示で価格を優先したい案件に、471よりコストを抑えた選択肢として提案できます");
  if (product.id === "SJ3550") reasons.push("黒色の標準Dual Lockとして、しっかり固定しながら着脱もしたい用途に提案しやすい製品です");
  if (product.id === "SJ3540") reasons.push("PP・PEなど通常の粘着剤が苦手な素材でも、Dual Lock固定を提案しやすい黒タイプです");
  if (product.id === "SJ3560") reasons.push("透明タイプで最大クラスの保持力を持つDual Lockです");
  if (product.id === "SJ4580") reasons.push("透明で薄型設計のDual Lockです");
  if (product.id === "SJ4570") reasons.push("透明薄型タイプで、LSE材にも対応します");

  if (product.features.includes("汎用")) reasons.push("条件がまだ固まりきっていない初期相談でも、まず候補に出しやすい扱いやすい製品です");
  if (product.lse && isLSE) reasons.push("PP・PEなど接着しにくい素材でも、通常品より安心して提案できます");
  if (product.features.includes("シリコン接着")) reasons.push("シリコン素材でありがちな接着不良を避けたい場合に、専用品として説明できます");
  if (product.features.includes("低VOC")) reasons.push("においやアウトガスを嫌う電子機器・車載・光学用途で説明しやすい製品です");
  if (product.features.includes("高耐熱")) reasons.push("高温工程や熱がかかる使用環境でも、通常品より安心して提案できます");
  if (product.features.includes("超高耐熱")) reasons.push("FPCや高温プロセスなど、一般的な高耐熱品では不安な工程向けに提案できます");
  if (product.features.includes("油面対応")) reasons.push("金属面の油分を完全に取り切れない現場でも、提案の幅を残せます");
  if (product.features.includes("再剥離") || product.permanence === "再剥離") reasons.push("剥がす可能性がある用途で、後工程やメンテナンスの負担を抑えやすい製品です");
  if (product.features.includes("柔軟")) reasons.push("振動や衝撃を逃がしたい部位で、硬い接着によるトラブルを避けやすい製品です");
  if (product.features.includes("粗面対応")) reasons.push("コンクリートやモルタルのような荒れた面でも、現場で貼りやすい候補です");
  if (product.features.includes("低温接着")) reasons.push("寒い現場や冬場施工でも、通常品より提案しやすい製品です");
  if (productIsVhb) reasons.push("穴あけやビス止めを避けたいお客様に、外観を保ちながら強く固定する提案ができます");
  if (product.features.includes("フォーム")) reasons.push("段差や曲面になじみやすく、現場での貼り合わせばらつきを吸収しやすい製品です");
  if (product.features.includes("加工性良好")) reasons.push("打ち抜きやスリット加工を前提にした量産案件でも提案しやすい製品です");
  if (product.price === "economy" && criteria.priceSensitive) reasons.push("価格を重視するお客様に、導入しやすい候補として提示できます");

  return [...new Set(reasons)];
}

function buildWarnings(product: Product, criteria: SelectionCriteria): string[] {
  const warnings: string[] = [];
  const allSubstrates = [criteria.substrateA, criteria.substrateB].filter(Boolean);

  if (criteria.permanent && product.permanence === "再剥離") {
    warnings.push("本製品は再剥離タイプのため、恒久固定用途には向きません");
  }
  if (product.category === "両面テープ" && product.subcategory.includes("VHB")) {
    warnings.push("VHBテープは剥がす際に被着体を損傷する可能性があります");
  }
  if (allSubstrates.includes("PP") && !product.lse && product.category !== "接着剤") {
    warnings.push("PPへの接着にはLSE対応品（薄手は93010LE、標準は93015LE等）を推奨します");
  }
  if (criteria.environment.includes("高温") && (product.tempRange?.max ?? 0) < 120) {
    warnings.push(`使用温度上限（${product.tempRange?.max}°C）を超える可能性があります。高耐熱品を検討してください`);
  }
  if (!product.features.includes("シリコン接着") && allSubstrates.some((s) => s.includes("シリコン"))) {
    warnings.push("シリコン素材への接着には用途に応じてY4924・9119P・4390を検討してください");
  }

  return warnings;
}

export function selectProducts(criteria: SelectionCriteria): SelectionResult | null {
  const categoryProducts = products.filter((p) => p.category === criteria.category);
  if (categoryProducts.length === 0) return null;

  const scored = categoryProducts
    .map((p) => ({ product: p, score: calcScore(p, criteria) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const primary = scored[0].product;
  const defaultAlternatives = scored
    .slice(1, 4)
    .filter((x) => x.score >= scored[0].score * 0.5)
    .map((x) => x.product);
  const preferredAlternativeIds =
    primary.id === "Y4825"
      ? gphTargetProductIds(criteria)
      : primary.id === "Y4950"
        ? ["Y4825"]
        : primary.id === "5702"
          ? ["471"]
          : primary.id === "471"
            ? ["5702"]
            : GPH_PRODUCT_IDS.includes(primary.id)
              ? ["Y4825"]
              : primary.id === "メタルグリップ"
            ? ["メタルボンダー"]
            : primary.id === "GPT-020F"
              ? ["93010LE", "93015LE", "93020LE"]
              : primary.id === "ST416P"
                ? ["1110"]
                : primary.id === "1110"
                  ? ["ST416P"]
                  : primary.id === "4591HM"
                    ? ["4591HL"]
                    : primary.id === "4591HL"
                      ? ["4591HM"]
                      : primary.id === "9415PC"
                        ? ["4591HM", "4591HL"]
                        : primary.id === "DP420NS"
                          ? ["DP460"]
                          : primary.id === "DP460"
                            ? ["DP420NS"]
                            : [];
  const preferredAlternatives = preferredAlternativeIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  const usePreferredOnlyAlternatives = ["ST416P", "1110", "4591HM", "4591HL", "9415PC"].includes(primary.id);
  const alternatives = [...preferredAlternatives, ...(usePreferredOnlyAlternatives ? [] : defaultAlternatives)]
    .filter((product, index, list) => product.id !== primary.id && list.findIndex((item) => item.id === product.id) === index)
    .slice(0, 3);

  const productIsVhb = isVhb(primary);
  const reasons = buildReasons(primary, criteria, productIsVhb);
  const warnings = buildWarnings(primary, criteria);

  return {
    primary,
    alternatives,
    reasons,
    warnings,
    category: primary.subcategory,
    matchScore: Math.round(scored[0].score),
  };
}
