# Template Base de CRM (React + Vite)

Este é um projeto base de CRM personalizável e pronto para duplicação rápida para novos clientes.

---

## ⚡ Como Duplicar para um Novo Cliente

Siga os passos abaixo para implantar uma nova instância do CRM para um cliente:

### 1. Duplicar a Pasta
Copie a pasta inteira do projeto base para um novo diretório com o nome do seu cliente (ex: `CRM-cliente-x`).

### 2. Configurar o Arquivo `.env`
No novo diretório, copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
Abra o arquivo `.env` e personalize as seguintes configurações:
- **`VITE_CLIENT_NAME`**: O nome da empresa do cliente (aparecerá em destaque na logo).
- **`VITE_CLIENT_SUBTITLE`**: O subtítulo/ramo de atuação do cliente.
- **`KV_BUCKET_ID`**: **Importante!** Altere este ID para qualquer sequência de caracteres única (ex: gere um hash aleatório ou use o nome do cliente sem espaços). Isso isolará o banco de dados de usuários deste cliente dos outros.
- **`VITE_DEFAULT_ADMIN_NAME`** e **`VITE_DEFAULT_ADMIN_EMAIL`**: Dados do administrador inicial.

### 3. Instalar e Executar Localmente
Para testar e rodar o projeto localmente:
```bash
npm install
npm run dev
```

### 4. Deploy no Vercel (Nova Instância)
Se for publicar o projeto na Vercel para o novo cliente:
1. Remova a pasta `.vercel` da nova pasta clonada (se existir) para evitar herdar as credenciais do projeto base.
2. Inicialize o novo projeto rodando:
   ```bash
   npx vercel
   ```
3. Siga as instruções do terminal para criar um **novo projeto** na Vercel associado à sua conta.
4. Adicione as variáveis de ambiente configuradas no `.env` nas configurações do projeto da Vercel (Dashboard -> Settings -> Environment Variables) para que os deploys de produção também utilizem as informações do cliente.
