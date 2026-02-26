-- 026_modulo_saas_angola.sql
-- Migration para adicionar políticas de Row Level Security (RLS) baseada em escola_id
-- e criação da view financeira avançada para Angola.

-- 1. Função utilitária para buscar o escola_id do token atual.
-- Busca primeiramente no app_metadata, depois user_metadata e por fim no root do jwt.
CREATE OR REPLACE FUNCTION get_auth_escola_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'escola_id')::uuid,
    (current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'escola_id')::uuid,
    (current_setting('request.jwt.claims', true)::json ->> 'escola_id')::uuid
  );
$$;

-- 2. Habilitando RLS nas tabelas principais
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE anos_letivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

-- 3. Criando as políticas de acesso usando o get_auth_escola_id()
-- O admin do sistema ou super admin pode contornar isso com bypass RLS,
-- mas a aplicação em geral vai usar essas regras para SaaS.

DROP POLICY IF EXISTS "Isolamento SaaS - escolas" ON escolas;
CREATE POLICY "Isolamento SaaS - escolas"
ON escolas FOR ALL
USING (id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

DROP POLICY IF EXISTS "Isolamento SaaS - usuarios" ON usuarios;
CREATE POLICY "Isolamento SaaS - usuarios"
ON usuarios FOR ALL
USING (escola_id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

DROP POLICY IF EXISTS "Isolamento SaaS - alunos" ON alunos;
CREATE POLICY "Isolamento SaaS - alunos"
ON alunos FOR ALL
USING (escola_id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

DROP POLICY IF EXISTS "Isolamento SaaS - responsaveis" ON responsaveis;
CREATE POLICY "Isolamento SaaS - responsaveis"
ON responsaveis FOR ALL
USING (escola_id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

DROP POLICY IF EXISTS "Isolamento SaaS - professores" ON professores;
CREATE POLICY "Isolamento SaaS - professores"
ON professores FOR ALL
USING (escola_id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

DROP POLICY IF EXISTS "Isolamento SaaS - anos_letivos" ON anos_letivos;
CREATE POLICY "Isolamento SaaS - anos_letivos"
ON anos_letivos FOR ALL
USING (escola_id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

DROP POLICY IF EXISTS "Isolamento SaaS - turmas" ON turmas;
CREATE POLICY "Isolamento SaaS - turmas"
ON turmas FOR ALL
USING (escola_id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

DROP POLICY IF EXISTS "Isolamento SaaS - disciplinas" ON disciplinas;
CREATE POLICY "Isolamento SaaS - disciplinas"
ON disciplinas FOR ALL
USING (escola_id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

DROP POLICY IF EXISTS "Isolamento SaaS - parcelas" ON parcelas;
CREATE POLICY "Isolamento SaaS - parcelas"
ON parcelas FOR ALL
USING (escola_id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

DROP POLICY IF EXISTS "Isolamento SaaS - lancamentos" ON lancamentos;
CREATE POLICY "Isolamento SaaS - lancamentos"
ON lancamentos FOR ALL
USING (escola_id = get_auth_escola_id() OR get_auth_escola_id() IS NULL);

-- Como Pessoas não tem escola_id, permitimos ver pessoas que estão ligadas a usuarios, alunos ou professores da escola
DROP POLICY IF EXISTS "Isolamento SaaS - pessoas" ON pessoas;
CREATE POLICY "Isolamento SaaS - pessoas"
ON pessoas FOR ALL
USING (get_auth_escola_id() IS NULL OR EXISTS (
  SELECT 1 FROM alunos auth_a WHERE auth_a.pessoa_id = pessoas.id AND auth_a.escola_id = get_auth_escola_id()
  UNION
  SELECT 1 FROM professores auth_p WHERE auth_p.pessoa_id = pessoas.id AND auth_p.escola_id = get_auth_escola_id()
  UNION
  SELECT 1 FROM usuarios auth_u WHERE auth_u.pessoa_id = pessoas.id AND auth_u.escola_id = get_auth_escola_id()
  UNION
  SELECT 1 FROM responsaveis auth_r WHERE auth_r.pessoa_id = pessoas.id AND auth_r.escola_id = get_auth_escola_id()
));

-- 4. View Financeira Avançada
-- Adiciona sumario do faturamento e recebimentos por aluno, evitando duplicação na agregação.
DROP VIEW IF EXISTS financeiro_resumo;
CREATE OR REPLACE VIEW financeiro_resumo AS
WITH pagamentos_agg AS (
  SELECT parcela_id, SUM(valor) as total_pago
  FROM pagamentos
  GROUP BY parcela_id
),
parcelas_agg AS (
  SELECT 
    par.aluno_id,
    par.ano_letivo_id,
    par.escola_id,
    SUM(par.valor_original) as total_faturado,
    SUM(COALESCE(pag.total_pago, 0)) as total_pago
  FROM parcelas par
  LEFT JOIN pagamentos_agg pag ON par.id = pag.parcela_id
  WHERE par.status != 'cancelada'
  GROUP BY par.aluno_id, par.ano_letivo_id, par.escola_id
)
SELECT
  a.id AS aluno_id,
  p.nome AS nome_completo,
  t.nome AS turma,
  t.id AS turma_id,
  al.nome AS ano_letivo,
  al.id AS ano_letivo_id,
  a.escola_id,
  COALESCE(pa.total_faturado, 0) AS total_faturado,
  COALESCE(pa.total_pago, 0) AS total_pago,
  COALESCE(pa.total_faturado, 0) - COALESCE(pa.total_pago, 0) AS total_divida
FROM alunos a
JOIN pessoas p ON a.pessoa_id = p.id
LEFT JOIN matriculas m ON m.aluno_id = a.id
LEFT JOIN turmas t ON m.turma_id = t.id
LEFT JOIN anos_letivos al ON al.id = t.ano_letivo_id
LEFT JOIN parcelas_agg pa ON pa.aluno_id = a.id AND pa.ano_letivo_id = al.id AND pa.escola_id = a.escola_id;

-- FIM DA MIGRATION
