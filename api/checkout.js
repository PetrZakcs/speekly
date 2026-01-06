const Stripe = require('stripe');

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET - Health check
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'Stripe API Online 🟢',
            configured: !!process.env.STRIPE_SECRET_KEY
        });
    }

    // POST - Create checkout session
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('Missing STRIPE_SECRET_KEY');
        return res.status(500).json({ error: 'Payment system not configured' });
    }

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { email, successUrl, cancelUrl } = req.body;

        // Get the origin for redirect URLs
        const origin = req.headers.origin || 'https://speekly.vercel.app';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email || undefined,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Speekly Lifetime Access',
                            description: 'Unlimited AI Speech Therapy - One-time payment',
                            images: [`${origin}/icon.png`],
                        },
                        unit_amount: 10000, // $100.00 in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl || `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${origin}/?payment=canceled`,
            metadata: {
                product: 'lifetime_access',
                email: email || 'anonymous'
            }
        });

        console.log('Checkout session created:', session.id);
        return res.status(200).json({
            url: session.url,
            sessionId: session.id
        });

    } catch (error) {
        console.error('Stripe Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
