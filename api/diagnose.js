// Diagnose API - System status check

module.exports = (req, res) => {
    const result = {
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        services: {
            openai: !!process.env.OPENAI_API_KEY,
            stripe: !!process.env.STRIPE_SECRET_KEY,
            stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
            supabaseUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseKey: !!process.env.EXPO_PUBLIC_SUPABASE_KEY
        },
        status: 'OK'
    };

    res.status(200).json(result);
};
