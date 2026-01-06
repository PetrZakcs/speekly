const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { priceId, successUrl, cancelUrl } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Speekly Lifetime Access', // Hardcoded product for simplicity
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
        console.error('Stripe Error:', error);
        res.status(500).json({ error: error.message });
    }
};
