# Instruções para Configuração — Bariátrica Caseira

Esta é a área de membros premium do produto **Bariátrica Caseira**.

## 1. Configuração do Supabase

### Tabelas e SQL
1. Crie um novo projeto no Supabase.
2. Vá em **SQL Editor**.
3. Copie e cole o conteúdo do arquivo `supabase/schema.sql`.
4. Execute o script para criar todas as tabelas e políticas de RLS.

### Autenticação
1. No painel do Supabase, vá em **Authentication** -> **Providers**.
2. Garanta que o provedor de **Email** está ativo.
3. Desative "Confirm Email" se desejar acesso imediato sem confirmação de e-mail (embora o sistema já marque como confirmado via admin).

## 2. Variáveis de Ambiente (.env)

Renomeie o arquivo `.env.example` para `.env.local` e preencha os dados:

```env
NEXT_PUBLIC_SUPABASE_URL=seu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key (SÓ USE NO SERVIDOR)

APP_URL=http://localhost:3000 (ou URL do deploy)

SMTP_HOST=seu_host_smtp
SMTP_PORT=587
SMTP_USER=seu_usuario
SMTP_PASS=sua_senha
SMTP_FROM="Bariátrica Caseira <acesso@seudominio.com>"

GEMINI_API_KEY=sua_chave_gemini
GEMINI_MODEL=gemini-2.0-flash

DEFAULT_TEMP_PASSWORD=12345
KIWIFY_WEBHOOK_SECRET=token_secreto_para_webhook
KIWIFY_MAIN_PRODUCT_ID=id_do_produto_kiwify
```

## 3. Webhook da Kiwify

### Configuração na Kiwify
1. Vá em **Apps** -> **Webhooks**.
2. Clique em **Criar Webhook**.
3. Nome: `Área de Membros BC`.
4. URL: `https://seu-dominio.com/api/webhooks/kiwify?token=SEU_TOKEN_SECRETO`
   *(Substitua SEU_TOKEN_SECRETO pelo valor definido em `KIWIFY_WEBHOOK_SECRET`)*.
5. Eventos: Selecione **Venda Aprovada**, **Venda Reembolsada**, **Chargeback**.

### Teste Local
Para testar localmente, você pode usar o `ngrok` ou enviar um POST manual para:
`http://localhost:3000/api/webhooks/kiwify?token=12345`

Exemplo de Payload Mínimo:
```json
{
  "order_status": "paid",
  "customer": {
    "full_name": "Cliente Teste",
    "email": "teste@exemplo.com"
  },
  "product": {
    "product_id": "PRD-ID-123",
    "product_name": "Bariátrica Caseira"
  },
  "order_id": "ORD-123",
  "webhook_event_type": "order_approved"
}
```

## 4. PDFs e Arquivos

### Opção: Supabase Storage
1. Crie um bucket chamado `pdfs`.
2. Torne-o **público** (ou privado se desejar URLs assinadas).
3. Suba seus arquivos PDF.
4. Atualize a tabela `pdf_assets` com as URLs.

## 5. Deploy na Vercel

1. Suba o código para um repositório Git (GitHub/GitLab).
2. Importe na Vercel.
3. Adicione todas as variáveis do `.env` no painel da Vercel.
4. Deploy!

## 6. Fluxo do Usuário

1. Compra aprovada na Kiwify.
2. Webhook cria usuário e envia e-mail com senha `12345`.
3. Usuário loga em `/login`.
4. Obrigatório mudar senha em `/primeiro-acesso`.
5. Responde onboarding em `/onboarding`.
6. Gemini gera a fórmula e o usuário vê em `/minha-formula`.
7. Dashboard liberado!
