const Stripe = require('stripe');

// Stripe webhook to verify payments
// Set this endpoint URL in Stripe Dashboard: https://speekly.vercel.app/api/webhook

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('Missing Stripe configuration');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // Verify webhook signature
        const rawBody = await getRawBody(req);
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('✅ Payment successful!', {
                sessionId: session.id,
                customerEmail: session.customer_email,
                amountTotal: session.amount_total,
                metadata: session.metadata
            });

            // TODO: Here you would update the user in Supabase
            // Example:
            // await supabase.from('users').update({ is_premium: true }).eq('email', session.customer_email);

            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('❌ Payment failed:', failedPayment.id);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
};

// Helper to get raw body for signature verification
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(Buffer.from(data)));
        req.on('error', reject);
    });
}

// Disable body parsing for webhooks (Stripe needs raw body)
module.exports.config = {
    api: {
        bodyParser: false,
    },
};
