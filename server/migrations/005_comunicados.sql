-- Módulo: Comunicados Internos
CREATE TABLE IF NOT EXISTS comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  destinatario_tipo TEXT NOT NULL DEFAULT 'todos' CHECK (destinatario_tipo IN ('todos', 'turma', 'papel')),
  turma_id UUID REFERENCES turmas(id) ON DELETE SET NULL,
  criado_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  publicado_em TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comunicados_escola ON comunicados(escola_id, publicado_em DESC);
CREATE INDEX IF NOT EXISTS idx_comunicados_turma ON comunicados(turma_id);
