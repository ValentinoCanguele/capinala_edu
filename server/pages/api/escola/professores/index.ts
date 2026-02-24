import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { getDb } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            try {
                if (!user.escolaId) return jsonError(res, 'Usuário sem escola', 400)
                const db = getDb()
                const result = await db.query(
                    `SELECT pr.id, p.nome, p.email
           FROM professores pr
           JOIN pessoas p ON p.id = pr.pessoa_id
           WHERE pr.escola_id = $1
           ORDER BY p.nome`,
                    [user.escolaId]
                )
                jsonSuccess(res, result.rows)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao listar professores', 500)
            }
        })
    }
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
}
