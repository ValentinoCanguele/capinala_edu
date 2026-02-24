-- Sistema: escolas e papéis
CREATE TABLE IF NOT EXISTS escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE papel_enum AS ENUM ('admin', 'direcao', 'professor', 'responsavel', 'aluno');

-- Pessoas e usuários
CREATE TABLE IF NOT EXISTS pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  data_nascimento DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  escola_id UUID REFERENCES escolas(id) ON DELETE SET NULL,
  papel papel_enum NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pessoa_id, escola_id)
);

CREATE TABLE IF NOT EXISTS alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pessoa_id, escola_id)
);

CREATE TABLE IF NOT EXISTS responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  escola_id UUID REFERENCES escolas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vinculo_responsavel_aluno (
  responsavel_id UUID NOT NULL REFERENCES responsaveis(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  PRIMARY KEY (responsavel_id, aluno_id)
);

CREATE TABLE IF NOT EXISTS professores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pessoa_id, escola_id)
);

-- Académico
CREATE TABLE IF NOT EXISTS anos_letivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  ano_letivo_id UUID NOT NULL REFERENCES anos_letivos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS disciplinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS turma_disciplina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  disciplina_id UUID NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES professores(id) ON DELETE SET NULL,
  UNIQUE(turma_id, disciplina_id)
);

CREATE TABLE IF NOT EXISTS matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(aluno_id, turma_id)
);

-- Avaliação
CREATE TABLE IF NOT EXISTS periodos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ano_letivo_id UUID NOT NULL REFERENCES anos_letivos(id) ON DELETE CASCADE,
  numero SMALLINT NOT NULL,
  nome TEXT,
  data_inicio DATE,
  data_fim DATE,
  UNIQUE(ano_letivo_id, numero)
);

CREATE TABLE IF NOT EXISTS notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  disciplina_id UUID NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  periodo_id UUID NOT NULL REFERENCES periodos(id) ON DELETE CASCADE,
  valor NUMERIC(4,2) NOT NULL CHECK (valor >= 0 AND valor <= 10),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(aluno_id, turma_id, disciplina_id, periodo_id)
);

-- Frequência
CREATE TABLE IF NOT EXISTS aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  disciplina_id UUID NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  data_aula DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE status_frequencia AS ENUM ('presente', 'falta', 'justificada');

CREATE TABLE IF NOT EXISTS frequencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  status status_frequencia NOT NULL DEFAULT 'presente',
  UNIQUE(aula_id, aluno_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_alunos_escola ON alunos(escola_id);
CREATE INDEX IF NOT EXISTS idx_turmas_ano ON turmas(ano_letivo_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(turma_id);
CREATE INDEX IF NOT EXISTS idx_notas_aluno_periodo ON notas(aluno_id, periodo_id);
CREATE INDEX IF NOT EXISTS idx_notas_turma_periodo ON notas(turma_id, periodo_id);
CREATE INDEX IF NOT EXISTS idx_frequencia_aula ON frequencia(aula_id);
