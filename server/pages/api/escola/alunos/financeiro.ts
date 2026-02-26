import type { NextApiRequest, NextApiResponse } from 'next'
import { withEscolaAuth } from '@/lib/core/authContext'
import { listAlunosFinanceiro } from '@/lib/escola/services/alunos'
import type { AuthUser } from '@/lib/db'

export default withEscolaAuth(async (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const data = await listAlunosFinanceiro(user)
        return res.status(200).json(data)
    } catch (error: any) {
        return res.status(400).json({ error: error.message })
    }
})
