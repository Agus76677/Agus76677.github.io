import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const distDir = resolve(process.cwd(), 'dist')
const compatDir = resolve(distDir, 'myblog')

async function main() {
  await rm(compatDir, { recursive: true, force: true })
  await mkdir(compatDir, { recursive: true })

  const entries = await readdir(distDir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'myblog') continue
    const src = resolve(distDir, entry.name)
    const dest = resolve(compatDir, entry.name)
    await cp(src, dest, { recursive: true })
  }

  console.log('[compat] copied dist/* to dist/myblog/* for legacy path compatibility')
}

main().catch((error) => {
  console.error('[compat] failed:', error)
  process.exit(1)
})
