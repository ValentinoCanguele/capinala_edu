-- Módulo Finanças: categorias e configuração por escola

CREATE TYPE tipo_categoria_financeira AS ENUM ('receita', 'despesa');

CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo tipo_categoria_financeira NOT NULL,
  ordem SMALLINT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_escola ON categorias_financeiras(escola_id);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_tipo ON categorias_financeiras(escola_id, tipo);

-- Configuração financeira por escola (multa, juros, regra de bloqueio)
CREATE TABLE IF NOT EXISTS configuracao_financeira (
  escola_id UUID PRIMARY KEY REFERENCES escolas(id) ON DELETE CASCADE,
  multa_percentual NUMERIC(5,2) NOT NULL DEFAULT 2 CHECK (multa_percentual >= 0 AND multa_percentual <= 100),
  juros_mensal_percentual NUMERIC(5,2) NOT NULL DEFAULT 1 CHECK (juros_mensal_percentual >= 0 AND juros_mensal_percentual <= 100),
  parcelas_para_bloqueio SMALLINT NOT NULL DEFAULT 2 CHECK (parcelas_para_bloqueio >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
