import crypto from 'crypto';

/**
 * QRISGate API client + webhook signature verification.
 *
 * Docs: https://qrisgate.web.id/docs
 *
 * IMPORTANT: this module must only ever be imported from server-side code.
 * QRISGATE_API_KEY is never exposed to the browser.
 */

const DEFAULT_BASE_URL = 'https://qrisgate.web.id';
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RATE_LIMIT_RETRIES = 2; // total attempts = 3

export class QrisgateError extends Error {
  constructor(message, { status = 0, code = 'QRISGATE_ERROR', details = null, retryable = false } = {}) {
    super(message);
    this.name = 'QrisgateError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryable = retryable;
  }
}

function getBaseUrl() {
  return (process.env.QRISGATE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function getApiKey() {
  const apiKey = process.env.QRISGATE_API_KEY;
  if (!apiKey) {
    throw new QrisgateError('QRISGATE_API_KEY belum diset di environment server', {
      code: 'MISSING_API_KEY',
    });
  }
  return apiKey;
}

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function toIntegerAmount(value) {
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new QrisgateError('Nominal harus berupa bilangan bulat Rupiah minimal 1', {
      status: 400,
      code: 'INVALID_AMOUNT',
    });
  }
  return amount;
}

function mapErrorResponse(status, body) {
  const gatewayMessage =
    body?.error?.message ||
    body?.error ||
    body?.message ||
    (typeof body === 'string' ? body : null);

  if (status === 402) {
    return new QrisgateError(
      'Saldo kredit merchant QRISGate habis. Silakan top up saldo di dashboard QRISGate.',
      {
        status,
        code: 'INSUFFICIENT_CREDIT',
        details: gatewayMessage,
      }
    );
  }

  if (status === 400) {
    return new QrisgateError(
      gatewayMessage
        ? `Validasi transaksi ditolak QRISGate: ${gatewayMessage}`
        : 'Validasi transaksi ditolak QRISGate.',
      {
        status,
        code: 'VALIDATION_ERROR',
        details: gatewayMessage,
      }
    );
  }

  if (status === 429) {
    return new QrisgateError('QRISGate sedang membatasi permintaan (rate limit).', {
      status,
      code: 'RATE_LIMITED',
      details: gatewayMessage,
      retryable: true,
    });
  }

  if (status === 401 || status === 403) {
    return new QrisgateError('QRISGate menolak autentikasi. Periksa QRISGATE_API_KEY.', {
      status,
      code: 'AUTH_ERROR',
      details: gatewayMessage,
    });
  }

  return new QrisgateError(
    gatewayMessage ? `QRISGate error: ${gatewayMessage}` : 'QRISGate mengembalikan error.',
    {
      status,
      code: 'GATEWAY_ERROR',
      details: gatewayMessage,
    }
  );
}

async function request(path, { method = 'GET', body, fetchImpl, sleep, maxRateLimitRetries } = {}) {
  const doFetch = fetchImpl || globalThis.fetch;
  if (typeof doFetch !== 'function') {
    throw new QrisgateError('Fetch API tidak tersedia di runtime server', {
      code: 'FETCH_UNAVAILABLE',
    });
  }

  const url = `${getBaseUrl()}${path}`;
  const apiKey = getApiKey();
  const retries = Number.isInteger(maxRateLimitRetries)
    ? maxRateLimitRetries
    : MAX_RATE_LIMIT_RETRIES;

  let attempt = 0;
  while (true) {
    attempt += 1;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await doFetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal,
      });
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new QrisgateError('Permintaan ke QRISGate melebihi batas waktu.', {
          code: 'TIMEOUT',
          retryable: true,
        });
      }
      throw new QrisgateError(
        `Gagal menghubungi QRISGate: ${error?.message || 'network error'}`,
        { code: 'NETWORK_ERROR', retryable: true }
      );
    } finally {
      clearTimeout(timeout);
    }

    let parsedBody = null;
    const rawText = await response.text().catch(() => '');
    if (rawText) {
      try {
        parsedBody = JSON.parse(rawText);
      } catch {
        parsedBody = rawText;
      }
    }

    if (response.ok) {
      return parsedBody;
    }

    const gatewayError = mapErrorResponse(response.status, parsedBody);

    // 429 = rate limit. Retry with exponential backoff before giving up.
    if (response.status === 429 && attempt <= retries) {
      const waitMs = 500 * Math.pow(2, attempt - 1);
      await (sleep || defaultSleep)(waitMs);
      continue;
    }

    throw gatewayError;
  }
}

/**
 * Create a QRISGate transaction.
 *
 * @returns {Promise<object>} the `data` object from QRISGate:
 *   { transaction_id, external_order_id, base_amount, unique_code,
 *     total_amount, qr_string, checkout_url, expires_at, ... }
 */
export async function createQrisgateTransaction(
  { externalOrderId, amount, customerName, returnUrl, paymentMethod, bankCode, includeQrImage },
  options = {}
) {
  if (!externalOrderId || typeof externalOrderId !== 'string') {
    throw new QrisgateError('external_order_id wajib diisi', {
      status: 400,
      code: 'INVALID_ORDER_ID',
    });
  }

  const payload = {
    external_order_id: externalOrderId,
    amount: toIntegerAmount(amount),
  };

  if (customerName) payload.customer_name = String(customerName).slice(0, 100);
  if (returnUrl) payload.return_url = returnUrl;
  if (paymentMethod) payload.payment_method = paymentMethod;
  if (paymentMethod === 'BANK_TRANSFER' && bankCode) payload.bank_code = bankCode;
  if (includeQrImage) payload.include_qr_image = true;

  const json = await request('/api/v1/transactions', {
    method: 'POST',
    body: payload,
    ...options,
  });

  const totalAmount = Number(json?.data?.total_amount);

  if (
    !json?.success ||
    !json?.data?.checkout_url ||
    !json?.data?.transaction_id ||
    !Number.isSafeInteger(totalAmount) ||
    totalAmount < 1
  ) {
    throw new QrisgateError('Respons QRISGate tidak valid (checkout_url/total_amount tidak valid).', {
      code: 'INVALID_RESPONSE',
      details: json,
    });
  }

  return json.data;
}

/**
 * Fetch a QRISGate transaction by its transaction_id.
 * Used as a webhook fallback on the order status page.
 */
export async function getQrisgateTransaction(transactionId, options = {}) {
  if (!transactionId) {
    throw new QrisgateError('transaction_id wajib diisi', {
      status: 400,
      code: 'INVALID_TRANSACTION_ID',
    });
  }

  const json = await request(`/api/v1/transactions/${encodeURIComponent(transactionId)}`, {
    method: 'GET',
    ...options,
  });

  if (!json?.data) {
    throw new QrisgateError('Respons status QRISGate tidak valid.', {
      code: 'INVALID_RESPONSE',
      details: json,
    });
  }

  return json.data;
}

/**
 * Build the hex HMAC-SHA256 signature for QRISGate webhooks.
 * Supports both:
 *   - createWebhookSignature(rawBody, secret) -> HMAC_SHA256(rawBody, secret)
 *   - createWebhookSignature(rawBody, timestamp, secret) -> HMAC_SHA256(timestamp + "." + rawBody, secret)
 */
export function createWebhookSignature(rawBody, timestampOrSecret, maybeSecret) {
  const body = Buffer.isBuffer(rawBody)
    ? rawBody
    : Buffer.from(String(rawBody ?? ''), 'utf8');

  if (maybeSecret === undefined) {
    const secret = timestampOrSecret;
    return crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  }

  const timestamp = timestampOrSecret;
  const secret = maybeSecret;
  return crypto
    .createHmac('sha256', secret)
    .update(String(timestamp) + '.')
    .update(body)
    .digest('hex');
}

function timingSafeHexEqual(expectedHex, providedBuffer) {
  const expectedBuffer = Buffer.from(expectedHex, 'hex');
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

/**
 * Verify a QRISGate webhook signature with timing-safe comparison and a
 * 5-minute replay window.
 *
 * Accepts both:
 *   - HMAC-SHA256(timestamp + "." + rawBody, secret) (QRISGate docs)
 *   - HMAC-SHA256(rawBody, secret) (direct raw-body HMAC)
 *
 * @param {object} args
 * @param {Buffer|string} args.rawBody exact request bytes
 * @param {string|number} args.timestamp X-QRISGate-Timestamp (unix seconds or ISO timestamp)
 * @param {string} args.signature X-QRISGate-Signature (hex, optional sha256= prefix)
 * @param {string} args.secret QRISGATE_WEBHOOK_SECRET
 * @param {number} [args.now] current time in ms (injectable for tests)
 * @returns {{ valid: boolean, reason?: string }}
 */
export function verifyWebhookSignature({ rawBody, timestamp, signature, secret, now = Date.now() }) {
  if (!secret) return { valid: false, reason: 'missing_secret' };
  if (timestamp === undefined || timestamp === null || timestamp === '') {
    return { valid: false, reason: 'missing_timestamp' };
  }
  if (!signature) return { valid: false, reason: 'missing_signature' };

  let timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    const parsedMs = Date.parse(String(timestamp));
    if (Number.isFinite(parsedMs)) {
      timestampSeconds = Math.floor(parsedMs / 1000);
    }
  } else if (timestampSeconds > 1e12) {
    // Handle millisecond unix timestamps gracefully
    timestampSeconds = Math.floor(timestampSeconds / 1000);
  }

  if (!Number.isFinite(timestampSeconds) || !Number.isInteger(timestampSeconds)) {
    return { valid: false, reason: 'invalid_timestamp' };
  }

  const nowSeconds = Math.floor(now / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > 300) {
    return { valid: false, reason: 'stale_timestamp' };
  }

  const providedHex = String(signature).trim().replace(/^sha256=/i, '');
  if (!/^[0-9a-f]{64}$/i.test(providedHex)) {
    return { valid: false, reason: 'invalid_signature_format' };
  }
  const provided = Buffer.from(providedHex, 'hex');

  const expectedWithTimestampHex = createWebhookSignature(rawBody, timestamp, secret);
  const expectedRawOnlyHex = createWebhookSignature(rawBody, secret);

  const validWithTimestamp = timingSafeHexEqual(expectedWithTimestampHex, provided);
  const validRawOnly = timingSafeHexEqual(expectedRawOnlyHex, provided);

  return validWithTimestamp || validRawOnly
    ? { valid: true }
    : { valid: false, reason: 'invalid_signature' };
}

/**
 * Convert a QRISGate error into an HTTP response payload + status for our API.
 */
export function qrisgateErrorResponse(error) {
  const code = error?.code || 'GATEWAY_ERROR';
  const message = error?.message || 'Gagal memproses pembayaran';

  let status = 502;
  if (code === 'INSUFFICIENT_CREDIT') status = 402;
  else if (code === 'VALIDATION_ERROR') status = 400;
  else if (code === 'RATE_LIMITED') status = 429;
  else if (code === 'MISSING_API_KEY') status = 500;
  else if (code === 'INVALID_AMOUNT' || code === 'INVALID_ORDER_ID') status = 400;

  return {
    status,
    body: {
      success: false,
      error: message,
      code,
    },
  };
}
