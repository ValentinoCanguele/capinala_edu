-- Migration 018: Motor de Avaliação de Rigor (Grading Engine)
-- Upgrade: Notas compostas (MAC, NPP, NE) e Escala 0-20

-- 1. Alterar restrições da tabela de notas
ALTER TABLE notas DROP CONSTRAINT IF EXISTS notas_valor_check;
ALTER TABLE notas ADD CONSTRAINT notas_valor_check CHECK (valor >= 0 AND valor <= 20);

-- 2. Adicionar colunas para suporte a fórmulas de rigor
ALTER TABLE notas ADD COLUMN IF NOT EXISTS mac NUMERIC(4,2) DEFAULT 0;
ALTER TABLE notas ADD COLUMN IF NOT EXISTS npp NUMERIC(4,2) DEFAULT 0;
ALTER TABLE notas ADD COLUMN IF NOT EXISTS ne NUMERIC(4,2) DEFAULT 0;
ALTER TABLE notas ADD COLUMN IF NOT EXISTS formula_aplicada TEXT;
ALTER TABLE notas ADD COLUMN IF NOT EXISTS audit_user_id UUID REFERENCES auth.users(id);

-- 3. Comentários para documentação técnica do ERP
COMMENT ON COLUMN notas.mac IS 'Média de Avaliação Contínua (Somatório de ACs / n)';
COMMENT ON COLUMN notas.npp IS 'Nota de Prova Periódica';
COMMENT ON COLUMN notas.ne IS 'Nota de Exame (quando aplicável no final do ciclo/ano)';

-- 4. Função para cálculo automático (opcional, pode ser feito no serviço mas trigger garante rigor)
CREATE OR REPLACE FUNCTION calcular_nota_trimestral()
RETURNS TRIGGER AS $$
DECLARE
    v_formula TEXT;
BEGIN
    -- Se não for informada uma fórmula, aceitamos o valor manual
    -- No futuro, podemos buscar a fórmula da matriz vinculada à turma
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Tabela de Auditoria de Notas (Rigor M1.5)
CREATE TABLE IF NOT EXISTS audit_notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nota_id UUID REFERENCES notas(id) ON DELETE CASCADE,
    valor_anterior NUMERIC(4,2),
    valor_novo NUMERIC(4,2),
    componente_alterado TEXT, -- 'mac', 'npp', 'ne', 'valor'
    user_id UUID REFERENCES auth.users(id),
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Trigger para auditoria automática
CREATE OR REPLACE FUNCTION audit_nota_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.valor <> NEW.valor OR OLD.mac <> NEW.mac OR OLD.npp <> NEW.npp OR OLD.ne <> NEW.ne) THEN
        INSERT INTO audit_notas (nota_id, valor_anterior, valor_novo, componente_alterado, user_id)
        VALUES (NEW.id, OLD.valor, NEW.valor, 'valor', auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_notas ON notas;
CREATE TRIGGER trg_audit_notas
AFTER UPDATE ON notas
FOR EACH ROW EXECUTE FUNCTION audit_nota_change();
