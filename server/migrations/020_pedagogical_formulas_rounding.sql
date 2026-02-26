-- Migration 020: Arredondamento Parametrizável e Motor de Fórmulas
-- Elevando o rigor académico com configurações granulares de cálculo.

ALTER TABLE config_pedagogica 
ADD COLUMN IF NOT EXISTS tipo_arredondamento TEXT DEFAULT 'aritmetico', -- 'aritmetico', 'truncado', 'normativo_angola'
ADD COLUMN IF NOT EXISTS casas_decimais INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS formula_nota_trimestral TEXT DEFAULT '(MAC * 0.4) + (NPP * 0.6)',
ADD COLUMN IF NOT EXISTS formula_mfa TEXT DEFAULT '(T1 * pesoT1 + T2 * pesoT2 + T3 * pesoT3) / (pesoT1 + pesoT2 + pesoT3)';

COMMENT ON COLUMN config_pedagogica.tipo_arredondamento IS 'Define a lógica de arredondamento: aritmetico (padrão), truncado (corte), normativo_angola (9.5+ sobe para 10)';
COMMENT ON COLUMN config_pedagogica.formula_nota_trimestral IS 'Expressão para cálculo da nota do período a partir de MAC, NPP e NE';
