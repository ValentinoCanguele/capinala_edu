-- Módulo: Horários
-- Tabela de salas de aula
CREATE TABLE IF NOT EXISTS salas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  capacidade SMALLINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(escola_id, nome)
);

-- Tabela principal de horários
CREATE TABLE IF NOT EXISTS horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  disciplina_id UUID NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES professores(id) ON DELETE SET NULL,
  sala_id UUID REFERENCES salas(id) ON DELETE SET NULL,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  ano_letivo_id UUID NOT NULL REFERENCES anos_letivos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (hora_fim > hora_inicio),
  UNIQUE(turma_id, dia_semana, hora_inicio, ano_letivo_id)
);

-- Índices para validação de conflitos
CREATE INDEX IF NOT EXISTS idx_horarios_professor ON horarios(professor_id, dia_semana, ano_letivo_id);
CREATE INDEX IF NOT EXISTS idx_horarios_sala ON horarios(sala_id, dia_semana, ano_letivo_id);
CREATE INDEX IF NOT EXISTS idx_horarios_turma ON horarios(turma_id, dia_semana, ano_letivo_id);

-- Função para validar conflitos de horário
CREATE OR REPLACE FUNCTION check_horario_conflict()
RETURNS TRIGGER AS $$
BEGIN
  -- Conflito de professor
  IF NEW.professor_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM horarios
    WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND professor_id = NEW.professor_id
      AND dia_semana = NEW.dia_semana
      AND ano_letivo_id = NEW.ano_letivo_id
      AND hora_inicio < NEW.hora_fim
      AND hora_fim > NEW.hora_inicio
  ) THEN
    RAISE EXCEPTION 'Conflito: professor já tem aula neste horário';
  END IF;

  -- Conflito de sala
  IF NEW.sala_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM horarios
    WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND sala_id = NEW.sala_id
      AND dia_semana = NEW.dia_semana
      AND ano_letivo_id = NEW.ano_letivo_id
      AND hora_inicio < NEW.hora_fim
      AND hora_fim > NEW.hora_inicio
  ) THEN
    RAISE EXCEPTION 'Conflito: sala já está ocupada neste horário';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_horario_conflict
  BEFORE INSERT OR UPDATE ON horarios
  FOR EACH ROW EXECUTE FUNCTION check_horario_conflict();
