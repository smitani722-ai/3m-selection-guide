# 3M 製品セレクションガイド

イザワ社向け営業支援ツール。顧客の用途・条件をヒアリングしながら、最適な3M製品を選定・提案するWebアプリケーション。

## 概要

- **目的**: 営業担当者・エンドユーザーが質問に答えることで最適な3M製品を選定
- **対象カテゴリ**: 両面テープ / 片面テープ / 接着剤 / ファスナー
- **配置先**: イザワ社内・商談現場（スマホ・タブレット対応）

## 技術スタック

| 項目 | 詳細 |
|------|------|
| フレームワーク | Next.js 16.2.6 (App Router, Turbopack) |
| 言語 | TypeScript |
| スタイリング | TailwindCSS v4 |
| UIコンポーネント | shadcn/ui |
| 状態管理 | Zustand |
| デプロイ | Vercel（予定） |

## 実装済み機能

### ✅ 製品選定エンジン (`lib/selectionEngine.ts`)
- ルールベーススコアリング（加算式）
- ハード除外ルール（`isValidAlternative`）
- 代替候補ロジック（スコア上位3製品を提示）

### ✅ 用途別選定フロー (`lib/questions.ts`)
- カテゴリ選択後、最初に「主な用途」を質問（Step 1）
- 両面テープ: 12選択肢（銘板固定・FPC固定・建材固定・VHBシリーズ等）
- 接着剤: 8選択肢（金属・プラスチック・ゴム・油面・高耐熱等）
- ファスナー: 7選択肢（頻繁着脱・仮固定・展示・屋外等）
- 片面テープ: `mainPurpose` フィールドで既対応

### ✅ 用途コンテキストスコアリング (`lib/selectionEngine.ts`)
- `calcApplicationBoost()` 関数 — 用途別に最大 +80 ポイントのスコアブースト
- `buildCriteria()` プレシーディング — 用途から features/environment を事前注入
- テスト結果: 6/6 シナリオで正しいプライマリ製品を選定

### ✅ データシートリンク (`components/selector/ResultCard.tsx`)
- `productPageUrl` / `dataSheetUrl` / `catalogUrl` フィールド対応
- 結果カードに「データシートを見る」「PDFダウンロード」「3M製品ページ」ボタン表示
- 対応製品14品（5952・Y4825・Y4950・GPH・93015LE・467MP・9077・DP420NS・DP460・DP8010・メタルグリップ・SJ3540・SJ3550等）

### ✅ レスポンシブUI
- スマートフォン・タブレット対応
- shadcn/ui コンポーネント使用

## プロジェクト構成

```
3m-selection-guide/
├── app/                    # Next.js App Router
│   └── page.tsx            # メインページ
├── components/
│   └── selector/
│       ├── CategorySelector.tsx   # カテゴリ選択
│       ├── QuestionCard.tsx       # 質問UI
│       └── ResultCard.tsx         # 結果表示（データシートリンク含む）
├── data/
│   └── products.json       # 製品データ（URL含む）
├── lib/
│   ├── questions.ts        # 質問定義・フロー制御
│   ├── selectionEngine.ts  # 選定ロジック・スコアリング
│   └── store.ts            # Zustand状態管理・buildCriteria
└── README.md
```

## 開発環境

```bash
npm run dev    # http://localhost:3000 (または 3001)
npm run build  # 本番ビルド
npm run start  # 本番サーバー
```

## デプロイ状況

| 項目 | 状態 |
|------|------|
| Vercel CLI インストール | ✅ 完了（v54.4.1、ホスト名パッチ適用済み） |
| Vercel 認証 | ✅ 完了（smitani722-ai） |
| GitHub CLI インストール | ✅ 完了（C:\Program Files\GitHub CLI\gh.exe） |
| GitHub 認証 | ⏳ 未完了（OAuth フロー途中で中断） |
| GitHubリポジトリ作成 | ⏳ 未実施 |
| git push | ⏳ 未実施 |
| Vercel デプロイ | ⏳ 未実施 |
| 本番URL発行 | ⏳ 未実施 |

## 次回再開時の手順

1. **GitHub認証**: `gh auth login --web --hostname github.com`
2. **リポジトリ作成 & push**: `gh repo create 3m-selection-guide --public --source=. --remote=origin --push`
3. **Vercelデプロイ**: `vercel --prod`（プロジェクトルートで実行）
4. **本番確認**: 質問フロー・用途別分岐・データシートリンク・スマホ表示

### 注意事項
- Vercel CLI ホスト名パッチ: `chunk-XPQUP4VC.js` 1909行目 — 非ASCII文字を除去（PC名「サンバレー」対応）
- npm コマンドは PowerShell で `npm.cmd` として実行（実行ポリシー対応）
- Windows Credential Manager に `git:https://github.com` 資格情報あり

---

## データシートURL運用ルール（再発防止）

### 許可・禁止パターン（`lib/urlValidation.ts` に実装済み）

| 判定 | 条件 |
|------|------|
| ✅ 許可 | URLに `itd-` / `technical-data-sheet` / `テクニカルデータシート` を含む |
| ❌ 禁止 | URLに `catalog` / `ラインマーカー` / `brochure` / `leaflet` / `multilingual` を含む |

### productPageURL ルール

- 必ず `https://www.3mcompany.jp/3M/ja_JP/p/d/` で始まること
- 例: `https://www.3mcompany.jp/3M/ja_JP/p/d/b5005313004/`

### 正しいTDS取得手順

1. `https://www.3mcompany.jp/3M/ja_JP/p/d/{productId}/` を開く
2. ページ内 **参考資料** セクションを確認する
3. 「テクニカルデータシート」と表示されているPDFのURLをコピーする
4. PDF 1ページ目に「Technical Data Sheet」または「テクニカルデータシート」が表示されることを確認する
5. カタログ・パンフレット・販促資料は **絶対に使用しない**

### フェイルセーフ（`components/selector/ResultCard.tsx`）

- `dataSheetUrl` が空 → ボタン非表示
- `dataSheetUrl` が禁止パターン → 「資料確認中」バッジを表示（リンクなし）
- `productPageUrl` が 3M Japan パターン外 → ボタン非表示

---

## 床マーキングテープ選定ロジック（971L / 471 / 764）

```
片面テープ + マーキング用途
│
├── フォークリフト耐久 → 971L（超高耐久ラインテープ）
│                         ※代替: 764, 471
│
├── 剥離性・密着性・曲線対応のいずれか → 471（プラスチックフィルムテープ）
│   │  剥離性 → 糊残りが少ない（貼り替え・区画変更に）
│   │  密着性 → めくれ・端部剥がれが少ない
│   │  曲線対応 → 矢印・コーナーラインにダイカット加工可
│                   ※代替: 764, 971L
│
└── 特になし（コスト重視・標準直線ライン） → 764（プラスチックフィルムテープ）
                   ※代替: 471, 971L
```

### 質問フロー（`lib/questions.ts` > `stLineFeature`）

| 回答 | featureに追加 | 選定結果 |
|------|--------------|--------|
| 糊残りが少ない（剥がしやすい） | `剥離性` | 471 |
| めくれ・剥がれが少ない | `密着性` | 471 |
| 曲線ライン施工が必要 | `曲線対応` | 471 |
| 特になし（コスト重視） | `標準ライン` | 764 |

フォークリフト有無は前段の質問（`isForklift = criteria.features.includes("フォークリフト耐久")`）で分岐。

---

## 製品追加テンプレート（products.json）

新製品を追加する場合は以下の形式を使用すること。

```json
{
  "id": "製品型番（例: 4910）",
  "name": "製品型番または通称",
  "category": "両面テープ | 片面テープ | 接着剤 | ファスナー",
  "subcategory": "サブカテゴリ名（例: アクリルフォームテープ）",
  "description": "製品の特徴を1〜2文で（日本語）",
  "features": ["特徴1", "特徴2"],
  "applications": ["用途1", "用途2"],
  "substrates": ["被着体1", "被着体2"],
  "environment": ["屋内" | "屋外"],
  "thickness": "0.Xmm（省略可）",
  "tempRange": { "min": -10, "max": 66 },
  "lse": false,
  "price": "economy | standard | premium",
  "permanence": "着脱可能 | 恒久固定",
  "notes": "補足・注意事項（省略可）",
  "competitors": [],
  "dataSheetUrl": "https://multimedia.3m.com/mws/media/{ID}O/{filename}.pdf",
  "productPageUrl": "https://www.3mcompany.jp/3M/ja_JP/p/d/{productId}/",
  "catalogUrl": null
}
```

**dataSheetUrl 確認チェックリスト：**
- [ ] 3M Japan 製品ページ（3mcompany.jp）の参考資料セクションから取得
- [ ] URLに `itd-` または `technical-data-sheet` または `テクニカルデータシート` を含む
- [ ] URLに `catalog` / `ラインマーカー` / `brochure` / `leaflet` / `multilingual` を含まない
- [ ] 開いたPDFの1ページ目に「テクニカルデータシート」または「Technical Data Sheet」と表示される
- [ ] 日本語コンテンツであること

---

## Gitコミット履歴

| コミット | 内容 |
|----------|------|
| ca17d36 | Initial commit from Create Next App |
| 4fc8223 | 用途ベース選定完成 |
| 2414c89 | 用途別選定＋データシートリンク対応 |
