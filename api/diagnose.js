// Diagnose API - System status check

module.exports = (req, res) => {
    const result = {
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasSupabaseUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
        status: 'OK'
    };

    res.status(200).json(result);
};
