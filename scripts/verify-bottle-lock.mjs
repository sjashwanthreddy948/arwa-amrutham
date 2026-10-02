import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'

const hashes = JSON.parse(
  readFileSync('artifacts/bottle-lock/hashes.json', 'utf8').replace(
    /^\uFEFF/,
    '',
  ),
)
for (const entry of hashes) {
  const file = entry.Path.split(/[\\/]/).at(-1)
  const hash = createHash('sha256')
    .update(readFileSync(`src/${file}`))
    .digest('hex')
    .toUpperCase()
  assert.equal(hash, entry.Hash, `${file}: locked bottle file changed`)
}
const original = readFileSync('artifacts/bottle-lock/App.tsx', 'utf8').replace(
  /\r\n/g,
  '\n',
)
const current = readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n')
for (const [start, end] of [
  ['class SceneBoundary', 'function Enquiry'],
  ['  const [hardware3D', '  const reduced'],
  ['  useEffect(() => {\n    const scroll', '  const p = products[product]'],
  ['      <SceneBoundary>', '      </SceneBoundary>'],
]) {
  const stop = current.includes(end) ? end : 'function Legal'
  const before = original.slice(
    original.indexOf(start),
    original.indexOf(end, original.indexOf(start)),
  )
  const after = current.slice(
    current.indexOf(start),
    current.indexOf(stop, current.indexOf(start)),
  )
  // New enquiry is imported; the boundary itself must remain identical.
  assert.equal(
    after.trim(),
    before.trim(),
    `Protected App block changed: ${start}`,
  )
}
const originalStyles = readFileSync('artifacts/bottle-lock/styles.css', 'utf8')
  .replace(/\r\n/g, '\n')
  .trim()
assert.equal(
  readFileSync('src/styles.css', 'utf8').replace(/\r\n/g, '\n').trim(),
  originalStyles,
  'Original scene and bottle CSS changed',
)
console.log(
  'PASS: all five bottle files, scene mounting, scroll animations, and original CSS are unchanged.',
)
