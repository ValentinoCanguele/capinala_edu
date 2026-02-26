-- Tabela para configuração de pesos de períodos e exames
CREATE TABLE IF NOT EXISTS config_pedagogica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  ano_letivo_id UUID NOT NULL REFERENCES anos_letivos(id) ON DELETE CASCADE,
  
  -- Pesos dos Trimestres para Média Final Anual (MFA)
  peso_t1 NUMERIC(4,2) DEFAULT 1.0,
  peso_t2 NUMERIC(4,2) DEFAULT 1.0,
  peso_t3 NUMERIC(4,2) DEFAULT 1.0,
  
  -- Configuração de Exames
  minima_aprovacao_direta NUMERIC(4,2) DEFAULT 10.0,
  minima_acesso_exame NUMERIC(4,2) DEFAULT 7.0,
  peso_mfa_no_exame NUMERIC(4,2) DEFAULT 0.4, -- 40% MFA
  peso_exame_final NUMERIC(4,2) DEFAULT 0.6, -- 60% Exame
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(escola_id, ano_letivo_id)
);

-- Tabela para Notas de Exame (Recuperação/Melhoria)
CREATE TABLE IF NOT EXISTS exames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  disciplina_id UUID NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  periodo_id UUID REFERENCES periodos(id) ON DELETE CASCADE, -- NULL se for anual
  tipo TEXT NOT NULL DEFAULT 'recurso', -- 'recurso', 'melhoria', 'especial'
  valor NUMERIC(4,2) CHECK (valor >= 0 AND valor <= 20),
  data_exame DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(aluno_id, turma_id, disciplina_id, periodo_id, tipo)
);

-- Inserir config padrão para escolas existentes
INSERT INTO config_pedagogica (escola_id, ano_letivo_id)
SELECT escola_id, id FROM anos_letivos
ON CONFLICT DO NOTHING;
