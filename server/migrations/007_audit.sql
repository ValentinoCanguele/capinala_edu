-- Módulo: Audit Trail — Rastreamento de Alterações
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidade_id UUID,
  dados_antes JSONB,
  dados_depois JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_escola ON audit_log(escola_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entidade ON audit_log(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id);

-- Tabela de alertas automáticos
CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('frequencia', 'nota', 'financeiro', 'sistema')),
  severidade TEXT NOT NULL DEFAULT 'info' CHECK (severidade IN ('info', 'atencao', 'critico')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  resolvido BOOLEAN DEFAULT false,
  resolvido_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  resolvido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alertas_escola ON alertas(escola_id, resolvido, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_aluno ON alertas(aluno_id);
