-- Migration 019: Gestão Disciplinar de Alta Fidelidade & Auditoria Forense
-- Upgrade: Evidências, Inquéritos e Auditoria de Dados (JSON Diff)

-- 1. Upgrade na tabela de Ocorrências
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS evidencas_urls TEXT[]; -- Array de links para documentos/fotos
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS status_inquerito TEXT DEFAULT 'aberto'; -- 'aberto', 'em_analise', 'concluido', 'arquivado'
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS testemunhas TEXT;

COMMENT ON COLUMN ocorrencias.evidencas_urls IS 'Caminhos para ficheiros de prova no storage';

-- 2. Tabela de Auditoria de Dados (Forensics)
-- Esta tabela armazena o estado anterior e posterior de qualquer mutação crítica
CREATE TABLE IF NOT EXISTS audit_data_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escola_id UUID REFERENCES escolas(id),
    entidade TEXT NOT NULL, -- 'alunos', 'notas', 'ocorrencias'
    entidade_id UUID NOT NULL,
    acao TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    dados_anteriores JSONB,
    dados_posteriores JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Trigger genérico para captura de Diffs em tabelas críticas (Exemplo para Notas)
CREATE OR REPLACE FUNCTION capture_data_diff()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_data_changes (
        escola_id,
        entidade,
        entidade_id,
        acao,
        dados_anteriores,
        dados_posteriores,
        user_id
    )
    VALUES (
        COALESCE(NEW.escola_id, OLD.escola_id),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar à tabela de ocorrências para rigor total
DROP TRIGGER IF EXISTS trg_audit_ocorrencias ON ocorrencias;
CREATE TRIGGER trg_audit_ocorrencias
AFTER INSERT OR UPDATE OR DELETE ON ocorrencias
FOR EACH ROW EXECUTE FUNCTION capture_data_diff();
