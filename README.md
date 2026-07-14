# CRM Análise Contabilidade

Sistema de CRM e Gestão Contábil responsivo, desenvolvido em React + Vite.

## 🚀 Como Executar o Projeto Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## ☁️ Deploy e Hospedagem (Vercel)

O projeto está hospedado na Vercel sob o domínio principal:
👉 **[crmanalisecontabilidade.vercel.app](https://crmanalisecontabilidade.vercel.app)**

### ⚠️ Regra Crítica para Evitar Quedas de Servidor (403 Forbidden)

Para garantir que o site nunca mais saia do ar com erro de roteamento/WAF:
1. **Nome do Projeto no Vercel**: O nome do projeto na Vercel deve permanecer estritamente como `crmanalisecontabilidade`.
2. **Configuração de Link Local**: O arquivo `.vercel/project.json` deve sempre apontar para este projeto:
   ```json
   {
     "projectId": "prj_220e2Zy5N2A8nd2Zyfcc3banRXkP",
     "orgId": "team_YpwOsHCCiGEX7z3sD44ry5q4",
     "projectName": "crmanalisecontabilidade"
   }
   ```
3. **Comando de Deploy Otimizado**: Sempre faça deploy utilizando o comando simplificado que garante o empacotamento correto e a associação automática com o domínio oficial:
   ```bash
   npm run deploy
   ```

*(Isso evita a criação de domínios temporários sem correspondência direta e previne o acionamento de bloqueios automáticos do firewall da Vercel).*
