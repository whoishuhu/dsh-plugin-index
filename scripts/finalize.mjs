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

const date = stats.generatedAt.slice(0, 10)
const n = plugins.length
const index = {
  format: 1,
  title: {
    en: 'DSH Plugin Index (dsh-plugin tag)',
    zh: 'DSH 插件索引（dsh-plugin 标签）',
    'zh-tw': 'DSH 外掛索引（dsh-plugin 標籤）',
    ja: 'DSH プラグインインデックス（dsh-plugin タグ）',
    ko: 'DSH 플러그인 인덱스 (dsh-plugin 태그)',
  },
  description: {
    en: `Every installable DSH bundle tagged dsh-plugin on GitHub or npm, generated daily with the official generator. ${n} plugins, updated ${date}. Listing is not review.`,
    zh: `GitHub 或 npm 上打了 dsh-plugin 标签、且可安装的全部 DSH 插件，每天用官方生成器生成。共 ${n} 个，更新于 ${date}。收录不代表审核。`,
    'zh-tw': `GitHub 或 npm 上標註了 dsh-plugin 標籤、且可安裝的全部 DSH 外掛，每天以官方產生器產生。共 ${n} 個，更新於 ${date}。收錄不代表審查。`,
    ja: `GitHub または npm で dsh-plugin タグが付いた、インストール可能なすべての DSH プラグイン。公式ジェネレーターで毎日生成。${n} 件、${date} 更新。掲載は審査ではありません。`,
    ko: `GitHub 또는 npm에서 dsh-plugin 태그가 붙은 설치 가능한 모든 DSH 플러그인. 공식 생성기로 매일 생성. ${n}개, ${date} 업데이트. 수록은 검토가 아닙니다.`,
  },
  metadata: {
    sortKeys: {
      'github-stars': { title: { en: '★ GitHub stars', zh: '★ GitHub 星数', 'zh-tw': '★ GitHub 星數', ja: '★ GitHub スター', ko: '★ GitHub 스타' }, order: 'desc' },
      'npm-downloads': { title: { en: '↓ npm downloads (30 days)', zh: '↓ npm 下载量（30 天）', 'zh-tw': '↓ npm 下載量（30 天）', ja: '↓ npm ダウンロード（30 日）', ko: '↓ npm 다운로드 (30일)' }, order: 'desc' },
      updated: { title: { en: '◷ Recently updated', zh: '◷ 最近更新', 'zh-tw': '◷ 最近更新', ja: '◷ 最近の更新', ko: '◷ 최근 업데이트' }, order: 'desc' },
    },
  },
  plugins,
}

parseMarketIndex(index, 'https://whoishuhu.github.io/dsh-plugin-index/index.json')
writeFileSync(output, JSON.stringify(index))
rmSync(input)
const bytes = Buffer.byteLength(JSON.stringify(index))
console.log(`wrote ${output}: ${plugins.length} plugins, ${(bytes / 1048576).toFixed(1)} MiB`)
