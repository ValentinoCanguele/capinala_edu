/**
 * Executa apenas a migration 010_nano_funcoes.sql (útil quando o DB já tem o schema das migrations anteriores).
 */
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const envPath = path.join(__dirname, '..', '.env')
function loadEnv() {
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (key) process.env[key] = value
  }
}
loadEnv()

async function run() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Defina DATABASE_URL em server/.env')
    process.exit(1)
  }
  const pool = new Pool({ connectionString })
  const sql = fs.readFileSync(
    path.join(__dirname, '..', 'migrations', '010_nano_funcoes.sql'),
    'utf8'
  )
  console.log('Running 010_nano_funcoes.sql')
  await pool.query(sql)
  await pool.end()
  console.log('Done')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
