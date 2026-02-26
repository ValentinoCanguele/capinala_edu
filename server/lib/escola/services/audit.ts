/**
 * Serviço de Audit Trail — registo de alterações.
 */
import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'

export type AcaoAudit =
    | 'criar' | 'atualizar' | 'eliminar'
    | 'lancar_nota' | 'registar_frequencia' | 'publicar_comunicado'
    | 'criar_ata' | 'atualizar_ata' | 'eliminar_ata'
    | 'lancar_exame' | 'eliminar_exame'
    | 'ocorrencia_disciplinar'
    | 'configurar'

export interface AuditEntry {
    acao: AcaoAudit
    entidade: string
    entidadeId?: string
    dadosAntes?: any
    dadosDepois?: any
    ip?: string
}

/**
 * Registar uma entrada no audit log.
 */
export async function registarAudit(user: AuthUser, entry: AuditEntry): Promise<void> {
    const db = getDb()
    await db.query(
        `INSERT INTO audit_log (escola_id, usuario_id, acao, entidade, entidade_id, dados_antes, dados_depois, ip)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)`,
        [
            user.escolaId,
            user.userId,
            entry.acao,
            entry.entidade,
            entry.entidadeId ?? null,
            entry.dadosAntes ? JSON.stringify(entry.dadosAntes) : null,
            entry.dadosDepois ? JSON.stringify(entry.dadosDepois) : null,
            entry.ip ?? null,
        ]
    )
}

/**
 * Consultar o log de auditoria.
 */
export async function listarAuditLog(
    user: AuthUser,
    opts: { entidade?: string; limit?: number } = {}
) {
    const db = getDb()
    if (!user.escolaId) throw new Error('Usuário sem escola definida')
    const limit = opts.limit ?? 50
    const conditions = ['a.escola_id = $1']
    const values: unknown[] = [user.escolaId]
    let i = 2

    if (opts.entidade) {
        conditions.push(`a.entidade = $${i++}`)
        values.push(opts.entidade)
    }

    values.push(limit)
    const result = await db.query(
        `SELECT a.id, a.acao, a.entidade, a.entidade_id AS "entidadeId",
            a.dados_antes AS "dadosAntes", a.dados_depois AS "dadosDepois",
            a.created_at AS "criadoEm",
            p.nome AS "usuarioNome"
     FROM audit_log a
     LEFT JOIN usuarios u ON u.id = a.usuario_id
     LEFT JOIN pessoas p ON p.id = u.pessoa_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.created_at DESC
     LIMIT $${i}`,
        values
    )
    return result.rows
}

/**
 * Registar um alerta automático.
 */
export async function criarAlerta(
    escolaId: string,
    data: {
        tipo: 'frequencia' | 'nota' | 'financeiro' | 'sistema'
        severidade: 'info' | 'atencao' | 'critico'
        titulo: string
        descricao?: string
        alunoId?: string
        turmaId?: string
    }
): Promise<void> {
    const db = getDb()
    await db.query(
        `INSERT INTO alertas (escola_id, tipo, severidade, titulo, descricao, aluno_id, turma_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [escolaId, data.tipo, data.severidade, data.titulo, data.descricao ?? null, data.alunoId ?? null, data.turmaId ?? null]
    )
}

/**
 * Listar alertas não resolvidos.
 */
export async function listarAlertasAtivos(user: AuthUser) {
    const db = getDb()
    if (!user.escolaId) throw new Error('Usuário sem escola definida')
    const result = await db.query(
        `SELECT a.id, a.tipo, a.severidade, a.titulo, a.descricao,
            a.aluno_id AS "alunoId", p.nome AS "alunoNome",
            a.turma_id AS "turmaId", t.nome AS "turmaNome",
            a.created_at AS "criadoEm"
     FROM alertas a
     LEFT JOIN alunos al ON al.id = a.aluno_id
     LEFT JOIN pessoas p ON p.id = al.pessoa_id
     LEFT JOIN turmas t ON t.id = a.turma_id
     WHERE a.escola_id = $1 AND a.resolvido = false
     ORDER BY
       CASE a.severidade WHEN 'critico' THEN 0 WHEN 'atencao' THEN 1 ELSE 2 END,
       a.created_at DESC
     LIMIT 100`,
        [user.escolaId]
    )
    return result.rows
}

/**
 * Marcar alerta como resolvido.
 */
export async function resolverAlerta(user: AuthUser, alertaId: string): Promise<boolean> {
    const db = getDb()
    if (!user.escolaId) throw new Error('Usuário sem escola definida')
    const result = await db.query(
        `UPDATE alertas SET resolvido = true, resolvido_por = $1, resolvido_em = now()
     WHERE id = $2 AND escola_id = $3 AND resolvido = false
     RETURNING id`,
        [user.userId, alertaId, user.escolaId]
    )
    return result.rowCount !== null && result.rowCount > 0
}
