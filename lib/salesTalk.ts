import type { SelectionResult } from "./selectionEngine";

export interface SalesTalk {
  simple: string;
  standard: string;
  detailed: string;
}


export function generateSalesTalk(result: SelectionResult): SalesTalk {
  const { primary, reasons, alternatives, category, matchScore } = result;

  const altName = alternatives[0]?.name ?? "";
  const altSub = alternatives[0]?.subcategory ?? "";

  // ── 床マーキングテープ専用トーク ─────────────────────────────
  // 971L / 471 / 764 は用途が明確なため、lineFeature文脈に合わせた自然なトークを生成する
  const isFloorMarking =
    (["971L", "471", "764"] as string[]).includes(primary.id) &&
    primary.features.includes("マーキング");

  if (isFloorMarking) {
    const r0 = (reasons[0] ?? primary.description).replace(/[。]$/, "");

    // contextフレーズ: ユーザーが選んだ「重視する特性」に基づく自然な書き出し
    let ctx = "";
    if (primary.id === "971L") {
      ctx = "フォークリフト・重量車両が通行する工場床には";
    } else if (primary.id === "471") {
      if (r0.includes("剥がし") || r0.includes("糊残り")) {
        ctx = "貼り替えや糊残りを抑えたいマーキングには";
      } else if (r0.includes("めくれ") || r0.includes("密着")) {
        ctx = "端部のめくれ・剥がれが気になる歩行エリアには";
      } else if (r0.includes("曲線") || r0.includes("コーナー")) {
        ctx = "曲線・コーナーラインのマーキングには";
      } else {
        ctx = "視認性重視のラインマーキングには";
      }
    } else if (primary.id === "764") {
      ctx = "一般直線ラインのコスト重視用途には";
    }

    const simple = `${ctx}${primary.name}をお勧めします。${r0}。`;

    const standardParts: string[] = [
      `今回の床マーキング用途には${primary.name}が最適です。`,
      ...reasons.slice(0, 2).map((r) => `・${r}`),
    ];
    if (altName) standardParts.push(`代替として${altName}（${altSub}）もご提案できます。`);
    const standard = standardParts.join("\n");

    const reasonLines = reasons.map((r) => `  ・${r}`).join("\n");
    const altSection =
      alternatives.length > 0
        ? "\n【代替候補】\n" +
          alternatives.map((a) => `  ・${a.name}（${a.subcategory}）\n    ${a.description}`).join("\n")
        : "";
    const noteSection = primary.notes ? `\n【バリエーション・補足】\n  ${primary.notes}` : "";
    const detailed = [
      `【推奨製品】3M ${primary.name}　${category}`,
      `マッチ度：${matchScore}%`,
      "",
      "【選定理由】",
      reasonLines,
      noteSection,
      altSection,
    ].join("\n").trim();

    return { simple, standard, detailed };
  }

  // ── 汎用トーク（マーキング以外） ─────────────────────────────

  // ── シンプル版（1〜2行）
  // 理由文が丁寧語（〜す）で終わる場合はそのまま締め、
  // 体言止め・形容詞句の場合は「ため、今回の条件に最適です。」で自然接続する
  const coreReason = reasons[0]
    ? (() => {
        const r = reasons[0].replace(/[。]$/, "");
        return r.endsWith("す")
          ? r + "。今回の条件に最適です。"
          : r + "ため、今回の条件に最適です。";
      })()
    : "選定条件との総合評価で最も推奨されます。";
  const simple = `${primary.name}をお勧めします。${coreReason}`;

  // ── 標準版（3〜4行）
  const standardParts: string[] = [
    `今回の条件には ${primary.name}（${category}）が最適です。`,
  ];
  reasons.slice(0, 2).forEach((r) => standardParts.push(`・${r}`));
  if (altName) {
    standardParts.push(`代替として ${altName}（${altSub}）もご提案できます。`);
  }
  const standard = standardParts.join("\n");

  // ── 詳しい版
  const reasonLines = reasons.map((r) => `  ・${r}`).join("\n");
  const altSection =
    alternatives.length > 0
      ? "\n【代替候補】\n" +
        alternatives
          .map((a) => `  ・${a.name}（${a.subcategory}）\n    ${a.description}`)
          .join("\n")
      : "";
  const noteSection = primary.notes
    ? `\n【バリエーション・補足】\n  ${primary.notes}`
    : "";
  const detailed = [
    `【推奨製品】3M ${primary.name}　${category}`,
    `マッチ度：${matchScore}%`,
    "",
    "【選定理由】",
    reasonLines,
    noteSection,
    altSection,
  ]
    .join("\n")
    .trim();

  return { simple, standard, detailed };
}
