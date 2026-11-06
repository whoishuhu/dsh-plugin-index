# DSH Plugin Index (dsh-plugin tag)

[简体中文](README.md) | [English](README.en.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

A plugin index for DeepSeek Harness that lists **every installable DSH bundle tagged `dsh-plugin`**:

- GitHub repositories with the [`dsh-plugin` topic](https://github.com/topics/dsh-plugin), the tag the [official README](https://github.com/deepseek-ai/deepseek-harness#community-and-support) asks plugin authors to use;
- npm packages with the `dsh-plugin` keyword.

## Use it

In DSH, open **Plugins → Discover → Add index source** and paste:

```text
https://whoishuhu.github.io/dsh-plugin-index/index.json
```

If **Discover** is missing, turn on **Custom plugin index** under **Plugins → Experimental plugins** first.

## How it is built

A GitHub Actions job runs every day at 02:00 (UTC+8):

1. `scripts/collect.mjs` lists every npm package with the `dsh-plugin` keyword and every GitHub repository with the `dsh-plugin` topic. A repository that already ships to npm is installed from npm. Other repositories are kept only when their root `package.json` declares `dsh.bundle` or a workspace.
2. The [official reference generator](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/plugin-market-generator) (copied unchanged into `vendor/generator`) reads them. It lists only versions whose `package.json` declares `dsh.bundle` and are not private or deprecated, and it never installs or runs plugin code.
3. `scripts/finalize.mjs` keeps the newest 8 versions of each plugin (plus the newest stable one), adds GitHub stars, npm downloads and last-update time as sort keys, and checks the result with the official `@deepseek-ai/dsh-plugin-market-index` validator.

The published site also carries `sources.txt` (what was read) and `warnings.log` (what was skipped and why).

## Get your plugin listed

There is nothing to submit. Add the `dsh-plugin` topic to your GitHub repository, or the `dsh-plugin` keyword to your npm package, and declare `dsh.bundle` in `package.json`. The next daily build picks it up.

## Limits

- **Listing is not review.** Anyone can add the `dsh-plugin` tag. Every title, description and install source comes from the plugin itself. Check the source in the install dialog before you install.
- Packages whose tarball is larger than 64 MiB are skipped; that limit is built into the official generator.
- Repositories that are tagged but contain no DSH bundle, and versions whose DSH range no DSH release satisfies, are left out.

## License

MIT. `vendor/generator` is from [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) (MIT). Independent community project, not affiliated with DeepSeek.
