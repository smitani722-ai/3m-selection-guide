"use client";

import { SelectionResult } from "@/lib/selectionEngine";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Award,
  ChevronRight,
  FileText,
  Info,
  Star,
  ThumbsUp,
} from "lucide-react";

interface ResultCardProps {
  result: SelectionResult;
}

function priceLabel(price: string) {
  if (price === "economy") return "経済的";
  if (price === "premium") return "ハイグレード";
  return "標準";
}

function priceBadgeColor(price: string) {
  if (price === "economy") return "bg-green-100 text-green-800";
  if (price === "premium") return "bg-purple-100 text-purple-800";
  return "bg-blue-100 text-blue-800";
}

function DatasheetLink({
  product,
  compact = false,
}: {
  product: SelectionResult["primary"];
  compact?: boolean;
}) {
  const datasheets =
    product.datasheets && product.datasheets.length > 0
      ? product.datasheets
      : product.datasheetUrl
        ? [
            {
              title: product.datasheetTitle ?? "データシート",
              url: product.datasheetUrl,
              documentType: product.datasheetDocumentType ?? "データシート",
              language: product.datasheetLanguage ?? "ja-JP",
            },
          ]
        : [];

  if (datasheets.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-3" : ""}`}>
      {datasheets.map((datasheet) => (
        <a
          className={`inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 font-medium text-red-700 hover:bg-red-100 ${
            compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
          }`}
          href={datasheet.url}
          key={datasheet.url}
          rel="noopener noreferrer"
          target="_blank"
          title={`${datasheet.title} / ${datasheet.documentType}`}
        >
          <FileText size={compact ? 14 : 16} />
          データシートを見る
          <span className="text-red-500">({datasheet.title})</span>
        </a>
      ))}
    </div>
  );
}

export function ResultCard({ result }: ResultCardProps) {
  const { primary, alternatives, reasons, warnings, category } = result;

  return (
    <div className="space-y-6">
      {/* Primary Recommendation */}
      <Card className="border-2 border-red-600 shadow-lg">
        <CardHeader className="bg-red-600 text-white rounded-t-xl pb-4">
          <div className="flex items-center gap-2 text-red-100 text-sm font-medium mb-1">
            <Star size={14} />
            第一推奨製品
          </div>
          <CardTitle className="text-4xl font-black tracking-tight">
            {primary.name}
          </CardTitle>
          <p className="text-red-100 text-sm mt-1">{category}</p>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <p className="text-gray-700">{primary.description}</p>

          <div className="flex flex-wrap gap-2">
            {primary.features.map((f) => (
              <Badge key={f} variant="secondary" className="bg-gray-100 text-gray-700">
                {f}
              </Badge>
            ))}
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priceBadgeColor(primary.price)}`}>
              {priceLabel(primary.price)}
            </span>
          </div>

          {primary.thickness && (
            <div className="text-sm text-gray-500">
              厚み：{primary.thickness}
              {primary.tempRange && (
                <span className="ml-4">
                  温度範囲：{primary.tempRange.min}〜{primary.tempRange.max}°C
                </span>
              )}
            </div>
          )}
          <DatasheetLink product={primary} />
        </CardContent>
      </Card>

      {/* Reasons */}
      {reasons.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <ThumbsUp size={16} className="text-red-600" />
              選定理由
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <ChevronRight size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <AlertTriangle size={16} />
              注意点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {primary.notes && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-2 text-sm text-blue-900">
              <Info size={14} className="mt-0.5 flex-shrink-0 text-blue-600" />
              <p>{primary.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Award size={14} />
            代替候補
          </h3>
          <div className="space-y-3">
            {alternatives.map((alt) => (
              <Card key={alt.id} className="border border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-gray-900">{alt.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{alt.subcategory}</div>
                      <p className="text-sm text-gray-600 mt-1">{alt.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alt.features.slice(0, 3).map((f) => (
                          <Badge key={f} variant="outline" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {alt.notes && (
                    <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">
                      {alt.notes}
                    </p>
                  )}
                  <DatasheetLink product={alt} compact />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Competitors */}
      {primary.competitors && primary.competitors.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 font-medium">近い競合品との比較</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">製品</th>
                    <th className="text-left py-2 text-gray-500 font-medium">備考</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-red-50">
                    <td className="py-2 pr-4 font-bold text-red-700">3M {primary.name}</td>
                    <td className="py-2 text-gray-700">本推奨品</td>
                  </tr>
                  {primary.competitors.map((comp, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-gray-600">{comp}</td>
                      <td className="py-2 text-gray-500 text-xs">競合品</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
