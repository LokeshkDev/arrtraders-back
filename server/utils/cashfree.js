const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2025-01-01';

const getCashfreeBaseUrl = () => {
    return process.env.CASHFREE_ENV === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';
};

const getCashfreeHeaders = (idempotencyKey) => {
    const headers = {
        'Content-Type': 'application/json',
        'x-api-version': CASHFREE_API_VERSION,
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET
    };

    if (idempotencyKey) {
        headers['x-idempotency-key'] = idempotencyKey;
    }

    return headers;
};

export const isCashfreeConfigured = () => {
    return Boolean(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
};

export const createCashfreeOrder = async (payload, idempotencyKey) => {
    if (!isCashfreeConfigured()) {
        throw new Error('Cashfree credentials are not configured');
    }

    const response = await fetch(`${getCashfreeBaseUrl()}/orders`, {
        method: 'POST',
        headers: getCashfreeHeaders(idempotencyKey),
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        console.error('[CASHFREE ERROR RESPONSE]:', JSON.stringify(data, null, 2));
        throw new Error(data.message || data.error_description || 'Unable to create Cashfree order');
    }

    return data;
};

export const getCashfreeOrder = async (orderId) => {
    if (!isCashfreeConfigured()) {
        throw new Error('Cashfree credentials are not configured');
    }

    const response = await fetch(`${getCashfreeBaseUrl()}/orders/${encodeURIComponent(orderId)}`, {
        method: 'GET',
        headers: getCashfreeHeaders()
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || data.error_description || 'Unable to fetch Cashfree order');
    }

    return data;
};

export const getCashfreeMode = () => {
    return process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
};
