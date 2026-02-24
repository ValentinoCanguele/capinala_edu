-- Utilizador: canguele / senha: Manga@926445277.com
-- Email de login: canguele@escola.demo

INSERT INTO pessoas (id, nome, email, data_nascimento) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Canguele', 'canguele@escola.demo', NULL)
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (id, pessoa_id, escola_id, papel, password_hash)
SELECT gen_random_uuid(), p.id, e.id, 'admin', 'Manga@926445277.com'
FROM pessoas p, escolas e
WHERE p.email = 'canguele@escola.demo' AND e.id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT (pessoa_id, escola_id) DO NOTHING;
