-- Nano funções — funções PostgreSQL pequenas e reutilizáveis por domínio.
-- Convenção: fn_<domínio>_<nome>. Documentar em docs/ANALISE-ARQUIVOS-E-FUNCOES.md.

-- ========== Datas ==========
-- Data de referência (hoje) em formato ISO (YYYY-MM-DD). Útil para cálculos e relatórios.
CREATE OR REPLACE FUNCTION fn_hoje_iso()
RETURNS DATE
LANGUAGE sql
STABLE
AS $$
  SELECT current_date;
$$;

COMMENT ON FUNCTION fn_hoje_iso() IS 'Retorna a data de hoje (current_date) no fuso do servidor.';

-- ========== Finanças ==========
-- Calcula valor atualizado com multa (uma vez) + juros ao mês sobre o valor original.
-- valor_original em unidades monetárias; vencimento e ref em DATE ou texto YYYY-MM-DD; multa_pct e juros_pct em percentagem (ex: 2 para 2%).
CREATE OR REPLACE FUNCTION fn_financeiro_valor_com_multa_juros(
  valor_original NUMERIC,
  vencimento DATE,
  ref DATE,
  multa_pct NUMERIC DEFAULT 0,
  juros_pct NUMERIC DEFAULT 0
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  valor_com_multa NUMERIC;
  meses_atraso INT;
  i INT;
BEGIN
  IF ref <= vencimento THEN
    RETURN valor_original;
  END IF;
  valor_com_multa := valor_original + (valor_original * (multa_pct / 100));
  meses_atraso := FLOOR((ref - vencimento) / 30.44)::INT;
  FOR i IN 1..meses_atraso LOOP
    valor_com_multa := valor_com_multa + (valor_original * (juros_pct / 100));
  END LOOP;
  RETURN ROUND(valor_com_multa * 100) / 100;
END;
$$;

COMMENT ON FUNCTION fn_financeiro_valor_com_multa_juros(NUMERIC, DATE, DATE, NUMERIC, NUMERIC) IS 'Calcula valor com multa e juros mensais (espelho da regra em lib/escola/regras/financas.ts).';

-- Retorna true se a parcela está em atraso (vencimento < ref e status não é paga/cancelada).
CREATE OR REPLACE FUNCTION fn_financeiro_parcela_esta_atrasada(
  vencimento DATE,
  status TEXT,
  ref DATE
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (status IS NULL OR (status <> 'paga' AND status <> 'cancelada')) AND ref > vencimento;
$$;

COMMENT ON FUNCTION fn_financeiro_parcela_esta_atrasada(DATE, TEXT, DATE) IS 'True se parcela está atrasada (não paga e vencimento antes de ref).';

-- ========== Notas / Média ==========
-- Retorna true se media >= minima (aprovação por média).
CREATE OR REPLACE FUNCTION fn_media_aprovacao(media NUMERIC, minima NUMERIC DEFAULT 5)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (media IS NOT NULL AND media >= minima);
$$;

COMMENT ON FUNCTION fn_media_aprovacao(NUMERIC, NUMERIC) IS 'Aprovação por média (espelho de lib/escola/regras/medias.ts mediaAprovacao).';
