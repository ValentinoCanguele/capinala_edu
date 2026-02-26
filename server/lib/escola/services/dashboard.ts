import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { getEscolaId } from '../core/authContext'


export async function getDashboardStats(user: AuthUser) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    // KPIs gerais
    const statsResult = await db.query(
        `SELECT total_alunos AS "totalAlunos",
            total_turmas AS "totalTurmas",
            total_professores AS "totalProfessores",
            total_disciplinas AS "totalDisciplinas",
            media_geral AS "mediaGeral",
            taxa_presenca AS "taxaPresenca"
     FROM vw_dashboard_stats
     WHERE escola_id = $1`,
        [escolaId]
    )

    const stats = statsResult.rows[0] ?? {
        totalAlunos: 0,
        totalTurmas: 0,
        totalProfessores: 0,
        totalDisciplinas: 0,
        mediaGeral: null,
        taxaPresenca: null,
    }

    // Alunos por turma
    const turmaResult = await db.query(
        `SELECT turma_nome AS "turmaNome", total_alunos AS "total"
     FROM vw_alunos_por_turma
     WHERE escola_id = $1`,
        [escolaId]
    )

    return {
        ...stats,
        totalAlunos: Number(stats.totalAlunos),
        totalTurmas: Number(stats.totalTurmas),
        totalProfessores: Number(stats.totalProfessores),
        totalDisciplinas: Number(stats.totalDisciplinas),
        mediaGeral: stats.mediaGeral !== null ? Number(stats.mediaGeral) : null,
        taxaPresenca: stats.taxaPresenca !== null ? Number(stats.taxaPresenca) : null,
        alunosPorTurma: turmaResult.rows.map((r: { turmaNome: string; total: string }) => ({
            turmaNome: r.turmaNome,
            total: Number(r.total),
        })),
    }
}
