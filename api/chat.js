export default async function handler(req, res) {
    // 1. CORS Headers (Security)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. Validate Method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { messages, model } = req.body;

        // 3. Get Key Safely
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Server misconfigured: No API Key." });
        }

        // 4. Call OpenAI
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || "gpt-3.5-turbo",
                messages: messages
            })
        });

        const data = await aiResponse.json();

        // 5. Send back to App
        res.status(200).json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
