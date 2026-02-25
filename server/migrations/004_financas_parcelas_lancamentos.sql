-- Parcelas (mensalidades, matrícula, etc.)
CREATE TYPE status_parcela AS ENUM ('aberta', 'paga', 'atrasada', 'cancelada');

CREATE TABLE IF NOT EXISTS parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  ano_letivo_id UUID NOT NULL REFERENCES anos_letivos(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  responsavel_id UUID REFERENCES responsaveis(id) ON DELETE SET NULL,
  categoria_id UUID NOT NULL REFERENCES categorias_financeiras(id) ON DELETE RESTRICT,
  valor_original NUMERIC(10,2) NOT NULL CHECK (valor_original >= 0),
  valor_atualizado NUMERIC(10,2) NOT NULL CHECK (valor_atualizado >= 0),
  vencimento DATE NOT NULL,
  status status_parcela NOT NULL DEFAULT 'aberta',
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parcelas_escola ON parcelas(escola_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_ano_letivo ON parcelas(ano_letivo_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_aluno ON parcelas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_responsavel ON parcelas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas(vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas(status);

-- Lançamentos manuais (entradas e saídas)
CREATE TYPE tipo_lancamento AS ENUM ('entrada', 'saida');

CREATE TABLE IF NOT EXISTS lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  ano_letivo_id UUID REFERENCES anos_letivos(id) ON DELETE SET NULL,
  tipo tipo_lancamento NOT NULL,
  data DATE NOT NULL,
  valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
  categoria_id UUID NOT NULL REFERENCES categorias_financeiras(id) ON DELETE RESTRICT,
  descricao TEXT,
  forma_pagamento TEXT,
  referencia TEXT,
  aluno_id UUID REFERENCES alunos(id) ON DELETE SET NULL,
  centro_custo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_escola ON lancamentos(escola_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos(escola_id, tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_ano_letivo ON lancamentos(ano_letivo_id);

-- Pagamentos (registo de pagamento de parcela)
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES parcelas(id) ON DELETE CASCADE,
  data_pagamento DATE NOT NULL,
  valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
  forma_pagamento TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_parcela ON pagamentos(parcela_id);
