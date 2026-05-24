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

  // ── シンプル版（1〜2行）──────────────────────────────────────
  // 製品説明をベースに、主要理由1文を添える
  // 理由文の末尾が丁寧語（〜です／〜ます）で終わる場合は「。今回の条件に最適です。」
  // 名詞・形容詞句で終わる場合は「ため、今回の条件に最適です。」で自然に接続する
  const coreReason = reasons[0]
    ? (() => {
        const r = reasons[0].replace(/[。]$/, "");
        return r.endsWith("す")
          ? r + "。今回の条件に最適です。"
          : r + "ため、今回の条件に最適です。";
      })()
    : "選定条件との総合評価で最も推奨されます。";
  const simple = `${primary.name}をお勧めします。${coreReason}`;

  // ── 標準版（3〜4行）──────────────────────────────────────────
  const standardParts: string[] = [
    `今回の条件には ${primary.name}（${category}）が最適です。`,
  ];
  reasons.slice(0, 2).forEach((r) => standardParts.push(`・${r}`));
  if (altName) {
    standardParts.push(
      `代替として ${altName}（${altSub}）もご提案できます。`
    );
  }
  const standard = standardParts.join("\n");

  // ── 詳しい版（しっかり説明）───────────────────────────────────
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
