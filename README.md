# Prismarq Comunicação Visual

Sistema de gráfica online em `Next.js`, `TypeScript` e `Tailwind CSS`, evoluído para uma base de produção com PostgreSQL, autenticação segura, upload validado e arquitetura em camadas.

## Stack operacional

- App Router com rotas HTTP em `app/api`
- PostgreSQL para persistência real
- JWT assinado em cookie `httpOnly`
- Hash de senha com bcrypt (`bcryptjs`)
- Upload local com abstração pronta para S3
- Validação de entrada com `zod`

## Arquitetura

- `app/`: páginas e route handlers
- `components/`: UI reutilizável
- `lib/`: facades compatíveis para catálogo, auth, pricing e leitura de pedidos
- `server/config/`: configuração e parsing de ambiente
- `server/controllers/`: camada HTTP
- `server/repositories/`: acesso ao banco
- `server/services/`: regras de negócio, autenticação, pedido, upload e storage
- `server/db/`: conexão e schema SQL
- `scripts/`: migração e seed

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_COOKIE_NAME`
- `SESSION_TTL_SECONDS`
- `BCRYPT_SALT_ROUNDS`
- `STORAGE_DRIVER`
- `UPLOAD_DIR`
- `MAX_UPLOAD_BYTES`
- `ALLOWED_UPLOAD_EXTENSIONS`
- `ALLOWED_UPLOAD_MIME_TYPES`

## Banco de dados

1. Instale as dependências:

```bash
npm install
```

2. Execute a migração:

```bash
npm run db:migrate
```

3. Se quiser carregar os dados demo legados:

```bash
npm run db:seed
```

## Rodando o projeto

```bash
npm run dev
```

## Credenciais demo após seed

- Admin: `admin@prismarq.com.br` / `admin123`
- Cliente: `felipe@novaobra.com.br` / `cliente123`
- Cliente: `camila@studioalto.com.br` / `cliente456`

## Melhorias implementadas

- Persistência real em PostgreSQL
- Histórico de status e trilha de auditoria de pedidos
- Sessão JWT segura com cookie assinado
- Hash de senha com bcrypt
- Upload com limite de tamanho, whitelist de tipo/extensão e abstração de storage
- Middleware com proteção de rotas e headers de segurança
- Separação clara entre controllers, services e repositories

## Observação

O sistema agora depende de ambiente configurado e banco disponível. Os arquivos `data/*.json` foram mantidos como base legada para seed e migração inicial.


codex resume 019d93cd-2049-7a81-9731-b5a48b7e4648
