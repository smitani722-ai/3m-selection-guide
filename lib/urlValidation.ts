/**
 * URLバリデーション — 3M製品データシート・製品ページURL品質管理
 *
 * ルール定義：
 *   ALLOWED   (dataSheetUrl) : itd- | technical-data-sheet | テクニカルデータシート
 *   FORBIDDEN (dataSheetUrl) : catalog | ラインマーカー | brochure | leaflet | multilingual
 *   productPageUrl           : https://www.3mcompany.jp/3M/ja_JP/p/d/ で始まること
 */

// ─── dataSheetUrl ────────────────────────────────────────────────────────────

const DATASHEET_ALLOWED_PATTERNS = [
  "itd-",
  "technical-data-sheet",
  "テクニカルデータシート",
] as const;

const DATASHEET_FORBIDDEN_PATTERNS = [
  "catalog",
  "ラインマーカー",
  "brochure",
  "leaflet",
  "multilingual",
] as const;

/**
 * URL が「データシートとして許可されたパターン」を含むか判定する。
 * NOTE: 許可パターンに一致しない場合でも forbidden でなければ表示は許可。
 *       3M Japan 製品ページ参考資料から取得した URL はパターン外でも valid 扱い。
 */
export function isAllowedDataSheetUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return DATASHEET_ALLOWED_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

/**
 * URL が「カタログ・販促資料に分類される禁止パターン」を含むか判定する。
 * true → 表示禁止（資料確認中 UI に切り替え）
 */
export function isForbiddenDataSheetUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return DATASHEET_FORBIDDEN_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

/**
 * データシートURLとして安全に表示できるか判定する。
 * - URL が空なら false
 * - 禁止パターンを含む場合 false
 * - それ以外は true（許可パターン外でも 3M Japan 参考資料 URL として許容）
 */
export function isDisplayableDataSheetUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === "") return false;
  if (isForbiddenDataSheetUrl(url)) return false;
  return true;
}

// ─── productPageUrl ───────────────────────────────────────────────────────────

const PRODUCT_PAGE_ALLOWED_PREFIX = "https://www.3mcompany.jp/3M/ja_JP/p/d/";

/**
 * productPageUrl が 3M Japan 日本語製品ページのURLパターンに準拠しているか判定する。
 */
export function isValidProductPageUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === "") return false;
  return url.startsWith(PRODUCT_PAGE_ALLOWED_PREFIX);
}

// ─── 一括バリデーション（CI / テスト用） ─────────────────────────────────────

export interface UrlValidationResult {
  id: string;
  dataSheetUrl: string | null;
  productPageUrl: string | null;
  dataSheetStatus: "ok" | "forbidden" | "empty";
  productPageStatus: "ok" | "invalid" | "empty";
  issues: string[];
}

/**
 * products.json の各エントリを検証し、問題のある製品を返す。
 * 開発時の品質確認・CI 組み込みに使用する。
 */
export function validateProductUrls(products: Array<{
  id: string;
  dataSheetUrl?: string | null;
  productPageUrl?: string | null;
}>): UrlValidationResult[] {
  return products.map((p) => {
    const issues: string[] = [];

    // dataSheetUrl チェック
    let dataSheetStatus: "ok" | "forbidden" | "empty" = "ok";
    if (!p.dataSheetUrl) {
      dataSheetStatus = "empty";
      // dataSheetUrl は必須ではないので issue には入れない
    } else if (isForbiddenDataSheetUrl(p.dataSheetUrl)) {
      dataSheetStatus = "forbidden";
      issues.push(
        `dataSheetUrl にカタログ/販促資料URLが含まれています: ${p.dataSheetUrl}`
      );
    }

    // productPageUrl チェック
    let productPageStatus: "ok" | "invalid" | "empty" = "ok";
    if (!p.productPageUrl) {
      productPageStatus = "empty";
    } else if (!isValidProductPageUrl(p.productPageUrl)) {
      productPageStatus = "invalid";
      issues.push(
        `productPageUrl が 3M Japan 製品ページパターン外です: ${p.productPageUrl}`
      );
    }

    return {
      id: p.id,
      dataSheetUrl: p.dataSheetUrl ?? null,
      productPageUrl: p.productPageUrl ?? null,
      dataSheetStatus,
      productPageStatus,
      issues,
    };
  });
}
