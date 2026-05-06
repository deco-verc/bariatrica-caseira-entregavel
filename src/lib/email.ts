import nodemailer from 'nodemailer';

// Helper: Configuração do Transmissor (Backend-only)
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Helper: Template Base HTML
const emailTemplate = (content: string, ctaText?: string, ctaUrl?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bariátrica Caseira</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <img src="https://ik.imagekit.io/decoimgsfunil/Logo_Bariatrica_Caseira.webp" alt="Bariátrica Caseira" style="height: 48px; width: auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; color: #334155; font-size: 16px; line-height: 1.6;">
              ${content}
              
              ${ctaText && ctaUrl ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="background-color: #16a34a; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.2);">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f1f5f9; color: #64748b; font-size: 12px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 16px 0; font-weight: bold; color: #475569;">Equipe Bariátrica Caseira 💚</p>
              <p style="margin: 0; line-height: 1.4;">
                Este conteúdo é educativo e não substitui acompanhamento médico ou nutricional. Em caso de gravidez, amamentação, uso de medicamentos ou doenças crônicas, consulte um profissional antes de iniciar qualquer protocolo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// 1. Email de Boas-vindas e Acesso
export interface AccessEmailParams {
  name: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}

export async function sendAccessEmail({ name, email, temporaryPassword, loginUrl }: AccessEmailParams) {
  const content = `
    <p>Olá, <strong>${name}</strong>!</p>
    <p>Sua compra foi aprovada e seu acesso à Bariátrica Caseira já está liberado.</p>
    <p>A partir de agora, você pode entrar na plataforma para acessar sua fórmula personalizada, seus bônus e o acompanhamento de medidas.</p>
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; color: #16a34a; font-weight: bold;">Seus dados de acesso:</p>
      <p style="margin: 10px 0 0 0;"><strong>E-mail:</strong> ${email}</p>
      <p style="margin: 5px 0 0 0;"><strong>Senha temporária:</strong> ${temporaryPassword}</p>
    </div>
    <p>No primeiro acesso, você será orientada a criar uma nova senha pessoal.</p>
    <p>Comece com calma. O primeiro passo é entrar na plataforma e responder algumas perguntas rápidas para montarmos sua orientação inicial.</p>
  `;

  const text = `Olá, ${name}!\n\nSua compra foi aprovada. Acesse aqui: ${loginUrl}\nEmail: ${email}\nSenha: ${temporaryPassword}`;

  const transporter = getTransporter();
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Seu acesso à Bariátrica Caseira chegou 💚',
      html: emailTemplate(content, 'ACESSAR PLATAFORMA', loginUrl),
      text
    });
    console.log('Access Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending access email:', error);
    return { success: false, error };
  }
}

// 2. Email de Redefinição de Senha (Primeiro Acesso)
export interface PasswordEmailParams {
  name: string;
  email: string;
  resetLink: string;
  supportLink?: string;
}

export async function sendFirstPasswordEmail({ name, email, resetLink, supportLink = 'https://wa.me/55...' }: PasswordEmailParams) {
  const content = `
    <p>Olá, <strong>${name}</strong>!</p>
    <p>Por segurança, antes de acessar sua plataforma Bariátrica Caseira, você precisa criar uma nova senha pessoal.</p>
    <p>Sua senha temporária serve apenas para o primeiro acesso.</p>
    <p>Se tiver qualquer dificuldade para acessar, fale com nosso suporte clicando no botão abaixo ou respondendo este e-mail.</p>
  `;

  const transporter = getTransporter();
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Crie sua nova senha para acessar a plataforma',
      html: emailTemplate(content, 'CRIAR MINHA SENHA', resetLink),
      text: `Olá, ${name}! Crie sua nova senha aqui: ${resetLink}`
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending password email:', error);
    return { success: false, error };
  }
}

// 3. Email de Ativação / Onboarding
export interface OnboardingEmailParams {
  name: string;
  email: string;
  platformUrl: string;
}

export async function sendOnboardingStartEmail({ name, email, platformUrl }: OnboardingEmailParams) {
  const content = `
    <p>Olá, <strong>${name}</strong>!</p>
    <p>Agora que seu acesso está liberado, não tente fazer tudo de uma vez.</p>
    <p>Para começar do jeito certo, siga apenas estes 3 passos:</p>
    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 12px;"><strong>Entre na plataforma:</strong> Acesse com seu e-mail e sua senha.</li>
      <li style="margin-bottom: 12px;"><strong>Responda as perguntas:</strong> Vamos pedir dados como idade, altura e peso para montar sua orientação.</li>
      <li style="margin-bottom: 12px;"><strong>Veja sua fórmula:</strong> Veja os ingredientes revelados e seus bônus.</li>
    </ol>
  `;

  const transporter = getTransporter();
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Comece por aqui: sua Bariátrica Caseira em 3 passos',
      html: emailTemplate(content, 'ENTRAR NA PLATAFORMA', platformUrl),
      text: `Olá, ${name}! Comece aqui: ${platformUrl}`
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending onboarding email:', error);
    return { success: false, error };
  }
}
