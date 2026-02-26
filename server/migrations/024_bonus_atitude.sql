-- Migration 024: Gestão de Bónus de Atitude (M2.0.2)
-- Adiciona pontuação extra por participação/comportamento.

ALTER TABLE notas ADD COLUMN IF NOT EXISTS bonus_atitude NUMERIC(3,2) DEFAULT 0 CHECK (bonus_atitude >= 0 AND bonus_atitude <= 2);

COMMENT ON COLUMN notas.bonus_atitude IS 'Bónus de atitude e participação (0.0 a 2.0)';
