# DSH 外掛索引（dsh-plugin 標籤）

[简体中文](README.md) | [English](README.en.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

DeepSeek Harness 的外掛索引，收錄**所有標註了 `dsh-plugin` 標籤、且可以安裝的 DSH 外掛**：

- 帶有 [`dsh-plugin` 主題](https://github.com/topics/dsh-plugin)的 GitHub 儲存庫。這是[官方 README](https://github.com/deepseek-ai/deepseek-harness#community-and-support) 要求外掛作者使用的標籤；
- 帶有 `dsh-plugin` 關鍵字的 npm 套件。

## 使用方式

DSH 介面的選單名稱是簡體中文，以下照介面原樣寫出。在 DSH 中開啟 **插件 → 发现 → 添加索引源**，貼上：

```text
https://whoishuhu.github.io/dsh-plugin-index/index.json
```

如果看不到 **发现** 分頁，請先在 **插件 → 实验性插件** 中開啟 **自定义插件索引**。

## 產生方式

GitHub Actions 每天台北時間 02:00 執行：

1. `scripts/collect.mjs` 列出所有帶 `dsh-plugin` 關鍵字的 npm 套件和帶 `dsh-plugin` 主題的 GitHub 儲存庫。已發布到 npm 的儲存庫從 npm 安裝；其餘儲存庫只有根目錄 `package.json` 宣告了 `dsh.bundle` 或 workspace 時才保留。
2. [官方參考產生器](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/plugin-market-generator)（原樣複製在 `vendor/generator`）讀取這些來源。它只收錄 `package.json` 宣告了 `dsh.bundle`、且沒有設為私有或棄用的版本，從不安裝或執行外掛程式碼。
3. `scripts/finalize.mjs` 為每個外掛保留最新 8 個版本（另加最新正式版），加上 GitHub 星數、npm 下載量和最近更新時間三種排序，並用官方 `@deepseek-ai/dsh-plugin-market-index` 驗證器檢查結果。

發布的網站上還有 `sources.txt`（讀取了哪些來源）和 `warnings.log`（略過了哪些、原因為何）。

## 讓你的外掛被收錄

不需要提交任何申請。為 GitHub 儲存庫加上 `dsh-plugin` 主題，或為 npm 套件加上 `dsh-plugin` 關鍵字，並在 `package.json` 中宣告 `dsh.bundle`，下一次每日建置就會收錄。

## 限制

- **收錄不等於審查。** 任何人都可以標註 `dsh-plugin`。每個外掛的標題、說明和安裝來源都由外掛自行宣告。安裝前請在確認對話框中核對來源。
- 安裝包超過 64 MiB 的會被略過，這是官方產生器內建的限制。
- 標註了標籤但不含 DSH 外掛的儲存庫，以及宣告的 DSH 版本範圍沒有任何 DSH 版本能滿足的版本，不會收錄。

## 授權

MIT。`vendor/generator` 來自 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（MIT）。本專案為獨立社群專案，與 DeepSeek 官方無隸屬關係。
