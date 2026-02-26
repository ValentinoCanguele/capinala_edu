-- 1. Atualizar limite das notas para 0-20
ALTER TABLE notas DROP CONSTRAINT IF EXISTS notas_valor_check;
ALTER TABLE notas ADD CONSTRAINT notas_valor_check CHECK (valor >= 0 AND valor <= 20);

-- 2. Tabela de Atas (Conselho de Turma)
CREATE TABLE IF NOT EXISTS atas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  periodo_id UUID REFERENCES periodos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data_reuniao DATE NOT NULL DEFAULT CURRENT_DATE,
  participantes JSONB DEFAULT '[]', -- IDs de professores/direção presentes
  decisoes JSONB DEFAULT '[]', -- Sumário de decisões tomadas
  assinatura_digital TEXT, -- Hash ou identificador da assinatura
  criado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_atas_turma ON atas(turma_id);
CREATE INDEX IF NOT EXISTS idx_atas_escola ON atas(escola_id);
