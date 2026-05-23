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

## Gitコミット履歴

| コミット | 内容 |
|----------|------|
| ca17d36 | Initial commit from Create Next App |
| 4fc8223 | 用途ベース選定完成 |
| 2414c89 | 用途別選定＋データシートリンク対応 |
