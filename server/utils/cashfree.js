const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2025-01-01';

class CashfreeError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'CashfreeError';
        this.status = status;
        this.data = data;
    }
}

const getEnvValue = (key) => String(process.env[key] || '').trim();

const getCashfreeBaseUrl = () => {
    return getEnvValue('CASHFREE_ENV') === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';
};

const getCashfreeHeaders = (idempotencyKey) => {
    const headers = {
        'Content-Type': 'application/json',
        'x-api-version': CASHFREE_API_VERSION,
        'x-client-id': getEnvValue('CASHFREE_CLIENT_ID'),
        'x-client-secret': getEnvValue('CASHFREE_CLIENT_SECRET')
    };

    if (idempotencyKey) {
        headers['x-idempotency-key'] = idempotencyKey;
    }

    return headers;
};

export const isCashfreeConfigured = () => {
    const clientId = getEnvValue('CASHFREE_CLIENT_ID');
    const clientSecret = getEnvValue('CASHFREE_CLIENT_SECRET');

    return Boolean(
        clientId &&
        clientSecret &&
        !clientId.startsWith('replace-with-') &&
        !clientSecret.startsWith('replace-with-')
    );
};

export const getCashfreeConfigSummary = () => ({
    env: getEnvValue('CASHFREE_ENV') || 'sandbox',
    baseUrl: getCashfreeBaseUrl(),
    apiVersion: CASHFREE_API_VERSION,
    hasClientId: Boolean(getEnvValue('CASHFREE_CLIENT_ID')),
    hasClientSecret: Boolean(getEnvValue('CASHFREE_CLIENT_SECRET'))
});

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
        throw new CashfreeError(data.message || data.error_description || 'Unable to create Cashfree order', response.status, data);
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
        throw new CashfreeError(data.message || data.error_description || 'Unable to fetch Cashfree order', response.status, data);
    }

    return data;
};

export const getCashfreeMode = () => {
    return getEnvValue('CASHFREE_ENV') === 'production' ? 'production' : 'sandbox';
};
