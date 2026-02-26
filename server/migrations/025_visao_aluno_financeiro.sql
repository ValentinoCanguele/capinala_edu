-- Migration 025: Visão Integrada Aluno + Financeiro (Modelo SaaS Angola)
-- Combina dados de matrícula, turma e status financeiro (Propinas/Parcelas vs Pagamentos)

CREATE OR REPLACE VIEW vw_aluno_financeiro AS
WITH pagamentos_por_parcela AS (
    SELECT 
        parcela_id,
        COALESCE(SUM(valor), 0) AS total_pago
    FROM pagamentos
    GROUP BY parcela_id
),
resumo_parcelas AS (
    SELECT 
        p.aluno_id,
        p.escola_id,
        COUNT(p.id) FILTER (WHERE fn_financeiro_parcela_esta_atrasada(p.vencimento, p.status::TEXT, current_date)) as parcelas_atrasadas,
        COALESCE(SUM(p.valor_atualizado), 0) as total_propina,
        COALESCE(SUM(pg.total_pago), 0) as total_pago,
        COALESCE(SUM(p.valor_atualizado) - SUM(pg.total_pago), 0) as divida_total
    FROM parcelas p
    LEFT JOIN pagamentos_por_parcela pg ON pg.parcela_id = p.id
    GROUP BY p.aluno_id, p.escola_id
)
SELECT 
    a.id,
    a.escola_id,
    pes.nome AS nome_completo,
    pes.email AS email,
    t.nome AS turma,
    COALESCE(rp.total_propina, 0) as valor_propina,
    COALESCE(rp.total_pago, 0) as valor_pago,
    COALESCE(rp.divida_total, 0) as valor_divida,
    CASE 
        WHEN rp.parcelas_atrasadas > 0 THEN 'Em Dívida'
        WHEN rp.divida_total > 0 THEN 'Pendente'
        ELSE 'Regularizado'
    END as status_financeiro,
    COALESCE(
        ROUND((NULLIF(rp.total_pago, 0) / NULLIF(rp.total_propina, 0)) * 100, 2), 
        0
    ) as percentual_pago
FROM alunos a
JOIN pessoas pes ON pes.id = a.pessoa_id
LEFT JOIN matriculas m ON m.aluno_id = a.id
LEFT JOIN turmas t ON t.id = m.turma_id
LEFT JOIN resumo_parcelas rp ON rp.aluno_id = a.id AND rp.escola_id = a.escola_id;

COMMENT ON VIEW vw_aluno_financeiro IS 'Visão de painel de alunos com métricas de assiduidade financeira em Kz';
