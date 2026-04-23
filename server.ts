import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data persistence setup
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
const saveUsers = (users: any[]) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware at the VERY TOP
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- Auth & User Persistence API ---
  app.post('/api/auth/register', (req, res) => {
    const { email, fullName, password } = req.body;
    const users = getUsers();
    const cleanEmail = email.toLowerCase().trim();

    if (users.find((u: any) => u.email === cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    const newUser = {
      email: cleanEmail,
      fullName: fullName.trim(),
      password, // In a real production app, we would hash this
      hasSpun: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    res.json({ success: true, user: { email: newUser.email, fullName: newUser.fullName, hasSpun: newUser.hasSpun } });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const cleanEmail = email.toLowerCase().trim();

    const user = users.find((u: any) => u.email === cleanEmail && u.password === password);

    if (user) {
      res.json({ success: true, user: { email: user.email, fullName: user.fullName, hasSpun: user.hasSpun || false } });
    } else {
      res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı.' });
    }
  });

  app.get('/api/user/spin-status', (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ success: false });

    const users = getUsers();
    const user = users.find((u: any) => u.email === email.toLowerCase().trim());
    
    // For non-registered users (guest), we can still use common logic or just let frontend handle via LocalStorage
    // But for registered users, we check the server DB
    res.json({ success: true, hasSpun: user ? (user.hasSpun || false) : false });
  });

  app.post('/api/user/mark-spun', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false });

    const users = getUsers();
    const userIndex = users.findIndex((u: any) => u.email === email.toLowerCase().trim());

    if (userIndex !== -1) {
      users[userIndex].hasSpun = true;
      saveUsers(users);
      res.json({ success: true });
    } else {
      // It's a guest, we can't "permanently" mark them on server easily without session/tracking
      // But we acknowledge the request
      res.json({ success: true, message: 'Guest tracked' });
    }
  });
  // -----------------------------------

  // PayTR Configuration from Environment Variables
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  // Strict check for required variables
  if (!merchant_id || !merchant_key || !merchant_salt) {
    if (!merchant_id) console.error('CRITICAL ERROR: PAYTR_MERCHANT_ID is missing in Vercel/Environment!');
    if (!merchant_key) console.error('CRITICAL ERROR: PAYTR_MERCHANT_KEY is missing in Vercel/Environment!');
    if (!merchant_salt) console.error('CRITICAL ERROR: PAYTR_MERCHANT_SALT is missing in Vercel/Environment!');
  }

  // Debug middleware to log all requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // API route for PayTR Initialize
  app.post('/api/paytr/initialize', async (req, res) => {
    try {
      const { items, customerInfo, total } = req.body;

      if (!merchant_id || !merchant_key || !merchant_salt) {
        return res.status(500).json({ 
          success: false, 
          message: `PayTR Yapılandırma Hatası: ${!merchant_id ? 'Merchant ID' : !merchant_key ? 'Merchant Key' : 'Merchant Salt'} eksik!` 
        });
      }

      const merchant_oid = 'YOREM' + Date.now();
      let user_ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      if (user_ip.includes(',')) {
        user_ip = user_ip.split(',')[0].trim();
      }
      // Remove IPv6 prefix if present
      if (user_ip.startsWith('::ffff:')) {
        user_ip = user_ip.substring(7);
      }

      const email = customerInfo.email;
      const payment_amount = Math.round(total * 100); // Kuruş cinsinden

      // Sepet Formatı: [[Ürün Adı, Birim Fiyat, Adet], ...]
      const basketItems = items.map((item: any) => [
        item.name,
        item.price.toString(),
        item.quantity
      ]);
      const user_basket = Buffer.from(JSON.stringify(basketItems)).toString('base64');

      // PayTR Token Oluşturma
      const merchant_ok_url = `${APP_URL}/cart?status=success&oid=${merchant_oid}`;
      const merchant_fail_url = `${APP_URL}/cart?status=fail`;
      const timeout_limit = "30";
      const debug_on = "1";
      const test_mode = "0"; // Canlıya geçerken "0" yapın
      const no_installment = "0"; // Taksit kısıtı (0: Taksit var, 1: Taksit yok)
      const max_installment = "0"; // 0-12 arası
      const currency = "TL";

      const hashStr = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
      const paytr_token = crypto
        .createHmac('sha256', merchant_key)
        .update(hashStr + merchant_salt)
        .digest('base64');

      const params: any = {
        merchant_id: merchant_id,
        user_ip,
        merchant_oid,
        email,
        payment_amount,
        paytr_token,
        user_basket,
        debug_on,
        no_installment,
        max_installment,
        user_name: customerInfo.fullName,
        user_address: customerInfo.address,
        user_phone: customerInfo.phone,
        merchant_ok_url,
        merchant_fail_url,
        timeout_limit,
        currency,
        test_mode
      };

      const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString()
      });

      const data: any = await response.json();

      if (data.status === 'success') {
        res.json({ success: true, token: data.token });
      } else {
        res.status(400).json({ success: false, message: data.reason });
      }
    } catch (error) {
      console.error('PayTR Initialize Error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

  // API route for PayTR Callback (Success/Fail notification from PayTR server)
  app.post('/api/paytr/callback', async (req, res) => {
    try {
      const { merchant_oid, status, total_amount, hash } = req.body;

      console.log(`PayTR Callback received for Order: ${merchant_oid}, Status: ${status}`);

      // Hash doğrulaması (Güvenlik için önemli)
      if (merchant_key && merchant_salt) {
        const expectedHash = crypto
          .createHmac('sha256', merchant_key)
          .update(merchant_oid + merchant_salt + status + total_amount)
          .digest('base64');

        if (hash !== expectedHash) {
          console.error(`Hash mismatch for order ${merchant_oid}. Expected: ${expectedHash}, Received: ${hash}`);
        }
      }

      if (status === 'success') {
        console.log(`Ödeme Başarılı! Sipariş No: ${merchant_oid}`);
      } else {
        console.log(`Ödeme Başarısız! Sipariş No: ${merchant_oid}`);
      }

      // PAYTR'IN BEKLEDİĞİ KRİTİK YANIT:
      res.send('OK');
    } catch (error) {
      console.error('PayTR Callback Hatası:', error);
      res.status(500).send('Hata oluştu');
    }
  });

  // API route for registration notification
  app.post('/api/registration-notification', async (req, res) => {
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
  });

  // API route for temporary password code
  app.post('/api/auth/send-temp-code', async (req, res) => {
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
  });

  // API route for order notification
  app.post('/api/order-notification', async (req, res) => {
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

    // 1. Notification to Admin
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

    // 2. Confirmation to Customer
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
      // Send both emails
      await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(customerMailOptions)
      ]);
      res.status(200).json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
      console.error('Error sending order emails:', error);
      res.status(500).json({ success: false, message: 'Failed to send emails' });
    }
  });

  // 404 for unknown API routes
  app.use('/api/*', (req, res) => {
    console.warn(`404 API Route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ success: false, message: 'API Route Not Found' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
