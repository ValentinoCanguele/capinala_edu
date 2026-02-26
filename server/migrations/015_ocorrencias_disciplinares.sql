-- Fase 4: Portal da Família e Comunicação
-- C4.1: Sistema de Ocorrências Disciplinares

CREATE TYPE tipo_ocorrencia AS ENUM ('advertencia_verbal', 'advertencia_escrita', 'participacao_disciplinar', 'suspensao', 'expulsao', 'elogio');
CREATE TYPE gravidade_ocorrencia AS ENUM ('leve', 'moderada', 'grave', 'critica');

CREATE TABLE IF NOT EXISTS ocorrencias_disciplinares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES turmas(id) ON DELETE SET NULL,
  professor_id UUID REFERENCES professores(id) ON DELETE SET NULL,
  data_ocorrencia DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo tipo_ocorrencia NOT NULL,
  gravidade gravidade_ocorrencia NOT NULL DEFAULT 'leve',
  descricao TEXT NOT NULL,
  medida_tomada TEXT,
  testemunhas TEXT[],
  anexos_urls TEXT[], -- URLs para fotos de justificativos ou provas
  resolvido BOOLEAN DEFAULT false,
  notificar_encarregado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexação para performance
CREATE INDEX IF NOT EXISTS idx_ocorrencias_aluno ON ocorrencias_disciplinares(aluno_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_escola ON ocorrencias_disciplinares(escola_id);

-- T3.1: Alertas automáticos baseados em ocorrências graves
-- (Ex: se uma expulsão ou suspensão for registada, cria um alerta na dashboard da direção)
