-- Módulos do sistema: instalar, desinstalar, modificar, permissões por papel
CREATE TABLE IF NOT EXISTS sistema_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem SMALLINT NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  permissoes JSONB NOT NULL DEFAULT '["admin","direcao","professor","responsavel"]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON COLUMN sistema_modulos.chave IS 'Identificador único do módulo (ex: alunos, financas)';
COMMENT ON COLUMN sistema_modulos.permissoes IS 'Array de papéis que podem aceder (ex: ["admin","direcao"]). Vazio = todos.';
COMMENT ON COLUMN sistema_modulos.config IS 'Configurações específicas do módulo (JSON livre).';

CREATE INDEX IF NOT EXISTS idx_sistema_modulos_ativo ON sistema_modulos(ativo);
CREATE INDEX IF NOT EXISTS idx_sistema_modulos_ordem ON sistema_modulos(ordem);

-- Seed: módulos correspondentes ao menu actual (chave = rota base)
INSERT INTO sistema_modulos (chave, nome, descricao, ativo, ordem, permissoes) VALUES
  ('inicio', 'Início', 'Dashboard e resumo', true, 0, '["admin","direcao","professor","responsavel"]'),
  ('alunos', 'Alunos', 'Listagem e cadastro de alunos', true, 10, '["admin","direcao","professor"]'),
  ('turmas', 'Turmas', 'Turmas e matrículas', true, 20, '["admin","direcao","professor"]'),
  ('notas', 'Notas', 'Lançamento de notas', true, 30, '["admin","direcao","professor"]'),
  ('frequencia', 'Frequência', 'Registo de presenças', true, 40, '["admin","direcao","professor"]'),
  ('boletim', 'Boletim', 'Consultar boletins', true, 50, '["admin","direcao","professor","responsavel"]'),
  ('horarios', 'Horários', 'Horários de turmas', true, 60, '["admin","direcao","professor","responsavel"]'),
  ('comunicados', 'Comunicados', 'Comunicados da escola', true, 70, '["admin","direcao","professor","responsavel"]'),
  ('disciplinas', 'Disciplinas', 'Gerir disciplinas', true, 80, '["admin","direcao"]'),
  ('anos-letivos', 'Anos letivos', 'Gerir anos letivos', true, 90, '["admin","direcao"]'),
  ('salas', 'Salas', 'Gerir salas', true, 100, '["admin","direcao"]'),
  ('financas', 'Finanças', 'Receitas, despesas e parcelas', true, 110, '["admin","direcao"]'),
  ('auditoria', 'Auditoria', 'Log de alterações', true, 120, '["admin"]'),
  ('definicoes', 'Definições', 'Módulos e configurações do sistema', true, 200, '["admin"]')
ON CONFLICT (chave) DO NOTHING;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION set_sistema_modulos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sistema_modulos_updated ON sistema_modulos;
CREATE TRIGGER tr_sistema_modulos_updated
  BEFORE UPDATE ON sistema_modulos
  FOR EACH ROW EXECUTE FUNCTION set_sistema_modulos_updated_at();
