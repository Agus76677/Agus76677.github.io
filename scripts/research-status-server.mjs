import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataFile = path.join(__dirname, '..', 'site', 'src', 'data', 'research-status.json')
const host = '127.0.0.1'
const port = 4322
const allowedOrigins = new Set(['http://127.0.0.1:4321', 'http://localhost:4321'])
const allowedLevels = new Set([1, 2, 3, 4, 5])

const sendJson = (res, statusCode, payload, origin = '') => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'http://127.0.0.1:4321',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  })
  res.end(JSON.stringify(payload))
}

const normalizeRatings = (value) => {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const result = {}
  for (const [key, rawLevel] of Object.entries(value)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      continue
    }
    if (allowedLevels.has(rawLevel)) {
      result[key] = rawLevel
    }
  }
  return result
}

const readRatings = async () => {
  try {
    const content = await readFile(dataFile, 'utf8')
    return normalizeRatings(JSON.parse(content))
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {}
    }
    throw error
  }
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin ?? ''

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'http://127.0.0.1:4321',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    res.end()
    return
  }

  if (req.url !== '/research-status') {
    sendJson(res, 404, { error: 'Not found' }, origin)
    return
  }

  if (req.method === 'GET') {
    const ratings = await readRatings()
    sendJson(res, 200, ratings, origin)
    return
  }

  if (req.method === 'POST') {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) {
        req.destroy(new Error('Payload too large'))
      }
    })

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const normalized = normalizeRatings(parsed)
        await writeFile(dataFile, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8')
        sendJson(res, 200, { ok: true, count: Object.keys(normalized).length }, origin)
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Invalid payload' }, origin)
      }
    })
    return
  }

  sendJson(res, 405, { error: 'Method not allowed' }, origin)
})

server.listen(port, host, () => {
  console.log(`Research status server listening on http://${host}:${port}`)
})
