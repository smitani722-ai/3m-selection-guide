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
  competitors: Array<{
    manufacturer: string;
    model: string;
    verified: boolean;      // false の場合は表示しない（実在未確認）
    discontinued: boolean;  // true の場合は表示しない（販売終了品）
    source: string;         // 情報ソース・確認日
  }>;
  workTime?: string;
  cureTime?: string;
  colors?: string[];
  // ドキュメントリンク（将来的にJSONで追加可能）
  productPageUrl?: string | null;
  dataSheetUrl?: string | null;
  catalogUrl?: string | null;
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
  color?: string;
  applicationContext?: string;  // 用途から選ぶ: 銘板固定 / FPC固定 / 金属接着 etc.
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

const LSE_SUBSTRATES = ["PP", "PE", "TPO", "TPE", "LSE材", "シリコン", "シリコンゴム", "ナイロン", "POM", "PBT", "PA"];

function calcScore(product: Product, criteria: SelectionCriteria): number {
  let score = 0;
  const allSubstrates = [criteria.substrateA, criteria.substrateB].filter(Boolean);

  if (product.category !== criteria.category) return -1;

  const isLSE = allSubstrates.some((s) => LSE_SUBSTRATES.includes(s));
  const isSilicone = allSubstrates.some((s) => s.includes("シリコン"));
  const isNylon = allSubstrates.some((s) => ["ナイロン", "POM", "PBT", "PA"].includes(s));
  const isRough = allSubstrates.some((s) => ["コンクリート", "モルタル"].includes(s));
  const isOil = criteria.environment.includes("油");
  const isHighTemp = criteria.environment.includes("高温") || criteria.environment.includes("超高温");
  const isLowTemp = criteria.environment.includes("低温");
  const isChemical = criteria.environment.includes("薬品");
  const isVibration = criteria.environment.includes("振動");

  // Substrate scoring
  for (const substrate of allSubstrates) {
    if (product.substrates.includes(substrate)) score += 10;
    else if (product.substrates.some((s) => s.includes(substrate) || substrate.includes(s))) score += 5;
  }

  // LSE logic
  if (isLSE && product.lse) score += 20;
  if (isLSE && !product.lse && !isSilicone) score -= 25;

  // Silicone specialization
  if (isSilicone) {
    if (product.features.includes("シリコン接着")) score += 50;
    else score -= 30;
  }

  // Nylon specialization
  if (isNylon && product.id === "DP8910NS") score += 35;

  // Rough surface
  if (isRough && product.id === "5952") score += 35;

  // Application scoring
  for (const app of criteria.application) {
    if (product.applications?.includes(app)) score += 8;
  }

  // Environment scoring
  for (const env of criteria.environment) {
    if (product.environment?.includes(env)) score += 5;
  }

  // Temperature scoring
  if (isHighTemp) {
    const tempMax = product.tempRange?.max ?? 0;
    if (tempMax >= 200) score += 25;
    else if (tempMax >= 150) score += 12;
    else if (tempMax < 100) score -= 25;
  }

  // Special environment matches
  if (isLowTemp && product.id === "56415") score += 25;
  if (isOil && product.id === "メタルグリップ") score += 40;
  if (isChemical && product.features.includes("耐薬品")) score += 20;
  if (isVibration && product.features.some((f) => ["防振", "柔軟", "耐衝撃"].includes(f))) score += 18;

  // Feature scoring
  for (const feat of criteria.features) {
    if (product.features.includes(feat)) score += 12;
    if (feat === "低VOC" && product.id === "DCX-1018") score += 25;
    if (feat === "再剥離" && product.permanence === "再剥離") score += 18;
    if (feat === "再剥離" && product.permanence === "再剥離可") score += 10;
    if (feat === "シリコン接着" && product.features.includes("シリコン接着")) score += 30;
    if (feat === "LSE対応" && product.lse) score += 18;
  }

  // Permanence logic
  if (criteria.permanent && product.permanence === "恒久固定") score += 10;
  if (criteria.permanent && product.permanence === "再剥離") score -= 25;
  if (!criteria.permanent && product.permanence === "再剥離") score += 12;
  if (!criteria.permanent && product.permanence === "再剥離可") score += 8;

  // VHB × 再剥離要求 — カテゴリ分離ルール
  // 再剥離・着脱・仮固定要求がある場合にVHBをスコアから除外（ペナルティ）
  const needsRemovable =
    !criteria.permanent ||
    criteria.features.includes("再剥離") ||
    criteria.application.some((a) => ["再剥離", "仮固定", "着脱"].includes(a));
  if (needsRemovable && product.subcategory.includes("VHB")) score -= 60;

  // Price sensitivity
  if (criteria.priceSensitive && product.price === "economy") score += 18;
  if (criteria.priceSensitive && product.price === "premium") score -= 8;
  if (!criteria.priceSensitive && product.price === "economy") score -= 3;

  // Thickness preference
  if (criteria.thickness === "極薄") {
    const t = parseFloat(product.thickness ?? "99");
    if (t <= 0.06) score += 12;
    else if (t > 0.5) score -= 12;
  }
  if (criteria.thickness === "1mm以上") {
    const t = parseFloat(product.thickness ?? "0");
    if (t >= 1.0) score += 12;
    else score -= 5;
  }

  // 色・外観スコアリング（ファスナー）
  // 一致 → +15 / 不一致 → -10（機能要件より優先度低・ソフト制約）
  if (criteria.color && criteria.color !== "none" && criteria.color !== "指定なし") {
    const productColors = product.colors;
    if (productColors && productColors.length > 0) {
      if (productColors.includes(criteria.color)) score += 15;
      else score -= 10;
    }
  }

  // 用途コンテキストによる追加スコア
  if (criteria.applicationContext && criteria.applicationContext !== "指定なし") {
    score += calcApplicationBoost(product, criteria.applicationContext);
  }

  return score;
}

// 用途コンテキスト別スコアブースト
// 汎用スコアリングエンジンが拾いにくい「用途固有の優先度」を補完する
function calcApplicationBoost(product: Product, appCtx: string): number {
  let boost = 0;
  const feats = product.features;
  const sub = product.subcategory;

  switch (appCtx) {
    // ── 両面テープ ──────────────────────────────────────────
    case "銘板固定":
      // 薄手テープ（薄型・加工性あり）を優先
      if (sub.includes("薄手")) boost += 20;
      if (feats.includes("加工性良好") || feats.includes("汎用")) boost += 10;
      if (feats.includes("高接着")) boost += 8;
      break;

    case "FPC固定":
      // 超高耐熱・FPC対応を強くブースト
      if (feats.includes("超高耐熱") || feats.includes("FPC対応")) boost += 45;
      if ((product.tempRange?.max ?? 0) >= 200) boost += 20;
      if (product.id === "9077") boost += 15; // FPC定番品
      break;

    case "フォーム貼り合わせ":
      // フォーム基材を強くブースト
      if (feats.includes("フォーム")) boost += 45;
      if (feats.includes("段差追従") || feats.includes("段差吸収")) boost += 15;
      break;

    case "LCD固定":
      // 低VOC・光学用途を強くブースト
      if (feats.includes("低VOC") || feats.includes("低アウトガス")) boost += 45;
      if (feats.includes("光学用途") || feats.includes("クリーンルーム対応")) boost += 20;
      if (feats.includes("薄型")) boost += 10;
      break;

    case "シリコン固定":
      // シリコン接着専用品（pre-seed済みだが念のためブースト）
      if (feats.includes("シリコン接着")) boost += 35;
      break;

    case "建材固定":
    case "パネル固定":
    case "ガラス固定":
    case "車内装":
      // VHBシリーズをブースト
      if (feats.includes("VHB") || sub.includes("VHB")) boost += 35;
      if (feats.includes("超高強度")) boost += 15;
      if (feats.includes("高接着") || feats.includes("高強度")) boost += 8;
      // ガラス固定：ガラスを被着体に持つ製品を追加ブースト
      if (appCtx === "ガラス固定" && product.substrates.includes("ガラス")) boost += 15;
      // 車内装：自動車内外装実績を持つ製品をブースト
      if (appCtx === "車内装" && (product.id === "Y4825" || product.id === "Y4950")) boost += 15;
      break;

    case "粗面固定":
      // 粗面対応を強くブースト（calcScoreの5952ボーナスに積み上げ）
      if (feats.includes("粗面対応")) boost += 35;
      break;

    case "高耐熱用途":
      // 高耐熱・超高耐熱品をブースト
      if (feats.includes("超高耐熱")) boost += 40;
      if (feats.includes("高耐熱")) boost += 25;
      if ((product.tempRange?.max ?? 0) >= 200) boost += 20;
      // GPHはVHBかつ高耐熱
      if (feats.includes("VHB") || sub.includes("VHB")) boost += 10;
      break;

    // ── 接着剤 ───────────────────────────────────────────────
    case "金属接着":
      if (feats.includes("金属接着")) boost += 35;
      if (product.substrates.some((s) => ["SUS", "アルミ", "鉄"].includes(s))) boost += 10;
      break;

    case "プラスチック接着":
      if (feats.includes("多用途") || feats.includes("汎用")) boost += 25;
      if (product.substrates.some((s) => ["ABS", "PC", "PP"].includes(s))) boost += 15;
      break;

    case "ゴム接着":
      if (product.substrates.some((s) => ["ゴム", "EPDM"].includes(s))) boost += 35;
      if (feats.includes("柔軟")) boost += 15;
      break;

    case "異種材接着":
      if (feats.includes("多用途") || feats.includes("汎用")) boost += 35;
      // 幅広い被着体リストを持つ製品をブースト
      if (product.substrates.length >= 5) boost += 10;
      break;

    case "油面接着":
      // pre-seed済みだがブースト追加
      if (feats.includes("油面対応") || feats.some((f) => f.includes("油面"))) boost += 45;
      break;

    case "高耐熱接着":
      if (feats.includes("高耐熱")) boost += 35;
      if ((product.tempRange?.max ?? 0) >= 150) boost += 20;
      break;

    case "柔軟接着":
      if (feats.includes("柔軟")) boost += 40;
      if (feats.includes("弾性") || feats.includes("耐衝撃") || feats.includes("防振")) boost += 15;
      break;

    // ── ファスナー ───────────────────────────────────────────
    case "頻繁着脱":
      // Dual Lockは高着脱耐久性
      if (sub.includes("Dual Lock")) boost += 30;
      if (feats.includes("再使用可")) boost += 15;
      // 強固定Dual Lockが頻繁着脱向け
      if (product.id === "SJ3540") boost += 20;
      break;

    case "仮固定":
      // 再剥離タイプが仮固定向け
      if (feats.includes("再剥離")) boost += 30;
      if (product.permanence === "再剥離") boost += 15;
      break;

    case "展示用途":
      // 透明色が優先
      if (product.colors?.includes("透明")) boost += 30;
      if (product.id === "SJ3550") boost += 15; // 透明対応再剥離型
      break;

    case "サイン用途":
      // 透明色・目立たない固定
      if (product.colors?.includes("透明")) boost += 35;
      if (feats.includes("薄型")) boost += 10;
      break;

    case "屋外固定":
      // 屋外対応製品（ファスナーのうちSJ3540が耐久性高い）
      if (product.id === "SJ3540") boost += 25;
      if (product.environment?.includes("屋外")) boost += 15;
      break;

    case "家電内装":
      // 薄型・白色が優先
      if (feats.includes("薄型")) boost += 30;
      if (product.id === "SJ4570") boost += 20;
      if (product.colors?.includes("白")) boost += 15;
      break;

    default:
      break;
  }

  return boost;
}

function buildReasons(product: Product, criteria: SelectionCriteria): string[] {
  const reasons: string[] = [];
  const allSubstrates = [criteria.substrateA, criteria.substrateB].filter(Boolean);
  const isLSE = allSubstrates.some((s) => LSE_SUBSTRATES.includes(s));

  if (product.features.includes("汎用")) reasons.push("汎用性が高く、多くの被着体に対応します");
  if (product.lse && isLSE) reasons.push("PP・PE等のLSE（低表面エネルギー）素材への接着に対応した専用品です");
  if (product.features.includes("シリコン接着")) reasons.push("シリコン素材専用の接着成分を使用しており、一般テープでは不可能なシリコン接着を実現します");
  if (product.features.includes("低VOC")) reasons.push("低VOC・低アウトガス仕様で、電子機器・光学部品・クリーンルーム用途に適合します");
  if (product.features.includes("高耐熱")) reasons.push(`優れた高耐熱性（最大${product.tempRange?.max ?? ""}°C）により、高温環境での長期安定使用が可能です`);
  if (product.features.includes("超高耐熱")) reasons.push(`超高耐熱性（最大${product.tempRange?.max ?? ""}°C）で、FPC実装・高温プロセスにも対応します`);
  if (product.features.includes("油面対応")) reasons.push("油が付着した金属面でも強固に接着する特殊処方です");
  if (product.permanence === "再剥離" || product.features.includes("再剥離")) reasons.push("糊残りなく綺麗に再剥離できるため、貼り直しや仮固定に最適です");
  if (product.features.includes("柔軟")) reasons.push("優れた柔軟性・弾性で振動・衝撃を吸収し、応力集中を防ぎます");
  if (product.features.includes("粗面対応")) reasons.push("コンクリート・モルタル等の粗い表面に食い込む特殊接着剤層で、粗面固定に特化しています");
  if (product.features.includes("低温接着")) reasons.push("低温環境（-40°Cまで）でも高い初期タックを維持し、寒冷地での施工に最適です");
  if (product.subcategory.includes("VHB")) reasons.push("VHBテープは構造接合レベルの超高強度を持ち、ボルト・リベットの代替になる接合強度を発揮します");
  if (product.features.includes("フォーム")) reasons.push("フォーム基材が段差・曲面に追従し、不均一な面への密着性を確保します");
  if (product.features.includes("加工性良好")) reasons.push("打ち抜き・スリット加工が容易で、量産工程への組み込みが可能です");
  if (criteria.priceSensitive && product.price === "economy") reasons.push("コストパフォーマンスに優れ、大量使用にも対応できます");

  // 色・外観条件の影響を理由として追加
  if (criteria.color && criteria.color !== "none" && criteria.color !== "指定なし" && product.colors) {
    if (product.colors.includes(criteria.color)) {
      reasons.push(`「${criteria.color}」のご指定に対して、${criteria.color}色バリアントが標準ラインアップにあります`);
    }
  }

  // 用途コンテキストが影響した場合の理由追記
  const appCtx = criteria.applicationContext;
  if (appCtx && appCtx !== "指定なし") {
    const appMap: Record<string, string> = {
      "銘板固定":         "銘板・ラベルの恒久固定に適した薄手・加工性に優れる製品です",
      "FPC固定":          "FPC（フレキシブル基板）実装・電子部品固定の超高耐熱要件に対応します",
      "フォーム貼り合わせ": "フォーム基材により段差・曲面追従と防振性を両立します",
      "LCD固定":          "低VOC・低アウトガス仕様で光学部品・電子機器内部に適合します",
      "シリコン固定":     "シリコン素材専用の接着成分で、通常テープでは不可能なシリコン固定を実現します",
      "建材固定":         "建設・建材用途のVHBシリーズで、ボルト代替レベルの構造固定力を発揮します",
      "粗面固定":         "コンクリート・粗面への食い込みに特化したVHB粗面対応品です",
      "パネル固定":       "産業機器・筐体パネルの構造固定に実績のあるVHBシリーズです",
      "ガラス固定":       "ガラス被着体への高強度固定に対応するVHBシリーズです",
      "車内装":           "自動車内外装部品の固定に実績の多いVHBシリーズです",
      "高耐熱用途":       "200°C超の高温プロセス・エンジン周辺にも対応する高耐熱品です",
      "金属接着":         "金属面への高い親和性と接合強度を持つ接着剤です",
      "プラスチック接着": "幅広いプラスチック素材に対応する多用途接着剤です",
      "ゴム接着":         "ゴム・エラストマー系素材への接着実績がある製品です",
      "異種材接着":       "異なる素材の組み合わせに対応する多用途設計です",
      "油面接着":         "脱脂困難な油面でも強固に接着する特殊処方です",
      "高耐熱接着":       "150°C以上の高温にも耐える接着性能を持ちます",
      "柔軟接着":         "弾性・柔軟性に優れ、振動・衝撃・熱膨張差のある用途に最適です",
      "頻繁着脱":         "繰り返し着脱サイクルに対応した高耐久ファスナーです",
      "仮固定":           "位置決め・仮固定に適した着脱タイプです",
      "展示用途":         "展示・ディスプレイ用途の見た目を損なわない透明色対応品です",
      "屋外固定":         "屋外・耐候性用途に対応した信頼性の高いファスナーです",
      "家電内装":         "OA機器・家電内部への省スペース薄型固定に対応します",
      "サイン用途":       "透明・目立たないサイン・パーツ固定に最適な仕様です",
    };
    const appReason = appMap[appCtx];
    if (appReason && !reasons.some((r) => r.includes(appCtx))) {
      reasons.unshift(appReason);
    }
  }

  return reasons.length > 0 ? reasons : ["選定条件との総合評価で最も高いスコアを獲得しました"];
}

function buildWarnings(product: Product, criteria: SelectionCriteria): string[] {
  const warnings: string[] = [];
  const allSubstrates = [criteria.substrateA, criteria.substrateB].filter(Boolean);

  // 再剥離タイプ → 代替案を提示
  if (criteria.permanent && product.permanence === "再剥離") {
    warnings.push("再剥離タイプのため貼り直しが可能ですが、完全固定が必要な場合は代替候補の恒久固定品もご提案できます");
  }
  // VHB → 使用注意（再剥離カテゴリとは別物である点を明示）
  if (product.subcategory.includes("VHB")) {
    warnings.push("VHBは超強力接着のため、剥離時に被着体破壊や糊残りが発生する場合があります。再剥離用途には適しません。位置を確認してから本貼りしてください");
  }
  // VHB + 非恒久（再剥離・着脱要求あり）→ カテゴリ変更を積極提案
  if (product.subcategory.includes("VHB") && (!criteria.permanent || criteria.features.includes("再剥離"))) {
    warnings.push("着脱・再剥離が必要な場合は、VHBではなくDual Lock（SJ3540シリーズ）やファスナーカテゴリをご検討ください。カテゴリをファスナーに変更してご相談いただくと的確なご提案ができます");
  }
  // PP + 非LSE → LSE変更を積極提案
  if (allSubstrates.includes("PP") && !product.lse && product.category !== "接着剤") {
    warnings.push("PP素材への接着をより確実にするには、LSE専用品（93015LE等）がお勧めです。まず小面積でのテスト貼りをお試しください");
  }
  // 高温 + 低耐熱 → 高耐熱品を具体的に案内
  if (criteria.environment.includes("高温") && (product.tempRange?.max ?? 0) < 120) {
    warnings.push(`使用温度上限（${product.tempRange?.max}°C）を超える環境では、高耐熱品（467MP・GPHシリーズ）への変更でより安心です。すぐご提案できます`);
  }
  // シリコン + 非専用品 → 専用品へ誘導 + サンプル提供
  if (allSubstrates.some((s) => s.includes("シリコン")) && !product.features.includes("シリコン接着")) {
    warnings.push("シリコン素材には専用品が必要です。9119P（薄手タイプ）または4390（フォームタイプ）に変更するとしっかり固定できます。サンプルもご提供できます");
  }
  // 可使時間 → 手順相談を促す
  if (product.workTime) {
    warnings.push(`混合後の可使時間は${product.workTime}です。時間内に貼り合わせを完了させてください。作業手順のご相談も承ります`);
  }

  // 色条件 → 代替案への誘導
  if (criteria.color && criteria.color !== "none" && criteria.color !== "指定なし" && product.colors) {
    if (!product.colors.includes(criteria.color)) {
      warnings.push(`「${criteria.color}」のご要望ですが、本製品は${product.colors.join("・")}展開です。代替候補に${criteria.color}対応品がありますのでご確認ください`);
    } else if (product.colors.length === 1) {
      warnings.push(`本製品は${product.colors[0]}のみの展開です。他の色が必要な場合は代替候補をご案内できます`);
    }
  }

  return warnings;
}

// 「営業現場で実際に置き換え提案できるか」を判定する
// 用途特性・接着メカニズム・対象市場が一致する製品のみ代替候補とする
function isValidAlternative(
  candidate: Product,
  primary: Product,
  criteria: SelectionCriteria
): boolean {
  const allSubstrates = [criteria.substrateA, criteria.substrateB].filter(Boolean);
  const isSilicone = allSubstrates.some((s) => s.includes("シリコン"));
  const isRough = allSubstrates.some((s) => ["コンクリート", "モルタル"].includes(s));
  const isLSE = allSubstrates.some((s) => LSE_SUBSTRATES.includes(s));
  const isOil = criteria.environment.includes("油");

  // ① 用途固有の制約（最重要）——これが違えば代替にならない
  // シリコン接着専用品でなければシリコン用途の代替不可
  if (isSilicone && !candidate.features.includes("シリコン接着")) return false;
  // 粗面対応でなければ粗面用途の代替不可
  if (isRough && !candidate.features.includes("粗面対応")) return false;
  // LSE対応でなければLSE素材の代替不可（シリコン専用品は別ルートで判定済み）
  if (isLSE && !isSilicone && !candidate.lse) return false;
  // 油面対応でなければ油面用途の代替不可
  if (isOil && !candidate.features.some((f) => ["油面対応", "油面接着"].includes(f))) return false;

  // ② 特殊機能要件——criteriaで明示された必須特性
  if (criteria.features.includes("低VOC") && !candidate.features.includes("低VOC")) return false;
  if (criteria.features.includes("フォーム") && !candidate.features.includes("フォーム")) return false;
  // 再剥離が必須なのに恒久固定品は不可
  if (criteria.features.includes("再剥離") && candidate.permanence === "恒久固定") return false;

  // VHB × 再剥離カテゴリ分離ルール
  // 再剥離・着脱・仮固定要求がある場合、VHBは代替候補にも出さない
  const needsRemovableAlt =
    !criteria.permanent ||
    criteria.features.includes("再剥離") ||
    criteria.application.some((a) => ["再剥離", "仮固定", "着脱"].includes(a));
  if (needsRemovableAlt && candidate.subcategory.includes("VHB")) return false;

  // ③ 耐熱要件——primaryが担保している耐熱性の70%以上をカバーすること
  if (criteria.environment.includes("高温") && primary.tempRange) {
    const threshold = primary.tempRange.max * 0.7;
    if ((candidate.tempRange?.max ?? 0) < threshold) return false;
  }

  // ④ 用途コンテキスト固有の代替制約
  const appCtx = criteria.applicationContext;
  if (appCtx && appCtx !== "指定なし") {
    // FPC固定：超高耐熱品のみ代替可
    if (appCtx === "FPC固定" && (candidate.tempRange?.max ?? 0) < 200) return false;
    // LCD固定：低VOC品のみ代替可
    if (appCtx === "LCD固定" && !candidate.features.includes("低VOC")) return false;
    // フォーム貼り合わせ：フォーム品のみ代替可
    if (appCtx === "フォーム貼り合わせ" && !candidate.features.includes("フォーム")) return false;
    // VHB系用途：VHB品のみ代替可
    if (["建材固定", "パネル固定", "ガラス固定", "車内装"].includes(appCtx)) {
      if (!candidate.features.includes("VHB") && !candidate.subcategory.includes("VHB")) return false;
    }
    // 油面接着：油面対応品のみ代替可
    if (appCtx === "油面接着" && !candidate.features.some((f) => f.includes("油面"))) return false;
    // 柔軟接着：柔軟性を持つ品のみ代替可
    if (appCtx === "柔軟接着" && !candidate.features.includes("柔軟")) return false;
    // 高耐熱接着：150°C以上品のみ代替可
    if (appCtx === "高耐熱接着" && (candidate.tempRange?.max ?? 0) < 150) return false;
  }

  return true;
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

  // 上位7件から用途適合品のみ抽出し、最大3件を代替候補とする
  // スコア閾値（30%）は残すが、isValidAlternativeによる用途適合チェックを優先
  const alternatives = scored
    .slice(1, 8)
    .filter((x) => x.score >= scored[0].score * 0.30)
    .filter((x) => isValidAlternative(x.product, primary, criteria))
    .slice(0, 3)
    .map((x) => x.product);

  const reasons = buildReasons(primary, criteria);
  const warnings = buildWarnings(primary, criteria);

  return {
    primary,
    alternatives,
    reasons,
    warnings,
    category: primary.subcategory,
    matchScore: Math.min(99, Math.round((scored[0].score / 120) * 100)),
  };
}
