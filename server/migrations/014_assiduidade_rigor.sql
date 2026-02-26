-- Fase 3: Assiduidade e Tempo (Attendance)
-- T3.0: Infraestrutura para Biometria e QR Code

-- Adicionar BI e Telefone às pessoas para identificação única
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS bi TEXT UNIQUE;
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Tabela de Configuração de Faltas (Limite de Faltas)
CREATE TABLE IF NOT EXISTS config_assiduidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  ano_letivo_id UUID NOT NULL REFERENCES anos_letivos(id) ON DELETE CASCADE,
  limite_faltas_percentagem NUMERIC(5,2) DEFAULT 25.0, -- Padrão: 25% de faltas permitido (75% presença)
  alerta_evasao_percentagem NUMERIC(5,2) DEFAULT 15.0, -- Alerta quando chega a 15% de faltas
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(escola_id, ano_letivo_id)
);

-- Tabela para Registos Biométricos/Acesso (Logs Brutos)
CREATE TABLE IF NOT EXISTS registros_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ DEFAULT now(),
  tipo_dispositivo TEXT, -- 'scanner_qr', 'biometrico', 'portaria_manual'
  sentido TEXT CHECK (sentido IN ('entrada', 'saida')),
  local TEXT -- Ex: 'Portaria Principal', 'Sala 4'
);

-- Inserir config padrão para escolas existentes
INSERT INTO config_assiduidade (escola_id, ano_letivo_id)
SELECT escola_id, id FROM anos_letivos
ON CONFLICT DO NOTHING;
