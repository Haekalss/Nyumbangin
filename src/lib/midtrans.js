import midtransClient from 'midtrans-client';

// Initialize Midtrans Snap instance
// Expect env vars: MIDTRANS_SERVER_KEY, NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, MIDTRANS_PRODUCTION ('true'|'false')
const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

if (!serverKey) {
  console.warn('[Midtrans] MIDTRANS_SERVER_KEY is not set');
}
if (!clientKey) {
  console.warn('[Midtrans] NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is not set');
}

export function getSnap() {
  const envFlag = process.env.MIDTRANS_PRODUCTION === 'true';
  if (envFlag) {
    console.warn('[Midtrans] Forcing SANDBOX mode despite MIDTRANS_PRODUCTION=true as per current configuration request');
  }
  return new midtransClient.Snap({
    isProduction: false, // forced sandbox
    serverKey,
    clientKey
  });
}

export const MIDTRANS_CLIENT_KEY = clientKey;
