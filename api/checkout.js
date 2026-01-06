const Stripe = require('stripe');

// Safe entry point for Vercel Serverless Function
module.exports = async (req, res) => {
    console.log('Checkout API Invoked. Method:', req.method);

    // 1. Allow GET requests for debugging (so you can open it in browser)
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'API Online 🟢',
            message: 'Checkout endpoint is reachable.',
            environment: process.env.NODE_ENV
        });
    }

    // 2. Enforce POST for actual payments
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).send('Method Not Allowed');
    }

    // 3. Verify Stripe Key exists
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('CRITICAL: Missing STRIPE_SECRET_KEY');
        return res.status(500).json({ error: 'Server misconfiguration: Stripe Key missing.' });
    }

    try {
        // 4. Initialize Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const { successUrl, cancelUrl } = req.body;

        // 5. Create Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Speekly Lifetime Access',
                            description: 'Unlimited AI Speech Therapy',
                            images: ['https://speekly.vercel.app/icon-192.jpg'],
                        },
                        unit_amount: 10000, // $100.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl || 'https://speekly.vercel.app/?success=true',
            cancel_url: cancelUrl || 'https://speekly.vercel.app/?canceled=true',
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Stripe Exception:', error);
        res.status(500).json({ error: error.message });
    }
};
