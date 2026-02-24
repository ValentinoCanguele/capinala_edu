import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { getDb } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }
  return requireAuth(req, res, async (user) => {
    if (user.papel !== 'responsavel') {
      return jsonSuccess(res, [])
    }
    const db = getDb()
    const result = await db.query(
      `SELECT a.id, p.nome, p.email, p.data_nascimento AS "dataNascimento"
       FROM alunos a
       JOIN pessoas p ON p.id = a.pessoa_id
       JOIN vinculo_responsavel_aluno v ON v.aluno_id = a.id
       JOIN responsaveis r ON r.id = v.responsavel_id
       WHERE r.pessoa_id = $1
       ORDER BY p.nome`,
      [user.pessoaId]
    )
    const list = result.rows.map((r) => ({
      id: r.id,
      nome: r.nome,
      email: r.email,
      dataNascimento: r.dataNascimento ? String(r.dataNascimento).slice(0, 10) : '',
    }))
    jsonSuccess(res, list)
  })
}
