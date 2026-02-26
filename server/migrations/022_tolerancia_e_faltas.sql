-- Migration 022: Tolerância de Atraso e Limites de Frequência
-- T3.0.1: Tolerância de Atraso
-- T3.0.2: Justificações (Estrutura base via log)

ALTER TABLE config_pedagogica 
ADD COLUMN IF NOT EXISTS tolerancia_atraso_minutos INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS limite_faltas_percentagem INTEGER DEFAULT 25; -- Ex: 25% de faltas reprova

COMMENT ON COLUMN config_pedagogica.tolerancia_atraso_minutos IS 'Tempo em minutos após o início da aula antes de marcar falta automática.';

-- Adicionar tipo de justificativa à frequencia
ALTER TABLE frequencia ADD COLUMN IF NOT EXISTS justificativa_id UUID;
ALTER TABLE frequencia ADD COLUMN IF NOT EXISTS documento_justificativa_url TEXT;

-- Tabela de Justificativas Estruturadas
CREATE TABLE IF NOT EXISTS justificativas_falta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    motivo TEXT NOT NULL, -- 'doenca', 'luto', 'transporte', 'outro'
    descricao TEXT,
    parecer_direcao TEXT, -- 'pendente', 'deferido', 'indeferido'
    data_submissao TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);
