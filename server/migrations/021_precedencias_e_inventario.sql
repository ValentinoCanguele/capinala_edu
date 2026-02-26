-- Migration 021: Precedências Académicas & Inventário Estruturado
-- M1.0.3: Regras de Precedência Curricular
-- M1.1.1: Inventário Técnico de Salas

-- 1. Tabela de Precedências (Cadeiras que bloqueiam outras)
CREATE TABLE IF NOT EXISTS matriz_disciplina_precedencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_alvo_id UUID NOT NULL REFERENCES matriz_disciplinas(id) ON DELETE CASCADE, -- A cadeira que "sofre" o bloqueio (ex: Matemática II)
    disciplina_precedente_id UUID NOT NULL REFERENCES matriz_disciplinas(id) ON DELETE CASCADE, -- A cadeira que "gera" o bloqueio (ex: Matemática I)
    tipo_bloqueio TEXT DEFAULT 'aprovacao', -- 'aprovacao' (precisa >= 10), 'frequencia' (apenas ter frequentado), 'nota_minima'
    nota_minima_requerida NUMERIC(4,2) DEFAULT 10.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(disciplina_alvo_id, disciplina_precedente_id)
);

-- 2. Tabela de Inventário Detalhado para Salas (Asset Management)
CREATE TABLE IF NOT EXISTS inventario_sala (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sala_id UUID NOT NULL REFERENCES salas(id) ON DELETE CASCADE,
    item_nome TEXT NOT NULL, -- Ex: "Computador i7", "Projetor"
    quantidade INT DEFAULT 1,
    estado TEXT DEFAULT 'funcional', -- 'funcional', 'avariado', 'em_reparacao'
    numero_serie TEXT,
    data_aquisicao DATE,
    valor_estimado NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Trigger para evitar precedência circular (Simples)
CREATE OR REPLACE FUNCTION check_precedencia_circular()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        WITH RECURSIVE path(id) AS (
            SELECT disciplina_precedente_id FROM matriz_disciplina_precedencias WHERE disciplina_alvo_id = NEW.disciplina_precedente_id
            UNION
            SELECT p.disciplina_precedente_id FROM matriz_disciplina_precedencias p JOIN path on p.disciplina_alvo_id = path.id
        )
        SELECT 1 FROM path WHERE id = NEW.disciplina_alvo_id
    ) THEN
        RAISE EXCEPTION 'Erro: Precedência circular detetada.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_precedencia_circular
BEFORE INSERT OR UPDATE ON matriz_disciplina_precedencias
FOR EACH ROW EXECUTE FUNCTION check_precedencia_circular();
