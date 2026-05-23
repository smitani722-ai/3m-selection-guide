# 3M 製品セレクションガイド - デプロイガイド

## ローカル開発

```bash
cd C:\Users\smita\3m-selection-guide

# 依存パッケージインストール
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:3000 で確認
```

## Vercel公開手順

### 1. GitHubリポジトリを作成

GitHub.com にアクセスし、新しいリポジトリを作成してください。

### 2. ローカルでGit初期化・プッシュ

ターミナルで以下を実行：

```bash
cd C:\Users\smita\3m-selection-guide

git init
git add .
git commit -m "Initial commit: 3M製品セレクションガイドMVP"
git branch -M main
git remote add origin https://github.com/[YOUR_USERNAME]/3m-selection-guide.git
git push -u origin main
```

### 3. Vercelにデプロイ

1. https://vercel.com にアクセス（GitHubアカウントでログイン）
2. 「New Project」→ 「Import Git Repository」
3. 作成したリポジトリを選択
4. フレームワーク: **Next.js** が自動検出されます
5. 「Deploy」をクリック

デプロイ完了後、`https://[project-name].vercel.app` でアクセス可能になります。

## プロジェクト構成

```
3m-selection-guide/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # トップページ
│   └── globals.css         # グローバルCSS
├── components/
│   ├── selector/
│   │   ├── Selector.tsx    # メインUI（質問フロー・結果画面）
│   │   ├── QuestionCard.tsx # 各質問の選択肢UI
│   │   └── ResultCard.tsx  # 選定結果表示UI
│   └── ui/                 # shadcn/uiコンポーネント
├── data/
│   └── products.json       # 製品データベース（45製品）
├── lib/
│   ├── selectionEngine.ts  # 選定ロジック（スコアリング）
│   ├── questions.ts        # 質問フロー定義（9問）
│   ├── store.ts            # Zustand状態管理
│   └── utils.ts            # ユーティリティ
└── DEPLOY.md               # このファイル
```

## 製品DB拡張方法

`data/products.json` に製品を追加するだけで反映されます：

```json
{
  "id": "製品ID",
  "name": "製品名",
  "category": "両面テープ | 接着剤 | ファスナー | 片面テープ",
  "subcategory": "サブカテゴリ",
  "description": "説明文",
  "features": ["特性1", "特性2"],
  "applications": ["用途1", "用途2"],
  "substrates": ["被着体1", "被着体2"],
  "environment": ["屋内", "屋外", "高温"],
  "thickness": "0.1mm",
  "tempRange": { "min": -40, "max": 121 },
  "lse": false,
  "price": "standard | economy | premium",
  "permanence": "恒久固定 | 再剥離 | 再剥離可 | 着脱可能",
  "notes": "注意事項",
  "competitors": ["競合品A"]
}
```

## 将来のRAG化

将来的にPDFをRAGとして活用する場合：
1. PDF→テキスト変換スクリプトを追加
2. `data/products.json` をベクトルDBに移行（Pinecone・Supabase等）
3. `/api/search` エンドポイントを追加
4. `selectionEngine.ts` をAPIコールに変更
