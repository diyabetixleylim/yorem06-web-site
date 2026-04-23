import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  try {
    const { items, customerInfo, total } = req.body;

    if (!merchant_id || !merchant_key || !merchant_salt) {
      console.error('CRITICAL ERROR: PayTR credentials missing in environment!');
      return res.status(500).json({ 
        success: false, 
        message: `PayTR Yapılandırma Hatası: Sunucu tarafında anahtarlar eksik!` 
      });
    }

    const merchant_oid = 'YOREM' + Date.now();
    let user_ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    if (user_ip.includes(',')) {
      user_ip = user_ip.split(',')[0].trim();
    }
    if (user_ip.startsWith('::ffff:')) {
      user_ip = user_ip.substring(7);
    }

    const email = customerInfo.email;
    const payment_amount = Math.round(total * 100);

    const basketItems = items.map((item: any) => [
      item.name,
      item.price.toString(),
      item.quantity
    ]);
    const user_basket = Buffer.from(JSON.stringify(basketItems)).toString('base64');

    const merchant_ok_url = `${APP_URL}/cart?status=success`;
    const merchant_fail_url = `${APP_URL}/cart?status=fail`;
    const timeout_limit = "30";
    const debug_on = "1";
    const test_mode = "0"; 
    const no_installment = "0"; 
    const max_installment = "0"; 
    const currency = "TL";

    const hashStr = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
    const paytr_token = crypto
      .createHmac('sha256', merchant_key)
      .update(hashStr + merchant_salt)
      .digest('base64');

    const params: any = {
      merchant_id,
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
      res.status(200).json({ success: true, token: data.token });
    } else {
      res.status(400).json({ success: false, message: data.reason });
    }
  } catch (error) {
    console.error('PayTR Initialize Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
