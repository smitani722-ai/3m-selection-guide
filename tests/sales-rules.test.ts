import Module from "node:module";
import path from "node:path";

type SelectionCriteria = {
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
};

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    return originalResolveFilename.call(
      this,
      path.join(process.cwd(), request.slice(2)),
      parent,
      isMain,
      options,
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const { selectProducts } = await import("../lib/selectionEngine");

type SalesRuleCase = {
  no: number;
  name: string;
  expected: string;
  criteria: SelectionCriteria;
};

const baseTape: SelectionCriteria = {
  category: "両面テープ",
  application: ["固定"],
  substrateA: "SUS",
  substrateB: "アルミ",
  environment: ["屋内"],
  features: [],
  thickness: "0.8mm",
  processingMethod: "",
  priceSensitive: false,
  permanent: true,
};

const baseAdhesive: SelectionCriteria = {
  category: "接着剤",
  application: ["構造接合"],
  substrateA: "SUS",
  substrateB: "アルミ",
  environment: ["屋内"],
  features: ["高強度"],
  thickness: "指定なし",
  processingMethod: "",
  priceSensitive: false,
  permanent: true,
};

const baseFastener: SelectionCriteria = {
  category: "ファスナー",
  application: ["着脱"],
  substrateA: "SUS",
  substrateB: "アルミ",
  environment: ["屋内"],
  features: ["Dual Lock"],
  thickness: "指定なし",
  processingMethod: "",
  priceSensitive: false,
  permanent: false,
};

const baseLineTape: SelectionCriteria = {
  category: "片面テープ",
  application: ["床ライン"],
  substrateA: "コンクリート",
  substrateB: "コンクリート",
  environment: ["屋内"],
  features: [],
  thickness: "指定なし",
  processingMethod: "",
  priceSensitive: false,
  permanent: true,
};

function tape(criteria: Partial<SelectionCriteria>): SelectionCriteria {
  return { ...baseTape, ...criteria };
}

function adhesive(criteria: Partial<SelectionCriteria>): SelectionCriteria {
  return { ...baseAdhesive, ...criteria };
}

function fastener(criteria: Partial<SelectionCriteria>): SelectionCriteria {
  return { ...baseFastener, ...criteria };
}

function lineTape(criteria: Partial<SelectionCriteria>): SelectionCriteria {
  return { ...baseLineTape, ...criteria };
}

const cases: SalesRuleCase[] = [
  {
    no: 1,
    name: "通常銘板 0.05mm",
    expected: "467MP",
    criteria: tape({ application: ["銘板固定"], thickness: "0.05mm" }),
  },
  {
    no: 2,
    name: "通常銘板 0.2mm",
    expected: "9660",
    criteria: tape({ application: ["銘板固定"], thickness: "0.2mm" }),
  },
  {
    no: 3,
    name: "UL969 0.08mm",
    expected: "467MP",
    criteria: tape({ application: ["銘板固定"], features: ["UL969"], thickness: "0.08mm" }),
  },
  {
    no: 4,
    name: "UL969 0.2mm",
    expected: "468MP",
    criteria: tape({ application: ["銘板固定"], features: ["UL969"], thickness: "0.2mm" }),
  },
  {
    no: 5,
    name: "標準VHB 国内高温",
    expected: "Y4825",
    criteria: tape({ features: ["VHB", "高接着"], environment: ["高温"], thickness: "0.8mm" }),
  },
  {
    no: 6,
    name: "粉体塗装工程",
    expected: "Y4825",
    criteria: tape({ features: ["VHB", "JIS Z1541", "粉体塗装", "180℃"], environment: ["高温"], thickness: "0.8mm" }),
  },
  {
    no: 7,
    name: "金属構造接合VHB",
    expected: "Y4825",
    criteria: tape({ application: ["構造接合"], features: ["VHB", "高接着"], substrateA: "SUS", substrateB: "鉄", thickness: "1.1mm" }),
  },
  {
    no: 8,
    name: "超高強度VHB",
    expected: "Y4950",
    criteria: tape({ application: ["構造接合"], features: ["VHB", "超高強度VHB", "高荷重", "高応力", "150℃以下"], thickness: "1.1mm" }),
  },
  {
    no: 9,
    name: "価格重視VHB 0.4mm",
    expected: "5604",
    criteria: tape({ features: ["VHB"], thickness: "0.4mm", priceSensitive: true }),
  },
  {
    no: 10,
    name: "価格重視VHB 0.8mm",
    expected: "5608",
    criteria: tape({ features: ["VHB"], thickness: "0.8mm", priceSensitive: true }),
  },
  {
    no: 11,
    name: "価格重視VHB 1.1mm",
    expected: "5611",
    criteria: tape({ features: ["VHB"], thickness: "1.1mm", priceSensitive: true }),
  },
  {
    no: 12,
    name: "リフロー工程",
    expected: "9077",
    criteria: tape({ application: ["耐熱"], substrateA: "ポリイミド", substrateB: "銅箔", features: ["リフロー", "SMT", "工程内固定"], environment: ["超高温"], thickness: "0.05mm" }),
  },
  {
    no: 13,
    name: "FPC 260℃ 0.05mm",
    expected: "F9460PC",
    criteria: tape({ substrateA: "ポリイミド", substrateB: "SUS", features: ["FPC", "ポリイミド", "260℃"], environment: ["高温"], thickness: "0.05mm" }),
  },
  {
    no: 14,
    name: "FPC 260℃ 0.13mm",
    expected: "F9469PC",
    criteria: tape({ substrateA: "ポリイミド", substrateB: "SUS", features: ["FPC", "ポリイミド", "260℃"], environment: ["高温"], thickness: "0.13mm" }),
  },
  {
    no: 15,
    name: "LSE薄手",
    expected: "93010LE",
    criteria: tape({ substrateA: "PP", substrateB: "PE", features: ["LSE対応"], thickness: "0.05mm" }),
  },
  {
    no: 16,
    name: "LSE標準",
    expected: "93015LE",
    criteria: tape({ substrateA: "PP", substrateB: "PE", features: ["LSE対応"], thickness: "0.15mm" }),
  },
  {
    no: 17,
    name: "LSE厚手",
    expected: "93020LE",
    criteria: tape({ substrateA: "PP", substrateB: "PE", features: ["LSE対応"], thickness: "0.3mm" }),
  },
  {
    no: 18,
    name: "LSE価格重視",
    expected: "GPT-020F",
    criteria: tape({ substrateA: "PP", substrateB: "PE", features: ["LSE対応"], thickness: "0.2mm", priceSensitive: true }),
  },
  {
    no: 19,
    name: "LSEフォーム 0.6mm",
    expected: "LSE-060WF",
    criteria: tape({ substrateA: "PP", substrateB: "PE", features: ["LSE対応", "VHB", "フォーム"], thickness: "0.6mm" }),
  },
  {
    no: 20,
    name: "LSEフォーム 1.1mm",
    expected: "LVO-110BF",
    criteria: tape({ substrateA: "PP", substrateB: "PE", features: ["LSE対応", "VHB", "フォーム"], thickness: "1.1mm" }),
  },
  {
    no: 21,
    name: "LSEフォーム 1.6mm",
    expected: "LSE-160WF",
    criteria: tape({ substrateA: "PP", substrateB: "PE", features: ["LSE対応", "VHB", "フォーム"], thickness: "1.6mm" }),
  },
  {
    no: 22,
    name: "軟質PVC 0.6mm",
    expected: "GPH-060GF",
    criteria: tape({ substrateA: "軟質PVC", substrateB: "ビニール", features: ["VHB", "耐可塑剤"], thickness: "0.6mm" }),
  },
  {
    no: 23,
    name: "軟質PVC 1.1mm",
    expected: "GPH-110GF",
    criteria: tape({ substrateA: "軟質PVC", substrateB: "ビニール", features: ["VHB", "耐可塑剤"], thickness: "1.1mm" }),
  },
  {
    no: 24,
    name: "軟質PVC 1.6mm",
    expected: "GPH-160GF",
    criteria: tape({ substrateA: "軟質PVC", substrateB: "ビニール", features: ["VHB", "耐可塑剤"], thickness: "1.6mm" }),
  },
  {
    no: 25,
    name: "フォーム低VOC",
    expected: "DCX-1018",
    criteria: tape({ application: ["フォーム材貼り合わせ"], substrateA: "フォーム材", substrateB: "フォーム材", features: ["低VOC", "低アウトガス", "フォーム材"], thickness: "0.2mm" }),
  },
  {
    no: 26,
    name: "粗面小面積",
    expected: "5925",
    criteria: tape({ substrateA: "コンクリート", substrateB: "コンクリート", features: ["粗面対応", "小面積", "薄く仕上げたい"], thickness: "0.6mm" }),
  },
  {
    no: 27,
    name: "粗面大面積",
    expected: "5952",
    criteria: tape({ substrateA: "コンクリート", substrateB: "コンクリート", features: ["粗面対応", "大面積", "追従性重視"], thickness: "1.1mm" }),
  },
  {
    no: 28,
    name: "段差吸収",
    expected: "5952",
    criteria: tape({ substrateA: "コンクリート", substrateB: "モルタル", features: ["段差吸収", "防振", "凹凸追従"], thickness: "1.1mm" }),
  },
  {
    no: 29,
    name: "木材粗面 0.6mm",
    expected: "5925",
    criteria: tape({ substrateA: "木材", substrateB: "木材", features: ["粗面対応"], thickness: "0.6mm" }),
  },
  {
    no: 30,
    name: "木材粗面 1.1mm",
    expected: "5952",
    criteria: tape({ substrateA: "木材", substrateB: "木材", features: ["粗面対応"], thickness: "1.1mm" }),
  },
  {
    no: 31,
    name: "シリコン薄手",
    expected: "9119P",
    criteria: tape({ substrateA: "シリコンゴム", substrateB: "SUS", features: ["シリコン接着", "薄手"], thickness: "0.1mm" }),
  },
  {
    no: 32,
    name: "シリコン厚手",
    expected: "Y4924",
    criteria: tape({ substrateA: "シリコンゴム", substrateB: "SUS", features: ["シリコン接着", "厚手", "段差吸収"], thickness: "0.4mm" }),
  },
  {
    no: 33,
    name: "シリコン高耐熱",
    expected: "4390",
    criteria: tape({ substrateA: "シリコンゴム", substrateB: "ポリイミド", features: ["シリコン用途", "ポリイミド", "高耐熱", "200℃"], environment: ["高温"], thickness: "0.13mm" }),
  },
  {
    no: 34,
    name: "ウェーブソルダー",
    expected: "4390",
    criteria: tape({ substrateA: "シリコンゴム", substrateB: "ポリイミド", features: ["シリコン用途", "ウェーブソルダー"], environment: ["高温"], thickness: "0.13mm" }),
  },
  {
    no: 35,
    name: "通常再剥離",
    expected: "1110",
    criteria: tape({ application: ["再剥離"], features: ["再剥離"], thickness: "0.1mm", permanent: false }),
  },
  {
    no: 36,
    name: "剥がしやすさ重視",
    expected: "ST416P",
    criteria: tape({ application: ["再剥離"], features: ["再剥離", "剥がしやすさ重視", "フィルム基材希望"], thickness: "0.1mm", permanent: false }),
  },
  {
    no: 37,
    name: "片側弱接着",
    expected: "4591HM",
    criteria: tape({ application: ["片側弱接着"], features: ["片側弱接着", "フォームタイプ", "段差追従"], thickness: "0.8mm", permanent: false }),
  },
  {
    no: 38,
    name: "片側超弱接着",
    expected: "4591HL",
    criteria: tape({ application: ["片側弱接着"], features: ["片側弱接着", "弱粘着", "PRO用途"], thickness: "0.8mm", permanent: false }),
  },
  {
    no: 39,
    name: "繰り返し再利用",
    expected: "9415PC",
    criteria: tape({ application: ["再利用"], features: ["繰り返し貼って剥がす", "再利用したい", "リワーク"], thickness: "0.05mm", permanent: false }),
  },
  {
    no: 40,
    name: "金属同士標準",
    expected: "メタルボンダー",
    criteria: adhesive({ application: ["構造接合"], substrateA: "SUS", substrateB: "アルミ", features: ["金属接着", "高強度", "構造接着"], priceSensitive: false }),
  },
  {
    no: 41,
    name: "金属同士価格重視・冷蔵可",
    expected: "メタルグリップ",
    criteria: adhesive({ application: ["構造接合"], substrateA: "SUS", substrateB: "アルミ", features: ["金属接着", "高強度", "冷蔵保管可能"], priceSensitive: true }),
  },
  {
    no: 42,
    name: "金属同士価格重視・冷蔵不可",
    expected: "メタルボンダー",
    criteria: adhesive({ application: ["構造接合"], substrateA: "SUS", substrateB: "アルミ", features: ["金属接着", "高強度", "常温保管"], priceSensitive: true }),
  },
  {
    no: 43,
    name: "異種材料エポキシ",
    expected: "DP460",
    criteria: adhesive({ substrateA: "SUS", substrateB: "ガラス", features: ["高強度", "長い作業時間"] }),
  },
  {
    no: 44,
    name: "短時間・垂直面施工",
    expected: "DP420NS",
    criteria: adhesive({ substrateA: "SUS", substrateB: "ABS", features: ["ノンサグ", "垂直面施工", "タクトタイム短縮"] }),
  },
  {
    no: 45,
    name: "PP/PE接着",
    expected: "DP8010",
    criteria: adhesive({ substrateA: "PP", substrateB: "PE", features: ["LSE対応", "PP接着"] }),
  },
  {
    no: 46,
    name: "難接着エンプラ",
    expected: "DP8910NS",
    criteria: adhesive({ substrateA: "ナイロン", substrateB: "POM", features: ["難接着材", "エンプラ"] }),
  },
  {
    no: 47,
    name: "多用途構造接着",
    expected: "DP8710NS",
    criteria: adhesive({ substrateA: "ABS", substrateB: "PC", features: ["多用途", "高強度"], priceSensitive: false }),
  },
  {
    no: 48,
    name: "柔軟・耐衝撃",
    expected: "DP125",
    criteria: adhesive({ substrateA: "SUS", substrateB: "ABS", environment: ["振動"], features: ["柔軟", "耐衝撃", "防振"] }),
  },
  {
    no: 49,
    name: "黒LSE Dual Lock",
    expected: "SJ3540",
    criteria: fastener({ substrateA: "PP", substrateB: "PE", features: ["黒", "LSE対応", "Dual Lock"] }),
  },
  {
    no: 50,
    name: "黒標準 Dual Lock",
    expected: "SJ3550",
    criteria: fastener({ substrateA: "SUS", substrateB: "アルミ", features: ["黒", "強固定", "Dual Lock"] }),
  },
  {
    no: 51,
    name: "透明強力 Dual Lock",
    expected: "SJ3560",
    criteria: fastener({ substrateA: "SUS", substrateB: "ガラス", features: ["透明", "強固定", "高保持力"], thickness: "1mm以上" }),
  },
  {
    no: 52,
    name: "透明薄型 Dual Lock",
    expected: "SJ4580",
    criteria: fastener({ substrateA: "SUS", substrateB: "ガラス", features: ["透明", "薄型"], thickness: "0.1mm" }),
  },
  {
    no: 53,
    name: "透明薄型LSE Dual Lock",
    expected: "SJ4570",
    criteria: fastener({ substrateA: "PP", substrateB: "PE", features: ["透明", "薄型", "LSE対応"], thickness: "0.1mm" }),
  },
  {
    no: 54,
    name: "通常ライン表示",
    expected: "471",
    criteria: lineTape({ application: ["床ライン", "区画表示", "通路表示"], priceSensitive: false }),
  },
  {
    no: 55,
    name: "危険区域表示",
    expected: "5702",
    criteria: lineTape({ application: ["床ライン", "安全表示"], features: ["黄黒ストライプ", "危険表示", "視認性重視"], priceSensitive: false }),
  },
  {
    no: 56,
    name: "価格重視ライン",
    expected: "764",
    criteria: lineTape({ application: ["床ライン", "区画表示"], priceSensitive: true }),
  },
  {
    no: 57,
    name: "コンクリート1.1mm",
    expected: "5952",
    criteria: tape({ substrateA: "コンクリート", substrateB: "コンクリート", features: ["粗面対応"], thickness: "1.1mm" }),
  },
  {
    no: 58,
    name: "モルタル1.1mm",
    expected: "5952",
    criteria: tape({ substrateA: "モルタル", substrateB: "モルタル", features: ["粗面対応"], thickness: "1.1mm" }),
  },
  {
    no: 59,
    name: "コンクリート0.6mm",
    expected: "5925",
    criteria: tape({ substrateA: "コンクリート", substrateB: "コンクリート", features: ["粗面対応"], thickness: "0.6mm" }),
  },
  {
    no: 60,
    name: "UL不要価格重視銘板",
    expected: "9660",
    criteria: tape({ application: ["銘板固定"], features: [], thickness: "0.2mm", priceSensitive: true }),
  },
];

const failures = cases
  .map((testCase) => {
    const result = selectProducts(testCase.criteria);
    return {
      ...testCase,
      actual: result?.primary.id ?? "(no recommendation)",
    };
  })
  .filter((result) => result.actual !== result.expected);

if (failures.length > 0) {
  console.error(`FAIL ${cases.length - failures.length}/${cases.length}`);
  for (const failure of failures) {
    console.error(
      `No.${failure.no} ${failure.name}: expected ${failure.expected}, actual ${failure.actual}`,
    );
  }
  process.exit(1);
}

console.log(`PASS ${cases.length}/${cases.length}`);
