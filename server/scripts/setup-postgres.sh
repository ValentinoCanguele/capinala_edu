#!/bin/bash
# Configura e inicia PostgreSQL para o projeto Gestão Escolar.
#
# Executa no Terminal (vai pedir palavra-passe no sudo):
#   cd "/Users/macbook/Desktop/SISTEMAS I/supabase-master/server" && bash scripts/setup-postgres.sh
#
# Se outro brew install estiver a correr, espera que termine ou fecha esse terminal.

set -e

echo "=== 1. Permissões do Homebrew (vai pedir a tua palavra-passe) ==="
sudo chown -R "$(whoami)" /usr/local/Cellar /usr/local/Frameworks /usr/local/Homebrew /usr/local/bin /usr/local/etc /usr/local/include /usr/local/lib /usr/local/opt /usr/local/sbin /usr/local/share /usr/local/var/homebrew 2>/dev/null || true

echo ""
echo "=== 2. Instalar PostgreSQL 15 (Homebrew) ==="
if brew list postgresql@15 &>/dev/null; then
  echo "PostgreSQL 15 já está instalado."
else
  brew install postgresql@15
fi

echo ""
echo "=== 3. Adicionar PostgreSQL ao PATH ==="
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
grep -q 'postgresql@15/bin' ~/.zshrc 2>/dev/null || echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc

echo ""
echo "=== 4. Iniciar o serviço PostgreSQL ==="
brew services start postgresql@15

echo ""
echo "=== 5. Aguardar o PostgreSQL arrancar (5s) ==="
sleep 5

echo ""
echo "=== 6. Criar base de dados gestao_escolar ==="
/usr/local/opt/postgresql@15/bin/createdb gestao_escolar 2>/dev/null || echo "(A base já existe ou será criada na primeira ligação.)"

echo ""
echo "=== 7. Atualizar server/.env ==="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$SERVER_DIR/.env"
# Utilizador do macOS (geralmente sem palavra-passe em localhost)
USER_NAME=$(whoami)
if ! grep -q '^DATABASE_URL=' "$ENV_FILE" 2>/dev/null; then
  echo "DATABASE_URL=postgresql://${USER_NAME}@localhost:5432/gestao_escolar" >> "$ENV_FILE"
  echo "JWT_SECRET=your-secret-at-least-32-chars" >> "$ENV_FILE"
else
  sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${USER_NAME}@localhost:5432/gestao_escolar|" "$ENV_FILE" 2>/dev/null || true
fi
echo "DATABASE_URL em .env: postgresql://${USER_NAME}@localhost:5432/gestao_escolar"

echo ""
echo "=== 8. Executar migrações ==="
cd "$SERVER_DIR"
npm run db:migrate

echo ""
echo "=== Concluído. PostgreSQL a correr. ==="
echo "Login na app: canguele@escola.demo / Manga@926445277.com"
