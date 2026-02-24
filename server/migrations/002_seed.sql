-- Seed: uma escola e um usuário admin (senha: admin123)
INSERT INTO escolas (id, nome) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Escola Demo')
ON CONFLICT DO NOTHING;

INSERT INTO pessoas (id, nome, email, data_nascimento) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Admin Demo', 'admin@escola.demo', '1990-01-01')
ON CONFLICT (email) DO NOTHING;

-- password_hash for 'admin123' (bcrypt would be used in prod; here plain for dev only)
INSERT INTO usuarios (id, pessoa_id, escola_id, papel, password_hash) 
SELECT gen_random_uuid(), p.id, e.id, 'admin', 'admin123'
FROM pessoas p, escolas e
WHERE p.email = 'admin@escola.demo' AND e.id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT (pessoa_id, escola_id) DO NOTHING;
