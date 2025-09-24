#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const nm = path.join(root, 'node_modules')

const patterns = [
  /"(postinstall|preinstall|install|prepare)"\s*:/,
  /(curl|wget|Invoke-WebRequest|powershell)/i,
  /new\s+Function\(/,
  /eval\(/,
  /atob\(/,
  /Buffer\.from\([^,]+,\s*['\"]base64['\"]\)/
]

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (/^(\.git|dist|build|\.cache|\.parcel-cache)$/.test(entry.name)) continue
      walk(p, acc)
    } else if (entry.name === 'package.json') {
      acc.push(p)
    }
  }
  return acc
}

let suspects = []
if (fs.existsSync(nm)) {
  const pkgs = walk(nm)
  for (const file of pkgs) {
    const content = fs.readFileSync(file, 'utf8')
    const hits = patterns.filter((re) => re.test(content))
    if (hits.length) {
      suspects.push({ file, hits: hits.map((r) => r.toString()) })
    }
  }
}

if (!suspects.length) {
  console.log('No suspicious install scripts found.')
  process.exit(0)
}

console.log(JSON.stringify(suspects, null, 2))
process.exit(1)



