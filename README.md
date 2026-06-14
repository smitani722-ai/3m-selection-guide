# 3M Product Selection Guide

3M製品セレクションガイドは、営業担当者が質問に答えるだけで、用途に合う3M製品、代替候補、データシートを確認できるWebアプリです。

## v1.0 Status

| 項目 | 状態 |
|---|---:|
| 登録製品数 | 52製品 |
| 営業テスト | 60件 |
| 一致率 | 100% |
| Build | OK |
| データシート登録率 | 27/52件（51.9%） |

## Getting Started

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## Sales Rule Regression Test

営業ロジックを変更した後は、必ず次のコマンドで60件の営業テストを確認します。

```bash
npm run test:sales
```

正常な場合は次のように表示されます。

```text
PASS 60/60
```

## Build

```bash
npm run build
```

このプロジェクトは、WindowsのOneDrive配下や `##` を含むパスでもビルドできるよう、ビルド時のみ安全なパスへ割り当てるスクリプトを使用しています。

## Datasheet Validation

```bash
npm run validate:datasheets
```

登録済みのデータシートURLが開けるかを確認します。

## Notes

- 営業ロジックは `lib/selectionEngine.ts` に集約されています。
- 製品マスタは `data/products.json` に登録されています。
- 営業ロジック変更時は `npm run test:sales` の `PASS 60/60` を必須確認とします。
