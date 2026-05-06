import nodemailer from 'nodemailer';

export interface AccessEmailParams {
  name: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}

export async function sendAccessEmail({ name, email, temporaryPassword, loginUrl }: AccessEmailParams) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Seu acesso à Bariátrica Caseira chegou 💚',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #16a34a; font-size: 24px;">Olá, ${name}</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
          Sua compra foi aprovada e seu acesso à plataforma <strong>Bariátrica Caseira</strong> já está liberado.
        </p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #16a34a; font-weight: bold;">Seus dados de acesso:</p>
          <p style="margin: 10px 0 5px 0;"><strong>E-mail:</strong> ${email}</p>
          <p style="margin: 0;"><strong>Senha temporária:</strong> ${temporaryPassword}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            ACESSAR PLATAFORMA AGORA
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          No primeiro acesso, você será orientada a criar uma nova senha pessoal por segurança.
        </p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Equipe Bariátrica Caseira
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
