const Stripe = require('stripe');

module.exports = async (req, res) => {
    // Debug logging
    console.log('Checkout API invoked');

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).send('Method Not Allowed');
    }

    // 1. Check Env Var explicitly inside the handler
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('CRITICAL: STRIPE_SECRET_KEY is missing in environment variables.');
        return res.status(500).json({
            error: 'Server misconfiguration: Payment provider key is missing.'
        });
    }

    try {
        // 2. Initialize Stripe lazily (inside handler) to prevent cold-start crashes
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const { successUrl, cancelUrl } = req.body;

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

        console.log('Session created successfully:', session.id);
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Stripe Execution Error:', error);
        res.status(500).json({ error: error.message });
    }
};
