import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

  try {
    const { merchant_oid, status, total_amount, hash } = req.body;

    console.log(`PayTR Callback received for Order: ${merchant_oid}, Status: ${status}`);

    if (merchant_key && merchant_salt) {
      const expectedHash = crypto
        .createHmac('sha256', merchant_key)
        .update(merchant_oid + merchant_salt + status + total_amount)
        .digest('base64');

      if (hash !== expectedHash) {
        console.error(`Hash mismatch for order ${merchant_oid}. Expected: ${expectedHash}, Received: ${hash}`);
        // Still send OK to stop retries if desired, or handle accordingly
      }
    }

    if (status === 'success') {
      console.log(`Ödeme Başarılı! Sipariş No: ${merchant_oid}`);
    } else {
      console.log(`Ödeme Başarısız! Sipariş No: ${merchant_oid}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayTR Callback Error:', error);
    res.status(500).send('Hata oluştu');
  }
}
