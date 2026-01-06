// Checkout API - Stripe integration removed
// This is a placeholder that informs users payment is disabled

module.exports = async (req, res) => {
    console.log('Checkout API Invoked. Method:', req.method);

    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 1. Allow GET requests for debugging
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'API Online 🟢',
            message: 'Checkout endpoint is reachable. Payment integration is currently disabled.',
            environment: process.env.NODE_ENV
        });
    }

    // 2. POST - Return info that payment is disabled
    if (req.method === 'POST') {
        return res.status(200).json({
            success: false,
            message: 'Payment integration is currently disabled. Please contact support.',
            url: null
        });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).send('Method Not Allowed');
};
