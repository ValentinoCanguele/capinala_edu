/**
 * Executa apenas o seed completo (011_seed_completo.sql).
 * Use quando o schema já existir e quiser popular a base com dados de demonstração.
 */
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const migrationsDir = path.join(__dirname, '..', 'migrations')
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
    console.error('Crie server/.env com DATABASE_URL')
    process.exit(1)
  }
  const pool = new Pool({ connectionString })
  const file = '011_seed_completo.sql'
  const filePath = path.join(migrationsDir, file)
  if (!fs.existsSync(filePath)) {
    console.error('Ficheiro', file, 'não encontrado em', migrationsDir)
    process.exit(1)
  }
  const sql = fs.readFileSync(filePath, 'utf8')
  console.log('Running', file)
  await pool.query(sql)
  await pool.end()
  console.log('Seed completo aplicado.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
