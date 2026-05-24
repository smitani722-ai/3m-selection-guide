"use client";

import { useState } from "react";
import { SelectionResult } from "@/lib/selectionEngine";
import { generateSalesTalk, CLOSING_LINES } from "@/lib/salesTalk";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, ChevronRight, Copy, Check, MessageSquare,
  Lightbulb, Package, Star, Award, ArrowRight,
  FileText, Globe, Download,
} from "lucide-react";

interface ResultCardProps {
  result: SelectionResult;
}

const priceLabel: Record<string, string> = {
  economy: "経済的",
  standard: "標準グレード",
  premium: "ハイグレード",
};

const priceBadgeClass: Record<string, string> = {
  economy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  standard: "bg-blue-100 text-blue-700 border-blue-200",
  premium: "bg-purple-100 text-purple-700 border-purple-200",
};

const colorDotClass: Record<string, string> = {
  "黒": "bg-gray-900 border-gray-700",
  "白": "bg-white border-gray-400",
  "透明": "bg-gradient-to-br from-gray-100 to-blue-50 border-gray-300",
  "グレー": "bg-gray-400 border-gray-500",
};

function CopyButton({ text, size = "sm" }: { text: string; size?: "sm" | "xs" }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handle}
      className={cn(
        "flex items-center gap-1 rounded-lg border transition-all",
        size === "xs"
          ? "px-2 py-1 text-[11px]"
          : "px-3 py-1.5 text-xs",
        copied
          ? "border-green-400 bg-green-50 text-green-700"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
      )}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "コピー済み" : "コピー"}
    </button>
  );
}

type TalkMode = "simple" | "standard" | "detailed";
const TALK_TABS: { key: TalkMode; label: string }[] = [
  { key: "simple", label: "シンプル" },
  { key: "standard", label: "標準" },
  { key: "detailed", label: "詳しい" },
];

export function ResultCard({ result }: ResultCardProps) {
  const { primary, alternatives, reasons, warnings, category, matchScore } = result;
  const talk = generateSalesTalk(result);
  const [talkMode, setTalkMode] = useState<TalkMode>("standard");

  const currentTalk = talk[talkMode];

  return (
    <div className="space-y-4">

      {/* ① 推奨製品ヒーロー ──────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-red-600 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white px-6 pt-5 pb-6">
          <div className="flex items-center gap-1.5 text-red-200 text-[11px] font-bold uppercase tracking-widest mb-3">
            <Star size={11} />
            推奨製品
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-4xl font-black tracking-tight leading-none">{primary.name}</h2>
              <p className="text-red-200 text-sm mt-1.5">{category}</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-red-300 uppercase tracking-wider">マッチ度</div>
                <div className="text-2xl font-black tabular-nums">{matchScore}<span className="text-sm font-normal text-red-200">%</span></div>
              </div>
            </div>
          </div>

          <p className="text-red-100 text-sm mt-3 leading-relaxed">{talk.simple}</p>
        </div>

        <div className="bg-white px-6 py-4 space-y-3">
          {/* スペック */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
            {primary.thickness && (
              <span>厚み：<strong className="text-gray-800">{primary.thickness}</strong></span>
            )}
            {primary.tempRange && (
              <span>温度範囲：<strong className="text-gray-800">{primary.tempRange.min}〜{primary.tempRange.max}°C</strong></span>
            )}
            {primary.workTime && (
              <span>可使時間：<strong className="text-gray-800">{primary.workTime}</strong></span>
            )}
            {primary.cureTime && (
              <span>硬化時間：<strong className="text-gray-800">{primary.cureTime}</strong></span>
            )}
          </div>

          {/* タグ & グレード */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              priceBadgeClass[primary.price] ?? "bg-gray-100 text-gray-700"
            )}>
              {priceLabel[primary.price] ?? primary.price}
            </span>
            {primary.features.slice(0, 5).map((f) => (
              <span key={f} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">
                {f}
              </span>
            ))}
          </div>

          {/* 色展開（ファスナーのみ） */}
          {primary.colors && primary.colors.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-400">展開色：</span>
              {primary.colors.map((c) => (
                <div key={c} className="flex items-center gap-1">
                  <span className={cn("w-4 h-4 rounded-full border-2", colorDotClass[c] ?? "bg-gray-300 border-gray-400")} />
                  <span className="text-xs text-gray-600">{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* ドキュメントリンク */}
          <ProductLinks product={primary} />
        </div>
      </div>

      {/* ② 営業トーク ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare size={14} className="text-red-600" />
              営業トーク
            </h3>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {TALK_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTalkMode(t.key)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    talkMode === t.key
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
            {currentTalk}
          </pre>
          <div className="flex justify-end mt-3">
            <CopyButton text={currentTalk} />
          </div>
        </div>
      </div>

      {/* ③ 選定理由 ─────────────────────────────────────────────── */}
      {reasons.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-red-600" />
              なぜこの製品か
            </h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ④ 対策・補足（solution型） ────────────────────────────── */}
      {(warnings.length > 0 || primary.notes) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-amber-100">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-600" />
              ご確認と対策
            </h3>
          </div>
          <ul className="divide-y divide-amber-100">
            {warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                <ArrowRight size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-amber-900 leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
          {primary.notes && (
            <div className="px-5 py-3.5 border-t border-amber-100 bg-amber-50/60">
              <p className="text-xs text-amber-800 leading-relaxed flex items-start gap-2">
                <ChevronRight size={13} className="mt-0.5 flex-shrink-0 text-amber-500" />
                {primary.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ⑤ 代替候補 ─────────────────────────────────────────────── */}
      {alternatives.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Award size={12} />
            代替候補製品
          </h3>
          <div className="space-y-2.5">
            {alternatives.map((alt) => (
              <div key={alt.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Package size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{alt.name}</span>
                      <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {alt.subcategory}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{alt.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {alt.features.slice(0, 4).map((f) => (
                        <span key={f} className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                    {/* 代替品の色展開 */}
                    {alt.colors && alt.colors.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-gray-400">展開色：</span>
                        {alt.colors.map((c) => (
                          <div key={c} className="flex items-center gap-0.5">
                            <span className={cn("w-3 h-3 rounded-full border", colorDotClass[c] ?? "bg-gray-300 border-gray-400")} />
                            <span className="text-[11px] text-gray-500">{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 競合比較 */}
      {primary.competitors && primary.competitors.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">近い競合品との比較</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-5 text-gray-400 font-medium text-xs">製品名</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">区分</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-red-50">
                <td className="py-2.5 px-5 font-bold text-red-700">3M {primary.name}</td>
                <td className="py-2.5 px-3 text-xs text-red-500 font-medium">本推奨品</td>
              </tr>
              {primary.competitors.map((comp, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 px-5 text-gray-600">
                    <span className="text-gray-500 text-xs mr-1">{comp.manufacturer}</span>
                    <span className="font-medium">{comp.model}</span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-400">競合品</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ⑥ クロージング ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={14} className="text-gray-500" />
            クロージング一言
            <span className="text-xs text-gray-400 font-normal">クリックでコピー</span>
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {CLOSING_LINES.map((line, i) => (
            <ClosingLine key={i} line={line} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ドキュメントリンク ──────────────────────────────────────
// 将来的にproducts.jsonへURLを追記するだけで自動表示される構造
function ProductLinks({ product }: { product: import("@/lib/selectionEngine").Product }) {
  const hasAny = product.dataSheetUrl || product.productPageUrl || product.catalogUrl;
  if (!hasAny) return null;

  return (
    <div className="pt-3 mt-1 border-t border-gray-100">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">製品ドキュメント</div>
      <div className="flex flex-wrap gap-2">
        {product.dataSheetUrl && (
          <>
            {/* データシートを見る */}
            <a
              href={product.dataSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-all hover:bg-red-100 hover:border-red-300 active:scale-95"
            >
              <FileText size={12} />
              データシートを見る
            </a>
            {/* PDFダウンロード */}
            <a
              href={product.dataSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 hover:border-gray-300 active:scale-95"
            >
              <Download size={12} />
              PDFダウンロード
            </a>
          </>
        )}
        {product.productPageUrl && (
          <a
            href={product.productPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 hover:border-gray-300 active:scale-95"
          >
            <Globe size={12} />
            3M製品ページ
          </a>
        )}
        {product.catalogUrl && (
          <a
            href={product.catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 hover:border-gray-300 active:scale-95"
          >
            <FileText size={12} />
            カタログ
          </a>
        )}
      </div>
    </div>
  );
}

function ClosingLine({ line, index }: { line: string; index: number }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(line).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const icons = ["🤝", "📦", "🔬"];
  return (
    <button
      onClick={handle}
      className={cn(
        "w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all",
        copied ? "bg-green-50" : "hover:bg-gray-50"
      )}
    >
      <span className="text-base flex-shrink-0">{icons[index]}</span>
      <span className={cn("text-sm flex-1 leading-relaxed", copied ? "text-green-700 font-medium" : "text-gray-700")}>
        {line}
      </span>
      <span className={cn(
        "flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all",
        copied
          ? "border-green-300 bg-green-100 text-green-700"
          : "border-gray-200 text-gray-400"
      )}>
        {copied ? <Check size={10} /> : <Copy size={10} />}
        {copied ? "✓" : ""}
      </span>
    </button>
  );
}
