# DSH プラグインインデックス（dsh-plugin タグ）

[简体中文](README.md) | [English](README.en.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

DeepSeek Harness 用のプラグインインデックスです。**`dsh-plugin` タグが付いた、インストール可能なすべての DSH プラグイン**を掲載します。

- [`dsh-plugin` トピック](https://github.com/topics/dsh-plugin)が付いた GitHub リポジトリ。[公式 README](https://github.com/deepseek-ai/deepseek-harness#community-and-support) がプラグイン作者に付けるよう求めているタグです。
- `dsh-plugin` キーワードが付いた npm パッケージ。

## 使い方

DSH で **Plugins → Discover → Add index source** を開き、次の URL を貼り付けます。

```text
https://whoishuhu.github.io/dsh-plugin-index/index.json
```

**Discover** タブが表示されない場合は、先に **Plugins → Experimental plugins** で **Custom plugin index** をオンにしてください。

## 生成の仕組み

GitHub Actions が毎日 02:00（UTC+8）に実行します。

1. `scripts/collect.mjs` が、`dsh-plugin` キーワード付きの npm パッケージと `dsh-plugin` トピック付きの GitHub リポジトリをすべて列挙します。npm に公開済みのリポジトリは npm からインストールします。それ以外のリポジトリは、ルートの `package.json` が `dsh.bundle` または workspace を宣言している場合のみ残します。
2. [公式リファレンスジェネレーター](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/plugin-market-generator)（`vendor/generator` に無改変でコピー）がそれらを読み込みます。`package.json` で `dsh.bundle` を宣言し、private でも非推奨でもないバージョンだけを掲載し、プラグインのコードをインストールしたり実行したりすることはありません。
3. `scripts/finalize.mjs` が各プラグインの最新 8 バージョン（と最新の安定版）を残し、GitHub スター数・npm ダウンロード数・最終更新日時の並べ替えキーを追加し、公式の `@deepseek-ai/dsh-plugin-market-index` バリデーターで結果を検証します。

公開サイトには `sources.txt`（読み込んだソース）と `warnings.log`（スキップしたものとその理由）も置かれます。

## 自分のプラグインを掲載するには

申請は不要です。GitHub リポジトリに `dsh-plugin` トピックを付けるか、npm パッケージに `dsh-plugin` キーワードを付け、`package.json` で `dsh.bundle` を宣言してください。次回の日次ビルドで掲載されます。

## 制限

- **掲載は審査ではありません。** 誰でも `dsh-plugin` タグを付けられます。タイトル、説明、インストール元はすべてプラグイン自身の申告です。インストール前に確認ダイアログでインストール元を確かめてください。
- tarball が 64 MiB を超えるパッケージはスキップされます。これは公式ジェネレーターの制限です。
- タグはあっても DSH プラグインを含まないリポジトリや、宣言した DSH バージョン範囲を満たす DSH リリースがないバージョンは掲載されません。

## ライセンス

MIT。`vendor/generator` は [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（MIT）由来です。DeepSeek とは無関係の独立したコミュニティプロジェクトです。
