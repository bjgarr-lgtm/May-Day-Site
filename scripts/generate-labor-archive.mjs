import fs from 'fs'
import path from 'path'
import collectionsConfig from '../src/archive/laborArchiveCollections.config.js'

const publicArchiveDir = path.resolve(process.cwd(), 'public/archive')
const outputFile = path.resolve(process.cwd(), 'src/archive/laborArchiveData.js')

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif'])

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Missing directory: ${dir}`)
  }
}

function walkImages(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let results = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(walkImages(fullPath, baseDir))
      continue
    }

    const ext = path.extname(entry.name).toLowerCase()
    if (IMAGE_EXTENSIONS.has(ext)) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
      results.push(relativePath)
    }
  }

  return results
}

function buildPagesForCollection(slug) {
  const folder = path.join(publicArchiveDir, slug)
  ensureDirExists(folder)

  const imagePaths = walkImages(folder, publicArchiveDir).sort(naturalCompare)

  return imagePaths.map((relativePath, index) => ({
    src: `/archive/${relativePath}`,
    title: `Page ${index + 1}`,
    summary: '',
    keywords: [],
  }))
}

const data = collectionsConfig.map((collection) => {
  const pages = buildPagesForCollection(collection.slug)

  return {
    id: collection.id || collection.slug,
    title: collection.title || collection.slug,
    year: collection.year ?? null,
    event: collection.event || '',
    tags: collection.tags || [],
    description: collection.description || '',
    pages,
  }
})

const output = `const laborArchiveData = ${JSON.stringify(data, null, 2)}\n\nexport default laborArchiveData\n`

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, output, 'utf8')

console.log(`Wrote ${outputFile}`)
console.log(`Collections: ${data.length}`)
console.log(`Pages: ${data.reduce((sum, item) => sum + item.pages.length, 0)}`)