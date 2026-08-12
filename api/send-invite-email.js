// Serverless API endpoint to send invitation emails/webhooks to newly added system members
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract request body parameters
    const { name, email, role, password, loginUrl, resendApiKey: bodyResendKey, webhookUrl: bodyWebhookUrl } = req.body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'E-mail é obrigatório' });
    }

    const recipientEmail = email.trim();
    const recipientName = name ? name.trim() : 'Operador';
    const recipientRole = role || 'Normal';
    const userPassword = password || '***';
    const appLoginUrl = loginUrl || 'http://localhost:5173/';

    const subject = `🚀 Você foi convidado para a equipe no CRM Base!`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Convite CRM Base</title>
      </head>
      <body style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 28px; border-bottom: 1px solid #334155; padding-bottom: 20px;">
            <h1 style="color: #f29b11; margin: 0; font-size: 26px; font-weight: 700;">CRM Base</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">Gestão Inteligente de Vendas & Atendimento</p>
          </div>

          <!-- Content -->
          <h2 style="color: #f8fafc; font-size: 20px; margin-top: 0;">Olá, ${recipientName}! 👋</h2>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            Você acaba de ser cadastrado como operador da equipe no sistema <strong>CRM Base</strong> com a função de <span style="color: #38bdf8; font-weight: 600;">${recipientRole}</span>.
          </p>
          
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            Abaixo estão as suas credenciais de acesso exclusivas para entrar na plataforma:
          </p>

          <!-- Credentials Box -->
          <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px dashed #475569;">
            <div style="margin-bottom: 12px;">
              <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Link de Acesso:</span>
              <a href="${appLoginUrl}" target="_blank" style="color: #38bdf8; font-size: 15px; font-weight: 600; text-decoration: none; word-break: break-all;">${appLoginUrl}</a>
            </div>
            
            <div style="margin-bottom: 12px;">
              <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">E-mail de Login:</span>
              <span style="color: #f8fafc; font-size: 15px; font-weight: 600;">${recipientEmail}</span>
            </div>

            <div>
              <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Senha de Acesso:</span>
              <span style="color: #10b981; font-size: 16px; font-weight: 700; font-family: monospace; background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 4px;">${userPassword}</span>
            </div>
          </div>

          <!-- Button CTA -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${appLoginUrl}" target="_blank" style="background: linear-gradient(135deg, #f29b11 0%, #d97706 100%); color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(242, 155, 17, 0.4);">
              🚀 Acessar o CRM Base Agora
            </a>
          </div>

          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #334155; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">Recomendamos alterar sua senha no primeiro acesso em Configurações.</p>
            <p style="margin: 6px 0 0 0;">© ${new Date().getFullYear()} CRM Base. Todos os direitos reservados.</p>
          </div>

        </div>
      </body>
      </html>
    `;

    // 1. Attempt Webhook dispatch if Webhook URL is set (e.g. n8n webhook)
    const activeWebhookUrl = (process.env.N8N_INVITE_WEBHOOK || bodyWebhookUrl || '').trim();
    if (activeWebhookUrl) {
      try {
        const webhookRes = await fetch(activeWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'user_invited',
            name: recipientName,
            email: recipientEmail,
            role: recipientRole,
            password: userPassword,
            loginUrl: appLoginUrl,
            subject: subject,
            htmlBody: htmlBody
          })
        });

        if (webhookRes.ok) {
          console.log(`Invite payload sent successfully to webhook: ${activeWebhookUrl}`);
          return res.status(200).json({ success: true, provider: 'webhook', message: 'Webhook n8n acionado com sucesso' });
        } else {
          console.warn(`Webhook failed status ${webhookRes.status}`);
        }
      } catch (errWebhook) {
        console.warn('Error calling invite webhook:', errWebhook.message);
      }
    }

    // 2. Attempt Resend API if key is set via env or client configuration
    const activeResendKey = (process.env.RESEND_API_KEY || bodyResendKey || '').trim();
    if (activeResendKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeResendKey}`
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'CRM Base <onboarding@resend.dev>',
            to: recipientEmail,
            subject: subject,
            html: htmlBody
          })
        });

        const resendData = await resendRes.json().catch(() => ({}));

        if (resendRes.ok) {
          console.log(`Email successfully sent via Resend API to ${recipientEmail}`);
          return res.status(200).json({ success: true, provider: 'resend', id: resendData.id });
        } else {
          console.warn('Resend API error:', resendData);
          return res.status(400).json({
            error: resendData.message || resendData.error || 'Falha no provedor Resend',
            resendDetails: resendData
          });
        }
      } catch (errResend) {
        console.warn('Resend API call error:', errResend.message);
        return res.status(500).json({ error: `Erro na API do Resend: ${errResend.message}` });
      }
    }

    // Fallback: Return invitation details for simulation / local toast
    console.log(`[INVITATION_DISPATCH] To: ${recipientEmail} | Link: ${appLoginUrl} | User: ${recipientName} | Pass: ${userPassword}`);
    return res.status(200).json({
      success: true,
      provider: 'simulated',
      message: 'Convite gerado com sucesso.',
      details: {
        to: recipientEmail,
        loginUrl: appLoginUrl,
        password: userPassword
      }
    });

  } catch (err) {
    console.error('Error sending invitation email:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
