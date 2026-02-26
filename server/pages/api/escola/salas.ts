import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthUser } from '@/lib/auth'
import * as SalasService from '@/lib/escola/services/salas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getAuthUser(req)
    if (!user) return res.status(401).json({ error: 'Não autorizado' })

    const { method, query } = req

    try {
        switch (method) {
            case 'GET':
                if (query.action === 'audit') {
                    const audit = await SalasService.getAuditOcupacaoSalas(user, String(query.anoLetivoId))
                    return res.status(200).json(audit)
                }
                const salas = await SalasService.getSalas(user)
                return res.status(200).json(salas)

            case 'POST':
                const newSala = await SalasService.createSala(user, req.body)
                return res.status(201).json(newSala)

            case 'PATCH':
                const updated = await SalasService.updateSala(user, String(query.id), req.body)
                return res.status(200).json(updated)

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PATCH'])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    } catch (e: any) {
        res.status(400).json({ error: e.message })
    }
}
