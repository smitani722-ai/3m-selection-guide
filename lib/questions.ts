export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface Question {
  id: string;
  text: string;
  subtext?: string;
  type: "single" | "multi" | "boolean";
  options: QuestionOption[];
  criteriaKey: string;
}

// ─── STEP 0: カテゴリ選択（共通） ─────────────────────────
export const categoryQuestion: Question = {
  id: "category",
  text: "何を選定したいですか？",
  subtext: "製品カテゴリを選択してください",
  type: "single",
  criteriaKey: "category",
  options: [
    { value: "両面テープ", label: "両面テープ", description: "薄手・VHB・フォームテープ等", icon: "🔲" },
    { value: "接着剤", label: "接着剤", description: "2液エポキシ・変成アクリル系", icon: "💉" },
    { value: "ファスナー", label: "ファスナー", description: "Dual Lock / Hook & Loop", icon: "🔗" },
    { value: "片面テープ", label: "片面テープ", description: "マスキング・絶縁・アルミテープ等", icon: "📏" },
  ],
};

// ─── 被着体選択肢（両面テープ・接着剤共通） ─────────────────
const substrateOptions: QuestionOption[] = [
  { value: "SUS", label: "SUS（ステンレス）" },
  { value: "アルミ", label: "アルミニウム" },
  { value: "鉄", label: "鉄・スチール" },
  { value: "ガラス", label: "ガラス・セラミック" },
  { value: "ABS", label: "ABS樹脂" },
  { value: "PC", label: "PC（ポリカーボネート）" },
  { value: "PP", label: "PP（ポリプロピレン）" },
  { value: "PE", label: "PE（ポリエチレン）" },
  { value: "ナイロン", label: "ナイロン・POM・PBT" },
  { value: "EPDM", label: "EPDM・ゴム" },
  { value: "シリコン", label: "シリコン・シリコンゴム" },
  { value: "木材", label: "木材・合板" },
  { value: "コンクリート", label: "コンクリート・モルタル" },
  { value: "塗装面", label: "塗装面・プライマー処理面" },
];

// ─── 両面テープ フロー（8問） ──────────────────────────────
export const tapeQuestions: Question[] = [
  {
    id: "substrateA",
    text: "被着体A（一方の面）の素材は？",
    subtext: "両面テープを貼り付ける一方の面の素材",
    type: "single",
    criteriaKey: "substrateA",
    options: substrateOptions,
  },
  {
    id: "substrateB",
    text: "被着体B（もう一方の面）の素材は？",
    subtext: "同じ素材でも可",
    type: "single",
    criteriaKey: "substrateB",
    options: substrateOptions,
  },
  {
    id: "tempEnv",
    text: "使用温度・環境は？",
    subtext: "最も厳しい条件を選択してください",
    type: "single",
    criteriaKey: "tempEnv",
    options: [
      { value: "normal", label: "常温屋内（〜60°C）", description: "一般的な室内使用" },
      { value: "outdoor", label: "屋外・耐候性が必要", description: "紫外線・雨・温度変化あり" },
      { value: "warm", label: "高温（60〜150°C）", description: "電気部品・自動車内装等" },
      { value: "hot", label: "高耐熱（150〜200°C）", description: "粉体塗装乾燥工程・150〜200°C高温プロセス" },
      { value: "superhot", label: "超高温（200°C超）", description: "FPC・高温プロセス・工業炉等" },
    ],
  },
  {
    id: "fixType",
    text: "固定の種類は？",
    type: "single",
    criteriaKey: "fixType",
    options: [
      { value: "permanent", label: "恒久固定（剥がさない）", description: "貼り替え不要" },
      { value: "removable", label: "再剥離（きれいに剥がしたい）", description: "糊残りなし・跡が残らない" },
      { value: "temp", label: "仮固定・位置決め", description: "後で位置調整や貼り替えあり" },
    ],
  },
  {
    id: "specialNeeds",
    text: "特殊な要件はありますか？",
    subtext: "複数選択可。なければ「特になし」",
    type: "multi",
    criteriaKey: "specialNeeds",
    options: [
      { value: "lowVOC", label: "低VOC・低アウトガス", description: "電子機器・光学部品・クリーンルーム" },
      { value: "silicone", label: "シリコン素材への接着", description: "シリコンゴム・シリコン樹脂" },
      { value: "roughSurface", label: "粗面・コンクリートへの固定", description: "建設・外壁・凹凸面" },
      { value: "foam", label: "段差吸収・防振が必要", description: "フォームテープ（1mm以上）" },
      { value: "vhb", label: "超高強度が必要（VHB）", description: "リベット・溶接代替レベルの固定力" },
      { value: "none", label: "特になし", description: "" },
    ],
  },
  {
    id: "thickness",
    text: "厚みの制約は？",
    type: "single",
    criteriaKey: "thickness",
    options: [
      { value: "極薄", label: "極薄（0.1mm以下）" },
      { value: "0.1mm", label: "薄手（0.1〜0.3mm）" },
      { value: "0.5mm", label: "中程度（0.3〜1mm）" },
      { value: "1mm以上", label: "厚手・フォーム（1mm以上）" },
      { value: "指定なし", label: "指定なし" },
    ],
  },
  {
    id: "processing",
    text: "加工・使用方法は？",
    subtext: "加工性が重要な場合は選択してください",
    type: "single",
    criteriaKey: "processing",
    options: [
      { value: "handCut", label: "手貼り・ハサミで切って使う" },
      { value: "diecut", label: "打ち抜き加工（型抜き）" },
      { value: "slit", label: "スリット・ロール加工" },
      { value: "auto", label: "自動貼付機で使う" },
      { value: "any", label: "加工方法の指定なし" },
    ],
  },
  {
    id: "priceSensitive",
    text: "コスト重視ですか？",
    subtext: "性能よりコストを優先する場合は「はい」",
    type: "boolean",
    criteriaKey: "priceSensitive",
    options: [
      { value: "false", label: "いいえ（性能優先）" },
      { value: "true", label: "はい（コスト重視）" },
    ],
  },
];

// ─── 接着剤 フロー（7問） ──────────────────────────────────
export const adhesiveQuestions: Question[] = [
  {
    id: "substrateA",
    text: "接着する一方の素材は？",
    type: "single",
    criteriaKey: "substrateA",
    options: substrateOptions,
  },
  {
    id: "substrateB",
    text: "もう一方の素材は？",
    subtext: "異種材料の接合（金属×樹脂など）も可",
    type: "single",
    criteriaKey: "substrateB",
    options: substrateOptions,
  },
  {
    id: "specialEnv",
    text: "特殊な使用条件はありますか？",
    subtext: "複数選択可。なければ「特になし」",
    type: "multi",
    criteriaKey: "specialEnv",
    options: [
      { value: "油面", label: "油面・脱脂困難な面への接着", description: "機械・工場のメンテナンス等" },
      { value: "高温", label: "高温環境（80°C以上）", description: "エンジン周辺・高温プロセス" },
      { value: "薬品", label: "薬品・溶剤にさらされる", description: "化学・医療・洗浄工程" },
      { value: "振動", label: "振動・衝撃が繰り返し加わる", description: "輸送機器・産業機械" },
      { value: "none", label: "特になし（一般環境）", description: "" },
    ],
  },
  {
    id: "strength",
    text: "求める接着特性は？",
    type: "single",
    criteriaKey: "strength",
    options: [
      { value: "ultraHigh", label: "超高強度・剛性重視", description: "金属構造接合・リベット代替" },
      { value: "flexible", label: "柔軟性・衝撃吸収重視", description: "振動・変形・熱膨張差あり" },
      { value: "balanced", label: "汎用（バランス型）", description: "特に制約なし・多用途" },
    ],
  },
  {
    id: "workTime",
    text: "塗布後の作業時間（ポットライフ）は？",
    subtext: "混合後に位置決め・貼り合わせができる時間",
    type: "single",
    criteriaKey: "workTime",
    options: [
      { value: "fast", label: "5分以内（即固定したい）" },
      { value: "medium", label: "5〜30分" },
      { value: "slow", label: "30分以上（じっくり作業したい）" },
      { value: "any", label: "指定なし" },
    ],
  },
  {
    id: "cureTime",
    text: "実用強度が出るまでの時間要件は？",
    type: "single",
    criteriaKey: "cureTime",
    options: [
      { value: "fast", label: "1時間以内に使いたい" },
      { value: "medium", label: "数時間でOK（当日中）" },
      { value: "slow", label: "翌日でOK（じっくり硬化）" },
      { value: "any", label: "指定なし" },
    ],
  },
  {
    id: "priceSensitive",
    text: "コスト重視ですか？",
    type: "boolean",
    criteriaKey: "priceSensitive",
    options: [
      { value: "false", label: "いいえ（性能優先）" },
      { value: "true", label: "はい（コスト重視）" },
    ],
  },
];

// ─── ファスナー フロー（6問） ──────────────────────────────
export const fastenerQuestions: Question[] = [
  {
    id: "detachFreq",
    text: "着脱の頻度は？",
    subtext: "ファスナーを開閉する頻度を選択",
    type: "single",
    criteriaKey: "detachFreq",
    options: [
      { value: "frequent", label: "頻繁（1日数回以上）", description: "繰り返し再使用・着脱サイクル多数" },
      { value: "occasional", label: "時々（週1〜月1程度）", description: "定期的なパネル・カバーの開閉" },
      { value: "rare", label: "ほぼ固定（メンテ時のみ）", description: "年数回・交換時のみ開閉" },
    ],
  },
  {
    id: "fixStrength",
    text: "必要な保持力・固定強度は？",
    type: "single",
    criteriaKey: "fixStrength",
    options: [
      { value: "high", label: "強固定（しっかり固定）", description: "パネル・カバー・外装部品等" },
      { value: "standard", label: "標準（一般的な保持力）", description: "軽い部品・表示板等" },
      { value: "light", label: "軽荷重（軽く止まればOK）", description: "書類・薄いシート等" },
    ],
  },
  {
    id: "substrateA",
    text: "ファスナーを貼り付ける面の素材は？",
    type: "single",
    criteriaKey: "substrateA",
    options: [
      { value: "PP", label: "PP・PE等の難接着プラスチック", description: "プライマーなしでの接着が必要" },
      { value: "ABS", label: "ABS・PC・金属・塗装面・その他", description: "一般的な被着体" },
    ],
  },
  {
    id: "outdoor",
    text: "屋外・耐候性が必要ですか？",
    type: "boolean",
    criteriaKey: "outdoor",
    options: [
      { value: "false", label: "いいえ（屋内のみ）" },
      { value: "true", label: "はい（屋外・雨・UV あり）" },
    ],
  },
  {
    id: "needsThin",
    text: "高さ（厚み）の制約はありますか？",
    subtext: "標準Dual Lockは片側約6.4mm、薄型SJ4570は片側約3.5mm",
    type: "boolean",
    criteriaKey: "needsThin",
    options: [
      { value: "false", label: "なし（高さ制約なし）" },
      { value: "true", label: "あり（できるだけ薄くしたい）" },
    ],
  },
  {
    id: "colorReq",
    text: "色指定はありますか？",
    subtext: "見た目・意匠要件がある場合は選択してください",
    type: "single",
    criteriaKey: "colorReq",
    options: [
      { value: "黒", label: "黒", description: "工業用途・機器内部・汎用" },
      { value: "白", label: "白", description: "家電・医療・意匠重視" },
      { value: "透明", label: "透明", description: "ガラス・ディスプレイ・サイン用途" },
      { value: "none", label: "指定なし", description: "色の制約なし" },
    ],
  },
  {
    id: "priceSensitive",
    text: "コスト重視ですか？",
    type: "boolean",
    criteriaKey: "priceSensitive",
    options: [
      { value: "false", label: "いいえ（性能優先）" },
      { value: "true", label: "はい（コスト重視）" },
    ],
  },
];

// ─── 片面テープ フロー（6問） ─────────────────────────────
export const singleTapeQuestions: Question[] = [
  {
    id: "mainPurpose",
    text: "主な用途は？",
    type: "single",
    criteriaKey: "mainPurpose",
    options: [
      { value: "marking", label: "床・設備のラインマーキング", description: "工場床・通路の色分け等" },
      { value: "insulation", label: "電気絶縁・ハーネス結束", description: "配線・ケーブルの絶縁・束ねる" },
      { value: "waterproof", label: "防水・ケーブル防水（自己融着）", description: "屋外ジョイント・接続部保護" },
      { value: "aluminum", label: "熱反射・EMIシールド・ダクト補修", description: "アルミ箔テープ用途" },
      { value: "protection", label: "表面保護・補強", description: "傷付き防止・補強テープ" },
      { value: "masking", label: "マスキング（塗装・めっき保護）", description: "塗装マスク・工程保護" },
    ],
  },
  {
    id: "substrateA",
    text: "貼り付ける面の素材は？",
    type: "single",
    criteriaKey: "substrateA",
    options: [
      { value: "SUS", label: "金属（SUS・アルミ・鉄）" },
      { value: "ABS", label: "樹脂・プラスチック" },
      { value: "コンクリート", label: "コンクリート・木材" },
      { value: "配線", label: "配線・ケーブル" },
    ],
  },
  {
    id: "heatReq",
    text: "耐熱温度の要件は？",
    type: "single",
    criteriaKey: "heatReq",
    options: [
      { value: "normal", label: "常温〜80°C（一般用途）" },
      { value: "medium", label: "80〜150°C（中高温）" },
      { value: "high", label: "150°C以上（高耐熱）" },
    ],
  },
  {
    id: "handCut",
    text: "手でカットして使いますか？",
    subtext: "ハサミ・カッターなしで手でちぎる必要があるか",
    type: "boolean",
    criteriaKey: "handCut",
    options: [
      { value: "true", label: "はい（手でサクッと切れてほしい）" },
      { value: "false", label: "いいえ（ハサミ・カッター使用）" },
    ],
  },
  {
    id: "otherReqs",
    text: "その他、必要な特性は？",
    subtext: "複数選択可",
    type: "multi",
    criteriaKey: "otherReqs",
    options: [
      { value: "outdoor", label: "屋外・耐候性" },
      { value: "chemical", label: "耐薬品・耐溶剤" },
      { value: "waterproof", label: "防水・自己融着" },
      { value: "ul", label: "UL規格認定（電気用途必須）" },
      { value: "none", label: "特になし" },
    ],
  },
  {
    id: "priceSensitive",
    text: "コスト重視ですか？",
    type: "boolean",
    criteriaKey: "priceSensitive",
    options: [
      { value: "false", label: "いいえ（性能優先）" },
      { value: "true", label: "はい（コスト重視）" },
    ],
  },
];

// ─── 用途選択 質問（カテゴリ選択直後・Step 1） ───────────────

export const tapeApplicationQuestion: Question = {
  id: "applicationContext",
  text: "主な用途・目的は何ですか？",
  subtext: "用途に合わせて最適な製品を優先します",
  type: "single",
  criteriaKey: "applicationContext",
  options: [
    { value: "銘板固定",         label: "銘板・ラベル固定",         description: "金属・樹脂への銘板・ネームプレートの恒久固定" },
    { value: "FPC固定",          label: "FPC・電子部品固定",         description: "フレキシブル基板・電子部品の超高耐熱固定" },
    { value: "フォーム貼り合わせ", label: "フォーム材の貼り合わせ・防振", description: "段差・曲面追従、防振・衝撃吸収" },
    { value: "LCD固定",          label: "LCD・光学部品固定",         description: "低VOC・低アウトガスが必要な光学・電子部品" },
    { value: "シリコン固定",     label: "シリコン素材への固定",       description: "シリコンゴム・シリコン樹脂への接着" },
    { value: "建材固定",         label: "建材・外壁パネル固定",       description: "VHBを使った建設・建材の恒久固定" },
    { value: "粗面固定",         label: "粗面・コンクリートへの固定", description: "凹凸面・コンクリート・モルタルへの強力固定" },
    { value: "パネル固定",       label: "金属・樹脂パネル固定",       description: "産業機器・筐体パネルの構造固定（VHB）" },
    { value: "ガラス固定",       label: "ガラス・サッシへの固定",     description: "ガラス面への高強度固定（VHB）" },
    { value: "車内装",           label: "車両内装・自動車部品",       description: "自動車内装・外装部品のテープ固定" },
    { value: "高耐熱用途",       label: "高温・高耐熱用途",           description: "粉体塗装乾燥工程・高温環境用途（150〜200°C）" },
    { value: "指定なし",         label: "指定なし",                   description: "被着体・条件から総合選定" },
  ],
};

export const adhesiveApplicationQuestion: Question = {
  id: "applicationContext",
  text: "主な接着用途は何ですか？",
  subtext: "用途に合わせて接着剤の種類を絞り込みます",
  type: "single",
  criteriaKey: "applicationContext",
  options: [
    { value: "金属接着",   label: "金属同士の接着",       description: "SUS・アルミ・鉄など金属の構造接合" },
    { value: "プラスチック接着", label: "プラスチックの接着", description: "ABS・PC・PP等の樹脂部品の接合" },
    { value: "ゴム接着",   label: "ゴム・エラストマーの接着", description: "EPDM・シリコンゴム等への接着" },
    { value: "異種材接着", label: "異種材料の接合",         description: "金属×樹脂・樹脂×ゴム等の異材接合" },
    { value: "油面接着",   label: "油面への接着",           description: "脱脂困難・油が残った金属面への接着" },
    { value: "高耐熱接着", label: "高温環境での接着",       description: "150°C以上の高温にさらされる接着部位" },
    { value: "柔軟接着",   label: "柔軟・防振接着",         description: "振動・衝撃を受ける部品の弾性接合" },
    { value: "指定なし",   label: "指定なし",               description: "条件から総合選定" },
  ],
};

export const fastenerApplicationQuestion: Question = {
  id: "applicationContext",
  text: "主な使い方・用途は何ですか？",
  subtext: "着脱スタイルや用途に合わせて最適品を選びます",
  type: "single",
  criteriaKey: "applicationContext",
  options: [
    { value: "頻繁着脱", label: "頻繁な着脱（1日複数回）", description: "繰り返し何度も着脱するサイクル用途" },
    { value: "仮固定",   label: "仮固定・位置決め",         description: "位置を確認してから本固定する用途" },
    { value: "展示用途", label: "展示・POP・ディスプレイ",   description: "見た目を重視した展示・サイン固定" },
    { value: "屋外固定", label: "屋外・耐候性が必要",       description: "雨・UV・温度変化のある屋外用途" },
    { value: "家電内装", label: "家電・OA機器の内部固定",   description: "省スペース・白色が必要な内装用途" },
    { value: "サイン用途", label: "サイン・透明パーツ固定", description: "透明・目立たない固定が必要な用途" },
    { value: "指定なし", label: "指定なし",                 description: "着脱頻度・強度から選定" },
  ],
};

// ─── カテゴリ別フロー取得 ──────────────────────────────────
export function getQuestionsForCategory(category: string): Question[] {
  switch (category) {
    case "両面テープ": return [tapeApplicationQuestion, ...tapeQuestions];
    case "接着剤":    return [adhesiveApplicationQuestion, ...adhesiveQuestions];
    case "ファスナー": return [fastenerApplicationQuestion, ...fastenerQuestions];
    case "片面テープ": return singleTapeQuestions;  // mainPurposeが用途選択を兼ねる
    default:          return [];
  }
}

export function getTotalSteps(category: string): number {
  return 1 + getQuestionsForCategory(category).length;
}
