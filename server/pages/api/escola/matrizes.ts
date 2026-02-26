import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthUser } from '@/lib/auth'
import * as MatrizesService from '@/lib/escola/services/matrizes'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getAuthUser(req)
    if (!user) return res.status(401).json({ error: 'Não autorizado' })

    const { method } = req

    try {
        switch (method) {
            case 'GET':
                if (req.query.id) {
                    const matriz = await MatrizesService.getMatrizById(user, String(req.query.id))
                    return res.status(200).json(matriz)
                }
                const matrizes = await MatrizesService.getMatrizes(user)
                return res.status(200).json(matrizes)

            case 'POST':
                // Check if we are adding a discipline or creating a matrix
                if (req.query.action === 'addDisciplina') {
                    const disc = await MatrizesService.addDisciplinaToMatriz(user, req.body)
                    return res.status(201).json(disc)
                }
                if (req.query.action === 'vincularTurma') {
                    const linked = await MatrizesService.vincularTurmaAMatriz(user, req.body.turmaId, req.body.matrizId)
                    return res.status(200).json(linked)
                }
                if (req.query.action === 'clonar') {
                    const cloned = await MatrizesService.clonarMatriz(user, req.body.matrizOrigemId, req.body.novoNome, req.body.novoAnoLetivoId)
                    return res.status(201).json(cloned)
                }
                const newMatriz = await MatrizesService.createMatriz(user, req.body)
                return res.status(201).json(newMatriz)

            default:
                res.setHeader('Allow', ['GET', 'POST'])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    } catch (e: any) {
        res.status(400).json({ error: e.message })
    }
}
