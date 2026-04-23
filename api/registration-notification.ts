import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { email, fullName } = req.body;

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
    subject: 'Yörem06 Ailesine Hoş Geldiniz! 🌿',
    text: `
Merhaba,

Yörem06 ailesine hoş geldiniz! 💚

Artık siz de doğallığı, kaliteyi ve özenle seçilmiş ürünleri önemseyen özel bir topluluğun parçasısınız. Hesabınız başarıyla oluşturuldu.

Yörem06 olarak amacımız; sizlere güvenilir, sağlıklı ve keyifli bir alışveriş deneyimi sunmak. Ürünlerimizi özenle seçiyor, her detayı sizin için düşünüyoruz. Artık sipariş verebilir, güncel kampanyalarımızdan haberdar olabilir ve size özel fırsatları takip edebilirsiniz.

Sizinle bu yolculuğa çıkmak bizim için çok değerli. Herhangi bir sorunuz olursa bizimle her zaman iletişime geçebilirsiniz.

Yeniliklerden haberdar olmak ve doğal yaşam yolculuğumuzda bize eşlik etmek için bizi Instagram'da takip etmeyi unutmayın! 🌿
Takip et: https://www.instagram.com/yorem06?igsh=MXkwbTc1MHUyM3V2cA==

Sevgilerimizle,
Yörem06 Ekibi
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending registration email:', error);
    res.status(500).json({ success: false });
  }
}
