const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const migrationsDir = path.join(__dirname, '..', 'migrations')
const envPath = path.join(__dirname, '..', '.env')

function loadEnv() {
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
}

loadEnv()

async function run() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Crie server/.env com DATABASE_URL (ex.: postgresql://user:pass@localhost:5432/gestao_escolar)')
    process.exit(1)
  }
  const pool = new Pool({ connectionString })
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    console.log('Running', file)
    await pool.query(sql)
  }
  await pool.end()
  console.log('Migrations done')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
