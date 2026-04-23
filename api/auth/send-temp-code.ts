import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { email, code } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'mail.kurumsaleposta.com',
    port: 587,
    secure: false,
    auth: {
      user: 'info@yorem06.com',
      pass: 'kePk1:T:4-1S3C-a',
    },
    tls: {
      rejectUnauthorized: false,
      secureOptions: 0x40000000,
      ciphers: 'DEFAULT@SECLEVEL=0',
      minVersion: 'TLSv1'
    }
  });

  const mailOptions = {
    from: 'info@yorem06.com',
    to: email,
    subject: 'Yörem06 Geçici Giriş Kodu 🔑',
    text: `
Merhaba,

Yörem06 hesabınız için geçici giriş kodu talebinde bulundunuz.

Geçici Giriş Kodunuz: ${code}

Bu kod ile giriş yaptıktan sonra lütfen şifrenizi güncellemeyi unutmayın.

Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayınız.

Sevgilerimizle,
Yörem06 Ekibi
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending temp code email:', error);
    res.status(500).json({ success: false });
  }
}
