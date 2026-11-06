// Turn the official generator's output into the published index:
//   - keep the newest versions of each plugin so the file stays small enough for DSH's 15 s fetch limit,
//   - add GitHub stars and npm downloads as sort keys,
//   - validate with the official format-1 validator and write it minified.
//
// Usage: node scripts/finalize.mjs <generator-output.json> <published-index.json>
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import semver from 'semver'
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index'

const [input, output] = process.argv.slice(2)
const MAX_VERSIONS = Number(process.env.MAX_VERSIONS ?? 8)
const raw = JSON.parse(readFileSync(input, 'utf8'))
const stats = JSON.parse(readFileSync('build/stats.json', 'utf8'))

const repoKey = (url) => {
  const m = typeof url === 'string' && url.match(/github\.com[/:]([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/#?].*)?$/i)
  return m ? `https://github.com/${m[1]}/${m[2]}`.toLowerCase() : undefined
}

// Newest MAX_VERSIONS versions, plus the newest stable one so DSH always has a non-prerelease recommendation.
function trim(versions) {
  const sorted = [...versions].sort((a, b) => semver.rcompare(a.version, b.version))
  const kept = sorted.slice(0, MAX_VERSIONS)
  const stable = sorted.find((v) => semver.prerelease(v.version) === null)
  if (stable && !kept.includes(stable)) kept.push(stable)
  return kept
}

const plugins = raw.plugins.map((p) => {
  const stars = stats.starsByRepo[repoKey(p.repository?.url)]
  const downloads = stats.npmDownloads[p.name]
  const newest = Math.max(...p.versions.map((v) => v.publishTimestamp))
  return {
    ...p,
    metadata: {
      ...p.metadata,
      sortKeys: {
        ...(stars === undefined ? {} : { 'github-stars': stars }),
        ...(downloads === undefined ? {} : { 'npm-downloads': downloads }),
        updated: newest,
      },
    },
    versions: trim(p.versions),
  }
})

// Most-starred first, then most downloaded: this is the default order in Discover.
plugins.sort((a, b) =>
  (b.metadata.sortKeys['github-stars'] ?? -1) - (a.metadata.sortKeys['github-stars'] ?? -1)
  || (b.metadata.sortKeys['npm-downloads'] ?? -1) - (a.metadata.sortKeys['npm-downloads'] ?? -1))

const index = {
  format: 1,
  title: { en: 'DSH Plugin Index (dsh-plugin tag)', zh: 'DSH 插件索引（dsh-plugin 标签）' },
  description: {
    en: `Every installable DSH bundle tagged dsh-plugin on GitHub or npm, generated daily with the official generator. ${plugins.length} plugins, updated ${stats.generatedAt.slice(0, 10)}. Listing is not endorsement.`,
    zh: `GitHub 或 npm 上打了 dsh-plugin 标签、且可安装的全部 DSH 插件，每天用官方生成器生成。共 ${plugins.length} 个，更新于 ${stats.generatedAt.slice(0, 10)}。收录不代表审核或推荐。`,
  },
  metadata: {
    sortKeys: {
      'github-stars': { title: { en: '★ GitHub stars', zh: '★ GitHub 星数' }, order: 'desc' },
      'npm-downloads': { title: { en: '↓ npm downloads (30 days)', zh: '↓ npm 下载量（30 天）' }, order: 'desc' },
      updated: { title: { en: '◷ Recently updated', zh: '◷ 最近更新' }, order: 'desc' },
    },
  },
  plugins,
}

parseMarketIndex(index, 'https://whoishuhu.github.io/dsh-plugin-index/index.json')
writeFileSync(output, JSON.stringify(index))
rmSync(input)
const bytes = Buffer.byteLength(JSON.stringify(index))
console.log(`wrote ${output}: ${plugins.length} plugins, ${(bytes / 1048576).toFixed(1)} MiB`)
