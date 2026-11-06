# DSH 插件索引（dsh-plugin 标签）

[简体中文](README.md) | [English](README.en.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

DeepSeek Harness 的插件索引，收录**所有打了 `dsh-plugin` 标签、且可以安装的 DSH 插件**：

- 带 [`dsh-plugin` 主题](https://github.com/topics/dsh-plugin)的 GitHub 仓库。这是[官方 README](https://github.com/deepseek-ai/deepseek-harness#community-and-support) 要求插件作者使用的标签；
- 带 `dsh-plugin` 关键词的 npm 包。

## 使用方法

在 DSH 中打开 **插件 → 发现 → 添加索引源**，粘贴：

```text
https://whoishuhu.github.io/dsh-plugin-index/index.json
```

如果看不到 **发现** 标签页，先在 **插件 → 实验性插件** 中打开 **自定义插件索引**。

## 生成方式

GitHub Actions 每天北京时间 02:00 运行：

1. `scripts/collect.mjs` 列出所有带 `dsh-plugin` 关键词的 npm 包和带 `dsh-plugin` 主题的 GitHub 仓库。已发布到 npm 的仓库从 npm 安装；其余仓库只有根目录 `package.json` 声明了 `dsh.bundle` 或 workspace 时才保留。
2. [官方参考生成器](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/plugin-market-generator)（原样复制在 `vendor/generator`）读取这些来源。它只收录 `package.json` 声明了 `dsh.bundle`、且没有设为私有或弃用的版本，从不安装或运行插件代码。
3. `scripts/finalize.mjs` 为每个插件保留最新 8 个版本（外加最新正式版），加上 GitHub 星数、npm 下载量和最近更新时间三种排序，并用官方 `@deepseek-ai/dsh-plugin-market-index` 校验器检查结果。

发布的网站上还有 `sources.txt`（读取了哪些来源）和 `warnings.log`（跳过了哪些、原因是什么）。

## 让你的插件被收录

不需要提交任何申请。给 GitHub 仓库加上 `dsh-plugin` 主题，或给 npm 包加上 `dsh-plugin` 关键词，并在 `package.json` 中声明 `dsh.bundle`，下一次每日构建就会收录。

## 限制

- **收录不等于审核。** 任何人都可以打 `dsh-plugin` 标签。每个插件的标题、描述和安装来源都由插件自己声明。安装前请在确认框中核对来源。
- 安装包超过 64 MiB 的会被跳过，这是官方生成器自带的限制。
- 打了标签但不含 DSH 插件的仓库，以及声明的 DSH 版本范围没有任何 DSH 版本能满足的版本，不会收录。

## 许可证

MIT。`vendor/generator` 来自 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（MIT）。本项目是独立社区项目，与 DeepSeek 官方无隶属关系。
