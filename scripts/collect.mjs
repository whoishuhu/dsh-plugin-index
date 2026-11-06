// Collect every npm package with the `dsh-plugin` keyword and every GitHub repository with the
// `dsh-plugin` topic, and write the source list the official generator reads.
//
// Output:
//   build/sources.txt  one npm name or https Git URL per line (npm first, then Git, by popularity)
//   build/stats.json   popularity numbers used by finalize.mjs for sort keys
//
// Env: GITHUB_TOKEN (optional, raises the search rate limit), LIMIT (optional, cap per kind for testing).
import { mkdirSync, writeFileSync } from 'node:fs'

const TOKEN = process.env.GITHUB_TOKEN
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url, headers = {}, tries = 6) {
  for (let i = 0; ; i++) {
    let res
    try {
      res = await fetch(url, { headers: { 'user-agent': 'dsh-plugin-index', ...headers } })
    } catch (error) {
      if (i >= tries) throw error
      await sleep(2000 * (i + 1))
      continue
    }
    if (res.ok) return res.json()
    if ((res.status === 403 || res.status === 429) && i < tries) {
      const reset = Number(res.headers.get('x-ratelimit-reset'))
      const wait = reset ? Math.max(1000, reset * 1000 - Date.now() + 1000) : 60000
      console.error(`rate limited, waiting ${Math.round(wait / 1000)}s`)
      await sleep(Math.min(wait, 120000))
      continue
    }
    if (res.status >= 500 && i < tries) { await sleep(2000 * (i + 1)); continue }
    throw new Error(`${url}: HTTP ${res.status}`)
  }
}

// Normalize a repository URL to https://host/owner/repo (lowercase) for matching.
function repoKey(url) {
  if (typeof url !== 'string') return undefined
  const m = url.match(/github\.com[/:]([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/#?].*)?$/i)
  return m ? `https://github.com/${m[1]}/${m[2]}`.toLowerCase() : undefined
}

// ---- npm ----
async function collectNpm() {
  const out = new Map()
  for (let from = 0; ; from += 250) {
    const j = await getJson(`https://registry.npmjs.org/-/v1/search?text=keywords:dsh-plugin&size=250&from=${from}`)
    for (const o of j.objects) {
      const p = o.package
      if (!(p.keywords ?? []).some((k) => String(k).toLowerCase() === 'dsh-plugin')) continue
      if (!out.has(p.name)) out.set(p.name, { name: p.name, downloads: o.downloads?.monthly ?? 0, repo: repoKey(p.links?.repository) })
    }
    if (j.objects.length < 250 || from + 250 >= j.total || out.size >= LIMIT) break
  }
  return [...out.values()].slice(0, LIMIT)
}

// ---- GitHub ----
const day = 86400000
const iso = (t) => new Date(t).toISOString().slice(0, 10)

async function ghSearch(q, page) {
  const headers = { accept: 'application/vnd.github+json', ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}) }
  const j = await getJson(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=100&page=${page}`, headers)
  await sleep(TOKEN ? 2100 : 6500) // stay under 30/min (token) or 10/min (anonymous)
  return j
}

async function collectGithub() {
  const repos = new Map()
  // Search returns at most 1000 results per query, so split by creation date until each slice fits.
  const stack = [[Date.parse('2008-01-01'), Date.now() + day]]
  while (stack.length > 0 && repos.size < LIMIT) {
    const [a, b] = stack.pop()
    const q = `topic:dsh-plugin fork:true created:${iso(a)}..${iso(b - day)}`
    const first = await ghSearch(q, 1)
    if (first.total_count > 1000 && b - a > day) {
      const mid = a + Math.floor((b - a) / day / 2) * day
      stack.push([a, mid], [mid, b])
      continue
    }
    const add = (items) => {
      for (const r of items) {
        if (r.archived || r.disabled || r.private) continue
        repos.set(r.html_url.toLowerCase(), { url: r.html_url, stars: r.stargazers_count, branch: r.default_branch, full: r.full_name })
      }
    }
    add(first.items)
    const pages = Math.min(10, Math.ceil(first.total_count / 100))
    for (let p = 2; p <= pages; p++) add((await ghSearch(q, p)).items)
    console.error(`github ${iso(a)}..${iso(b - day)}: ${first.total_count} (total ${repos.size})`)
  }
  return [...repos.values()].slice(0, LIMIT)
}

// A repository can hold a DSH bundle only if its root package.json declares dsh.bundle or it is a workspace.
// Raw file reads do not count against the API rate limit.
async function mayHoldBundle(repo) {
  const raw = (path) => `https://raw.githubusercontent.com/${repo.full}/${repo.branch}/${path}`
  const headers = TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}
  try {
    const res = await fetch(raw('package.json'), { headers })
    if (res.ok) {
      const pkg = JSON.parse(await res.text())
      if (pkg?.dsh?.bundle !== undefined || pkg?.workspaces !== undefined) return true
    }
    return (await fetch(raw('pnpm-workspace.yaml'), { method: 'HEAD', headers })).ok
  } catch {
    return false
  }
}

async function pool(items, n, fn) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) { const i = next++; results[i] = await fn(items[i]) }
  }))
  return results
}

const npm = await collectNpm()
console.error(`npm: ${npm.length} packages`)
const github = await collectGithub()
console.error(`github: ${github.length} repositories`)

// Repositories already covered by an npm package are installed from npm (faster, verified integrity).
const coveredRepos = new Set(npm.map((p) => p.repo).filter(Boolean))
const candidates = github.filter((r) => !coveredRepos.has(repoKey(r.url)))
const keep = await pool(candidates, 16, mayHoldBundle)
const gitSources = candidates.filter((_, i) => keep[i])
console.error(`github: ${candidates.length} not on npm, ${gitSources.length} may hold a bundle`)

const starsByRepo = Object.fromEntries(github.map((r) => [repoKey(r.url), r.stars]))
npm.sort((x, y) => (starsByRepo[y.repo] ?? 0) - (starsByRepo[x.repo] ?? 0) || y.downloads - x.downloads)
gitSources.sort((x, y) => y.stars - x.stars)

mkdirSync('build', { recursive: true })
writeFileSync('build/sources.txt', [
  '# npm packages with the dsh-plugin keyword',
  ...npm.map((p) => p.name),
  '# GitHub repositories with the dsh-plugin topic that are not on npm',
  ...gitSources.map((r) => r.url),
  '',
].join('\n'))
writeFileSync('build/stats.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  npmDownloads: Object.fromEntries(npm.map((p) => [p.name, p.downloads])),
  starsByRepo,
}))
console.error(`wrote build/sources.txt: ${npm.length} npm + ${gitSources.length} git`)
