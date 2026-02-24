-- Módulo: Views materializadas para Dashboard Analítico
-- View para KPIs por escola
CREATE OR REPLACE VIEW vw_dashboard_stats AS
SELECT
  e.id AS escola_id,
  (SELECT COUNT(*) FROM alunos a WHERE a.escola_id = e.id) AS total_alunos,
  (SELECT COUNT(*) FROM turmas t WHERE t.escola_id = e.id) AS total_turmas,
  (SELECT COUNT(*) FROM professores pr WHERE pr.escola_id = e.id) AS total_professores,
  (SELECT COUNT(*) FROM disciplinas d WHERE d.escola_id = e.id) AS total_disciplinas,
  (SELECT ROUND(AVG(n.valor), 2) FROM notas n
   JOIN turmas t2 ON t2.id = n.turma_id
   WHERE t2.escola_id = e.id) AS media_geral,
  (SELECT ROUND(
    COUNT(*) FILTER (WHERE f.status = 'presente') * 100.0 / NULLIF(COUNT(*), 0), 1
  ) FROM frequencia f
   JOIN aulas au ON au.id = f.aula_id
   JOIN turmas t3 ON t3.id = au.turma_id
   WHERE t3.escola_id = e.id) AS taxa_presenca
FROM escolas e;

-- View de alunos por turma
CREATE OR REPLACE VIEW vw_alunos_por_turma AS
SELECT
  t.escola_id,
  t.id AS turma_id,
  t.nome AS turma_nome,
  COUNT(m.id) AS total_alunos
FROM turmas t
LEFT JOIN matriculas m ON m.turma_id = t.id
GROUP BY t.escola_id, t.id, t.nome
ORDER BY t.nome;
