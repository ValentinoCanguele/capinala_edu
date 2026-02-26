-- Fase 1: Detalhes de Refinamento de Matrizes e Espaços (Total Precision)
-- Expansão para suporte a grupos de disciplinas, fórmulas e regras normativas.

-- 1. Expansão de Tipos semânticos para Disciplinas
CREATE TYPE grupo_disciplina AS ENUM ('ciencias', 'humanidades', 'linguas', 'tecnicas', 'artes', 'fisico-motoras', 'comportamental', 'outro');

-- 2. Refinamento de matrizes_curriculares (Versionamento e Herança)
ALTER TABLE matrizes_curriculares ADD COLUMN IF NOT EXISTS versao INT DEFAULT 1;
ALTER TABLE matrizes_curriculares ADD COLUMN IF NOT EXISTS matriz_pai_id UUID REFERENCES matrizes_curriculares(id) ON DELETE SET NULL;
ALTER TABLE matrizes_curriculares ADD COLUMN IF NOT EXISTS notas_normativas TEXT; -- Ex: Notas sobre transição de ciclo

-- 3. Refinamento de matriz_disciplinas (Grupos, Fórmulas e Pesos)
ALTER TABLE matriz_disciplinas ADD COLUMN IF NOT EXISTS grupo grupo_disciplina DEFAULT 'outro';
ALTER TABLE matriz_disciplinas ADD COLUMN IF NOT EXISTS formula_media TEXT DEFAULT '(MAC * 0.4) + (NPP * 0.6)'; -- Fórmula padrão
ALTER TABLE matriz_disciplinas ADD COLUMN IF NOT EXISTS peso_na_media NUMERIC(4,2) DEFAULT 1.0;
ALTER TABLE matriz_disciplinas ADD COLUMN IF NOT EXISTS obrigatoria BOOLEAN DEFAULT true;
ALTER TABLE matriz_disciplinas ADD COLUMN IF NOT EXISTS nota_minima_aprovacao NUMERIC(4,2) DEFAULT 10.0;

-- 4. Refinamento de Salas (Manutenção e Estado Técnica)
CREATE TYPE estado_conservacao AS ENUM ('novo', 'bom', 'regular', 'precisa_reparacao', 'inutilizavel');
ALTER TABLE salas ADD COLUMN IF NOT EXISTS estado_conservacao estado_conservacao DEFAULT 'bom';
ALTER TABLE salas ADD COLUMN IF NOT EXISTS data_ultima_manutencao DATE DEFAULT current_date;
ALTER TABLE salas ADD COLUMN IF NOT EXISTS log_manutencao JSONB DEFAULT '[]'::jsonb;

-- 5. Índices para performance em grandes volumes
CREATE INDEX IF NOT EXISTS idx_matriz_disciplinas_grupo ON matriz_disciplinas(grupo);
CREATE INDEX IF NOT EXISTS idx_salas_tipo ON salas(tipo);
CREATE INDEX IF NOT EXISTS idx_salas_estado ON salas(estado_conservacao);

COMMENT ON COLUMN matriz_disciplinas.formula_media IS 'JavaScript expression for grade calc. Props: MAC, NPP, NE, NFE.';
COMMENT ON COLUMN salas.log_manutencao IS 'Array of {data, descricao, tecnico, custo}';
