module.exports = (req, res) => {
    const result = {
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    };

    try {
        const Stripe = require('stripe');
        result.stripeLibrary = 'Loaded successfully';
        result.stripeVersion = require('stripe/package.json').version;
    } catch (e) {
        result.stripeLibrary = 'Failed to load';
        result.error = e.message;
    }

    res.status(200).json(result);
};
