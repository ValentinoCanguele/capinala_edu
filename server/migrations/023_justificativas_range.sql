-- Migration 023: Refinamento de Justificações Académicas
-- Suporte a licenças médicas e intervalos de datas para limpeza automática de faltas.

ALTER TABLE justificativas_falta 
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS data_fim DATE,
ALTER COLUMN aula_id DROP NOT NULL;

COMMENT ON COLUMN justificativas_falta.data_inicio IS 'Data inicial da licença médica ou ausência autorizada.';
COMMENT ON COLUMN justificativas_falta.data_fim IS 'Data final da licença médica ou ausência autorizada.';
