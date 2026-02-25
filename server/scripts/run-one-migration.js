const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const migrationsDir = path.join(__dirname, '..', 'migrations')
const envPath = path.join(__dirname, '..', '.env')
const targetFiles = process.argv.slice(2)

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
  if (targetFiles.length === 0) {
    console.error('Uso: node run-one-migration.js <ficheiro.sql> [ficheiro2.sql ...]')
    process.exit(1)
  }
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Defina DATABASE_URL em server/.env')
    process.exit(1)
  }
  const pool = new Pool({ connectionString })
  for (const targetFile of targetFiles) {
    const filePath = path.join(migrationsDir, targetFile)
    if (!fs.existsSync(filePath)) {
      console.error('Ficheiro não encontrado:', filePath)
      await pool.end()
      process.exit(1)
    }
    const sql = fs.readFileSync(filePath, 'utf8')
    console.log('Running', targetFile)
    await pool.query(sql)
  }
  await pool.end()
  console.log('Done')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
