-- Metadados avançados em pessoas (BI, foto, telefone)
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS foto_caminho TEXT;
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS bi TEXT;
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS bi_emitido_em DATE;
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS bi_valido_ate DATE;

-- Documentos (pessoa ou aluno)
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  nome_ficheiro TEXT NOT NULL,
  tipo_mime TEXT,
  tamanho INT,
  caminho TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT documentos_owner CHECK (pessoa_id IS NOT NULL OR aluno_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_documentos_pessoa ON documentos(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_aluno ON documentos(aluno_id);

-- Permissões granulares
CREATE TABLE IF NOT EXISTS permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS usuario_permissoes (
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  permissao_id UUID NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, permissao_id)
);

-- Seed permissões básicas
INSERT INTO permissoes (codigo, descricao) VALUES
  ('alunos.ver', 'Ver listagem de alunos'),
  ('alunos.criar', 'Criar alunos'),
  ('alunos.editar', 'Editar alunos'),
  ('alunos.eliminar', 'Eliminar alunos'),
  ('turmas.gerir', 'Gerir turmas e matrículas'),
  ('notas.lancar', 'Lançar notas'),
  ('frequencia.registar', 'Registar frequência'),
  ('comunicados.publicar', 'Publicar comunicados'),
  ('usuarios.gerir', 'Gerir utilizadores e permissões'),
  ('auditoria.ver', 'Ver auditoria')
ON CONFLICT (codigo) DO NOTHING;
