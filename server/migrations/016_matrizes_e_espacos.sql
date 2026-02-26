-- Fase 1: Matrizes Curriculares e Alocação Avançada (Core)
-- M1.0: Gestão de Matrizes Curriculares

-- Tabela de Matrizes Curriculares (Template de Plano de Estudos)
CREATE TABLE IF NOT EXISTS matrizes_curriculares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL, -- Ex: "Plano Geral 1º Ciclo", "Científico-Tecnológico"
  grau_escolar TEXT, -- Ex: "10º Ano", "Ensino Primário"
  ano_letivo_inicio UUID REFERENCES anos_letivos(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Disciplinas vinculadas à Matriz
CREATE TABLE IF NOT EXISTS matriz_disciplinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matriz_id UUID NOT NULL REFERENCES matrizes_curriculares(id) ON DELETE CASCADE,
  disciplina_name TEXT NOT NULL, -- Pode referenciar disciplinas existentes ou ser apenas o nome para o template
  carga_horaria_teorica INT DEFAULT 0, -- Horas semanais
  carga_horaria_pratica INT DEFAULT 0,
  carga_total INT GENERATED ALWAYS AS (carga_horaria_teorica + carga_horaria_pratica) STORED,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vincular Turmas a uma Matriz
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS matriz_curricular_id UUID REFERENCES matrizes_curriculares(id) ON DELETE SET NULL;

-- M1.1: Alocação Avançada de Espaços
-- Adicionar equipamento e tipo às salas
CREATE TYPE tipo_sala AS ENUM ('sala_aula', 'laboratorio', 'biblioteca', 'ginasio', 'informatica', 'outro');

ALTER TABLE salas ADD COLUMN IF NOT EXISTS tipo tipo_sala DEFAULT 'sala_aula';
ALTER TABLE salas ADD COLUMN IF NOT EXISTS equipamentos JSONB DEFAULT '[]'::jsonb; -- Ex: ["projetor", "ar_condicionado"]
ALTER TABLE salas ADD COLUMN IF NOT EXISTS area_m2 NUMERIC(6,2);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_matriz_escola ON matrizes_curriculares(escola_id);
CREATE INDEX IF NOT EXISTS idx_matriz_disciplinas_matriz ON matriz_disciplinas(matriz_id);
