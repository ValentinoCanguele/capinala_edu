import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { getDb } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }
  return requireAuth(req, res, async (user) => {
    if (user.papel !== 'aluno') {
      return jsonSuccess(res, { alunoId: null })
    }
    const db = getDb()
    const r = await db.query(
      'SELECT id FROM alunos WHERE pessoa_id = $1 LIMIT 1',
      [user.pessoaId]
    )
    const alunoId = r.rows[0]?.id ?? null
    jsonSuccess(res, { alunoId })
  })
}
