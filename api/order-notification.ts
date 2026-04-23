import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { orderDetails, customerInfo, total } = req.body;

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

  const adminMailOptions = {
    from: 'info@yorem06.com',
    to: 'info@yorem06.com',
    subject: `Yeni Sipariş: ${customerInfo.fullName}`,
    text: `
Yörem06 - Yeni Sipariş Bildirimi

MÜŞTERİ BİLGİLERİ:
------------------
İsim Soyisim: ${customerInfo.fullName}
Telefon: ${customerInfo.phone}
E-posta: ${customerInfo.email}
Adres: ${customerInfo.address}

SİPARİŞ DETAYLARI:
------------------
${orderDetails.map((item: any) => `• ${item.name} (${item.quantity} adet) - Birim Fiyat: ${item.price} TL`).join('\n')}

TOPLAM TUTAR: ${total} TL

------------------
Bu e-posta Yörem06 web sitesi üzerinden otomatik olarak oluşturulmuştur.
    `,
  };

  const customerMailOptions = {
    from: 'info@yorem06.com',
    to: customerInfo.email,
    subject: 'Siparişiniz Başarıyla Alındı! 🎉',
    text: `
Merhaba,

Siparişiniz başarıyla alınmıştır 🎉

Yorem06 ailesi olarak bizi tercih ettiğiniz için teşekkür ederiz. Siparişiniz özenle hazırlanmak üzere işleme alınmıştır.

Sipariş sürecinizle ilgili bilmeniz gerekenler:
• Siparişiniz kısa süre içerisinde hazırlanacaktır
• Kargoya verildiğinde tarafınıza bilgilendirme yapılacaktır
• Sipariş durumunuzu hesabınızdan takip edebilirsiniz

Amacımız, ürünlerinizi en hızlı ve en güvenli şekilde size ulaştırmak.

Herhangi bir sorunuz veya destek ihtiyacınız olursa bizimle her zaman iletişime geçebilirsiniz.

Bizi tercih ettiğiniz için tekrar teşekkür ederiz 💚
Afiyetle / keyifle kullanmanızı dileriz 🌿

Sevgilerimizle,
Yorem06 Ekibi
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);
    res.status(200).json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending order emails:', error);
    res.status(500).json({ success: false, message: 'Failed to send emails' });
  }
}
