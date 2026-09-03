import Razorpay from 'razorpay';
import crypto from 'crypto';

export function razorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/**
 * Verifies the HMAC signature Razorpay returns after checkout.
 * NEVER mark an order paid based on the frontend response alone —
 * this check (or the webhook signature check) is mandatory server-side.
 */
export function verifyRazorpaySignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  return expected === razorpay_signature;
}
