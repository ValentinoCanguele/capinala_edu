-- =============================================================================
-- Seed completo: popular a base de dados para a Escola Demo
-- Executar após 002_seed.sql e 003_add_user_canguele.sql
-- Escola ID: 00000000-0000-0000-0000-000000000001
-- Senha dos novos utilizadores: demo123
-- =============================================================================

DO $$
DECLARE
  v_escola_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM escolas WHERE id = v_escola_id) THEN
    RAISE EXCEPTION 'Escola Demo não encontrada. Execute primeiro 002_seed.sql';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1. PESSOAS
-- -----------------------------------------------------------------------------
INSERT INTO pessoas (id, nome, email, data_nascimento) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Maria Direção', 'direcao@escola.demo', '1985-05-15'),
  ('a1000000-0000-0000-0000-000000000002', 'João Professor', 'joao.prof@escola.demo', '1988-03-20'),
  ('a1000000-0000-0000-0000-000000000003', 'Ana Professora', 'ana.prof@escola.demo', '1990-11-08'),
  ('a1000000-0000-0000-0000-000000000004', 'Carlos Responsável', 'carlos.resp@escola.demo', '1978-07-22'),
  ('a1000000-0000-0000-0000-000000000005', 'Sofia Responsável', 'sofia.resp@escola.demo', '1982-01-30'),
  ('a2000000-0000-0000-0000-000000000001', 'Luís Silva', 'luis.silva@aluno.demo', '2010-04-12'),
  ('a2000000-0000-0000-0000-000000000002', 'Mariana Costa', 'mariana.costa@aluno.demo', '2010-08-05'),
  ('a2000000-0000-0000-0000-000000000003', 'Pedro Santos', 'pedro.santos@aluno.demo', '2010-02-28'),
  ('a2000000-0000-0000-0000-000000000004', 'Inês Oliveira', 'ines.oliveira@aluno.demo', '2009-11-15'),
  ('a2000000-0000-0000-0000-000000000005', 'Tiago Ferreira', 'tiago.ferreira@aluno.demo', '2009-06-20'),
  ('a2000000-0000-0000-0000-000000000006', 'Rita Martins', 'rita.martins@aluno.demo', '2010-09-03'),
  ('a2000000-0000-0000-0000-000000000007', 'Miguel Alves', 'miguel.alves@aluno.demo', '2010-01-18'),
  ('a2000000-0000-0000-0000-000000000008', 'Beatriz Lima', 'beatriz.lima@aluno.demo', '2009-12-10')
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. USUÁRIOS (senha: demo123)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios (id, pessoa_id, escola_id, papel, password_hash)
SELECT t.id, t.pessoa_id, '00000000-0000-0000-0000-000000000001'::uuid, t.papel, 'demo123'
FROM (VALUES
  ('0f100000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 'direcao'::papel_enum),
  ('0f100000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 'professor'::papel_enum),
  ('0f100000-0000-0000-0000-000000000003'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid, 'professor'::papel_enum),
  ('0f100000-0000-0000-0000-000000000004'::uuid, 'a1000000-0000-0000-0000-000000000004'::uuid, 'responsavel'::papel_enum),
  ('0f100000-0000-0000-0000-000000000005'::uuid, 'a1000000-0000-0000-0000-000000000005'::uuid, 'responsavel'::papel_enum)
) AS t(id, pessoa_id, papel)
WHERE EXISTS (SELECT 1 FROM pessoas p WHERE p.id = t.pessoa_id)
ON CONFLICT (pessoa_id, escola_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. ALUNOS
-- -----------------------------------------------------------------------------
INSERT INTO alunos (id, pessoa_id, escola_id)
SELECT t.id, t.pessoa_id, '00000000-0000-0000-0000-000000000001'::uuid
FROM (VALUES
  ('b1000000-0000-0000-0000-000000000001'::uuid, 'a2000000-0000-0000-0000-000000000001'::uuid),
  ('b1000000-0000-0000-0000-000000000002'::uuid, 'a2000000-0000-0000-0000-000000000002'::uuid),
  ('b1000000-0000-0000-0000-000000000003'::uuid, 'a2000000-0000-0000-0000-000000000003'::uuid),
  ('b1000000-0000-0000-0000-000000000004'::uuid, 'a2000000-0000-0000-0000-000000000004'::uuid),
  ('b1000000-0000-0000-0000-000000000005'::uuid, 'a2000000-0000-0000-0000-000000000005'::uuid),
  ('b1000000-0000-0000-0000-000000000006'::uuid, 'a2000000-0000-0000-0000-000000000006'::uuid),
  ('b1000000-0000-0000-0000-000000000007'::uuid, 'a2000000-0000-0000-0000-000000000007'::uuid),
  ('b1000000-0000-0000-0000-000000000008'::uuid, 'a2000000-0000-0000-0000-000000000008'::uuid)
) AS t(id, pessoa_id)
WHERE EXISTS (SELECT 1 FROM pessoas p WHERE p.id = t.pessoa_id)
ON CONFLICT (pessoa_id, escola_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. PROFESSORES
-- -----------------------------------------------------------------------------
INSERT INTO professores (id, pessoa_id, escola_id)
SELECT t.id, t.pessoa_id, '00000000-0000-0000-0000-000000000001'::uuid
FROM (VALUES
  ('c1000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid),
  ('c1000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid)
) AS t(id, pessoa_id)
WHERE EXISTS (SELECT 1 FROM pessoas p WHERE p.id = t.pessoa_id)
ON CONFLICT (pessoa_id, escola_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. RESPONSÁVEIS
-- -----------------------------------------------------------------------------
INSERT INTO responsaveis (id, pessoa_id, escola_id)
SELECT t.id, t.pessoa_id, '00000000-0000-0000-0000-000000000001'::uuid
FROM (VALUES
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-0000-0000-000000000004'::uuid),
  ('d1000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-0000-0000-000000000005'::uuid)
) AS t(id, pessoa_id)
WHERE EXISTS (SELECT 1 FROM pessoas p WHERE p.id = t.pessoa_id)
  AND NOT EXISTS (SELECT 1 FROM responsaveis r WHERE r.pessoa_id = t.pessoa_id AND r.escola_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- -----------------------------------------------------------------------------
-- 6. VÍNCULO RESPONSÁVEL–ALUNO (Carlos → Luís, Mariana; Sofia → Pedro)
-- -----------------------------------------------------------------------------
INSERT INTO vinculo_responsavel_aluno (responsavel_id, aluno_id)
SELECT r.id, a.id
FROM responsaveis r
JOIN pessoas pr ON pr.id = r.pessoa_id
CROSS JOIN alunos a
JOIN pessoas pa ON pa.id = a.pessoa_id
WHERE (pr.email = 'carlos.resp@escola.demo' AND pa.email IN ('luis.silva@aluno.demo', 'mariana.costa@aluno.demo'))
   OR (pr.email = 'sofia.resp@escola.demo' AND pa.email = 'pedro.santos@aluno.demo')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. ANOS LETIVOS
-- -----------------------------------------------------------------------------
INSERT INTO anos_letivos (id, escola_id, nome, data_inicio, data_fim) VALUES
  ('e1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2024/2025', '2024-09-01', '2025-06-30'),
  ('e1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2025/2026', '2025-09-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 8. TURMAS
-- -----------------------------------------------------------------------------
INSERT INTO turmas (id, escola_id, ano_letivo_id, nome) VALUES
  ('f1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '10º A'),
  ('f1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '10º B'),
  ('f1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '11º A')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9. DISCIPLINAS
-- -----------------------------------------------------------------------------
INSERT INTO disciplinas (id, escola_id, nome) VALUES
  ('07100000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Matemática'),
  ('07100000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Português'),
  ('07100000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Física e Química'),
  ('07100000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'História'),
  ('07100000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Inglês')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 10. TURMA_DISCIPLINA (turma–disciplina–professor)
-- -----------------------------------------------------------------------------
INSERT INTO turma_disciplina (id, turma_id, disciplina_id, professor_id) VALUES
  ('0c000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', '07100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001'),
  ('0c000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', '07100000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002'),
  ('0c000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', '07100000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001'),
  ('0c000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000002', '07100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002'),
  ('0c000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000002', '07100000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001'),
  ('0c000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000003', '07100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 11. MATRÍCULAS (alunos nas turmas 10ºA e 10ºB)
-- -----------------------------------------------------------------------------
INSERT INTO matriculas (id, aluno_id, turma_id)
SELECT gen_random_uuid(), a.id, t.id
FROM alunos a
JOIN pessoas p ON p.id = a.pessoa_id
CROSS JOIN turmas t
WHERE t.nome = '10º A' AND p.email IN (
  'luis.silva@aluno.demo', 'mariana.costa@aluno.demo', 'pedro.santos@aluno.demo', 'ines.oliveira@aluno.demo'
)
ON CONFLICT (aluno_id, turma_id) DO NOTHING;

INSERT INTO matriculas (id, aluno_id, turma_id)
SELECT gen_random_uuid(), a.id, t.id
FROM alunos a
JOIN pessoas p ON p.id = a.pessoa_id
CROSS JOIN turmas t
WHERE t.nome = '10º B' AND p.email IN (
  'tiago.ferreira@aluno.demo', 'rita.martins@aluno.demo', 'miguel.alves@aluno.demo', 'beatriz.lima@aluno.demo'
)
ON CONFLICT (aluno_id, turma_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 12. PERÍODOS (4 bimestres por ano)
-- -----------------------------------------------------------------------------
INSERT INTO periodos (id, ano_letivo_id, numero, nome, data_inicio, data_fim) VALUES
  ('09100000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 1, '1º Bimestre', '2024-09-01', '2024-10-31'),
  ('09100000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 2, '2º Bimestre', '2024-11-01', '2024-12-20'),
  ('09100000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 3, '3º Bimestre', '2025-01-06', '2025-03-07'),
  ('09100000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001', 4, '4º Bimestre', '2025-03-10', '2025-06-30')
ON CONFLICT (ano_letivo_id, numero) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 13. NOTAS (amostra: 10ºA, Matemática e Português, 1º bimestre)
-- -----------------------------------------------------------------------------
INSERT INTO notas (id, aluno_id, turma_id, disciplina_id, periodo_id, valor)
SELECT gen_random_uuid(), m.aluno_id, m.turma_id, '07100000-0000-0000-0000-000000000001'::uuid, '09100000-0000-0000-0000-000000000001'::uuid,
  (8 + (random() * 2)::numeric(4,2))
FROM matriculas m
JOIN turmas t ON t.id = m.turma_id
WHERE t.nome = '10º A'
ON CONFLICT (aluno_id, turma_id, disciplina_id, periodo_id) DO NOTHING;

INSERT INTO notas (id, aluno_id, turma_id, disciplina_id, periodo_id, valor)
SELECT gen_random_uuid(), m.aluno_id, m.turma_id, '07100000-0000-0000-0000-000000000002'::uuid, '09100000-0000-0000-0000-000000000001'::uuid,
  (7 + (random() * 3)::numeric(4,2))
FROM matriculas m
JOIN turmas t ON t.id = m.turma_id
WHERE t.nome = '10º A'
ON CONFLICT (aluno_id, turma_id, disciplina_id, periodo_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 14. SALAS
-- -----------------------------------------------------------------------------
INSERT INTO salas (id, escola_id, nome, capacidade) VALUES
  ('08100000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sala 1', 25),
  ('08100000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Sala 2', 25),
  ('08100000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Sala 3', 30),
  ('08100000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Laboratório', 20)
ON CONFLICT (escola_id, nome) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 15. HORÁRIOS (10ºA: Segunda e Quarta, 2024/2025)
-- -----------------------------------------------------------------------------
INSERT INTO horarios (id, escola_id, turma_id, disciplina_id, professor_id, sala_id, dia_semana, hora_inicio, hora_fim, ano_letivo_id) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', '07100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '08100000-0000-0000-0000-000000000001', 1, '08:00', '08:45', 'e1000000-0000-0000-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', '07100000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', '08100000-0000-0000-0000-000000000002', 1, '09:00', '09:45', 'e1000000-0000-0000-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', '07100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '08100000-0000-0000-0000-000000000001', 3, '10:00', '10:45', 'e1000000-0000-0000-0000-000000000001')
ON CONFLICT (turma_id, dia_semana, hora_inicio, ano_letivo_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 16. AULAS E FREQUÊNCIA (uma aula de Matemática 10ºA, com presenças)
-- -----------------------------------------------------------------------------
INSERT INTO aulas (id, turma_id, disciplina_id, data_aula) VALUES
  ('0d000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', '07100000-0000-0000-0000-000000000001', '2024-09-02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO frequencia (id, aula_id, aluno_id, status)
SELECT gen_random_uuid(), '0d000000-0000-0000-0000-000000000001'::uuid, m.aluno_id, 'presente'::status_frequencia
FROM matriculas m
JOIN turmas t ON t.id = m.turma_id
WHERE t.nome = '10º A'
ON CONFLICT (aula_id, aluno_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 17. COMUNICADOS (criado_por = admin)
-- -----------------------------------------------------------------------------
INSERT INTO comunicados (id, escola_id, titulo, conteudo, destinatario_tipo, turma_id, criado_por)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, t.titulo, t.conteudo, t.tipo, t.turma_id, u.id
FROM (VALUES
  ('Bem-vindos ao ano letivo 2024/2025'::text, 'Informamos que as aulas têm início no dia 2 de setembro. Boas vindas a todos.'::text, 'todos'::text, NULL::uuid),
  ('Reunião de pais - 10º ano'::text, 'Convite para reunião de pais dos alunos do 10º ano, dia 15 de setembro às 18h.'::text, 'turma'::text, 'f1000000-0000-0000-0000-000000000001'::uuid),
  ('Aviso: feriado 5 de outubro'::text, 'O estabelecimento estará encerrado no dia 5 de outubro.'::text, 'todos'::text, NULL::uuid)
) AS t(titulo, conteudo, tipo, turma_id),
(SELECT u2.id FROM usuarios u2 JOIN pessoas p ON p.id = u2.pessoa_id WHERE p.email = 'admin@escola.demo' LIMIT 1) AS u(id)
WHERE u.id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM comunicados c WHERE c.titulo = t.titulo AND c.escola_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- -----------------------------------------------------------------------------
-- 18. AUDIT LOG (amostra)
-- -----------------------------------------------------------------------------
INSERT INTO audit_log (id, escola_id, usuario_id, acao, entidade, entidade_id, created_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, u.id, 'criar', 'aluno', a.id, now() - (i || ' days')::interval
FROM (SELECT u2.id FROM usuarios u2 JOIN pessoas p ON p.id = u2.pessoa_id WHERE p.email = 'admin@escola.demo' LIMIT 1) AS u(id),
     (SELECT al.id FROM alunos al LIMIT 1) AS a(id),
     generate_series(1, 3) AS i
WHERE NOT EXISTS (SELECT 1 FROM audit_log LIMIT 1);

-- -----------------------------------------------------------------------------
-- 19. ALERTAS (amostra não resolvidos)
-- -----------------------------------------------------------------------------
INSERT INTO alertas (id, escola_id, tipo, severidade, titulo, descricao, aluno_id, turma_id, resolvido)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'frequencia', 'atencao', 'Frequência baixa: Luís Silva', 'Presença de 72% na turma (mínimo 75%)', a.id, 'f1000000-0000-0000-0000-000000000001'::uuid, false
FROM alunos a
JOIN pessoas p ON p.id = a.pessoa_id
WHERE p.email = 'luis.silva@aluno.demo'
  AND NOT EXISTS (SELECT 1 FROM alertas al WHERE al.titulo = 'Frequência baixa: Luís Silva' AND al.escola_id = '00000000-0000-0000-0000-000000000001'::uuid)
LIMIT 1;
