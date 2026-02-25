-- Adicionar imagem e ícone ao padrão de módulos
ALTER TABLE sistema_modulos
  ADD COLUMN IF NOT EXISTS imagem TEXT,
  ADD COLUMN IF NOT EXISTS icone TEXT;

COMMENT ON COLUMN sistema_modulos.imagem IS 'URL ou path da imagem do módulo (opcional)';
COMMENT ON COLUMN sistema_modulos.icone IS 'Nome do ícone (ex: Banknote, Users) para uso no UI';

-- Preencher ícones por chave (mesmo que no frontend)
UPDATE sistema_modulos SET icone = 'Home' WHERE chave = 'inicio';
UPDATE sistema_modulos SET icone = 'Users' WHERE chave = 'alunos';
UPDATE sistema_modulos SET icone = 'BookOpen' WHERE chave = 'turmas';
UPDATE sistema_modulos SET icone = 'ClipboardList' WHERE chave = 'notas';
UPDATE sistema_modulos SET icone = 'CalendarCheck' WHERE chave = 'frequencia';
UPDATE sistema_modulos SET icone = 'FileText' WHERE chave = 'boletim';
UPDATE sistema_modulos SET icone = 'Clock' WHERE chave = 'horarios';
UPDATE sistema_modulos SET icone = 'Megaphone' WHERE chave = 'comunicados';
UPDATE sistema_modulos SET icone = 'BookMarked' WHERE chave = 'disciplinas';
UPDATE sistema_modulos SET icone = 'Calendar' WHERE chave = 'anos-letivos';
UPDATE sistema_modulos SET icone = 'DoorOpen' WHERE chave = 'salas';
UPDATE sistema_modulos SET icone = 'Banknote' WHERE chave = 'financas';
UPDATE sistema_modulos SET icone = 'History' WHERE chave = 'auditoria';
UPDATE sistema_modulos SET icone = 'Settings' WHERE chave = 'definicoes';
